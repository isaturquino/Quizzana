import { supabase } from "./supabaseClient";
import { createSala } from "./salaService";

function gerarCodigoSala() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Cria um novo quiz completo com configurações, questões e SALA
 * Automaticamente associa ao usuário logado
 */
export const createQuiz = async (
  quizData,
  configuracoes,
  questoesSelecionadas,
  userId
) => {
  try {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // 1. Criar configurações (agora com as flags)
    const { data: configCreated, error: configError } = await supabase
      .from("configuracoes_quiz")
      .insert([
        {
          tempo_limite: configuracoes.tempoMax,
          numero_questoes: configuracoes.numeroQuestoes,
          pontuacao_por_acerto: configuracoes.pontosPorQuestao,
          maximo_participantes: configuracoes.maxParticipantes,
          // embaralhar_questoes: configuracoes.embaralharQuestoes,
          // selecao_aleatoria: configuracoes.selecaoAleatoria,
        },
      ])
      .select()
      .single();

    if (configError) throw configError;
    const configId = configCreated.id;

    // 2. Criar quiz
    const { data: quizCreated, error: quizError } = await supabase
      .from("quiz")
      .insert([
        {
          titulo: quizData.nome,
          descricao: quizData.descricao,
          ativo: true,
          id_configuracoes: configId,
          id_user: userId,
        },
      ])
      .select()
      .single();

    if (quizError) throw quizError;
    const quizId = quizCreated.id;

    // 3. Inserir questões
    if (questoesSelecionadas?.length > 0) {
      const quizQuestoes = questoesSelecionadas.map((id) => ({
        id_quiz: quizId,
        id_questao: id,
      }));

      const { error } = await supabase
        .from("quiz_questoes")
        .insert(quizQuestoes);

      if (error) throw error;
    }

    // 4. CRIAR SALA
    const codigoSala = gerarCodigoSala();

    await createSala({
      quizId,
      codigoSala,
    });

    return {
      success: true,
      quizId,
      codigoSala,
      data: quizCreated,
    };
  } catch (error) {
    console.error("Erro ao criar quiz:", error);
    return { success: false, error };
  }
};

/**
 * Busca quizzes do usuário
 */
export const getQuizzes = async (page = 1, limit = 10, userId) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error, count } = await supabase
    .from("quiz")
    .select(
      `
            id,
            titulo,
            descricao,
            ativo,
            created_at,
            configuracoes_quiz (
                tempo_limite,
                numero_questoes,
                pontuacao_por_acerto,
                maximo_participantes
            )
        `,
      { count: "exact" }
    )
    .eq("id_user", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    quizzes: data,
    totalPages: Math.ceil(count / limit),
    total: count,
  };
};

/**
 * Busca quiz por ID
 */
export const getQuizById = async (quizId) => {
  const { data, error } = await supabase
    .from("quiz")
    .select(
      `
            id,
            titulo,
            descricao,
            ativo,
            created_at,
            configuracoes_quiz (
                tempo_limite,
                numero_questoes,
                pontuacao_por_acerto,
                maximo_participantes
            ),
            quiz_questoes (
                id_questao,
                questoes (
                    id,
                    enunciado,
                    alternativaA,
                    alternativaB,
                    alternativaC,
                    alternativaD,
                    respostaCorreta,
                    categoria (nome)
                )
            )
        `
    )
    .eq("id", quizId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Atualiza quiz
 */
export const updateQuiz = async (
  quizId,
  quizData,
  configuracoes,
  questoesSelecionadas
) => {
  try {
    const { data: quizInfo } = await supabase
      .from("quiz")
      .select("id_configuracoes")
      .eq("id", quizId)
      .single();

    const configId = quizInfo.id_configuracoes;

    await supabase
      .from("configuracoes_quiz")
      .update({
        tempo_limite: configuracoes.tempoMax,
        numero_questoes: configuracoes.numeroQuestoes,
        pontuacao_por_acerto: configuracoes.pontosPorQuestao,
        maximo_participantes: configuracoes.maxParticipantes,
        // embaralhar_questoes: configuracoes.embaralharQuestoes,
        // selecao_aleatoria: configuracoes.selecaoAleatoria,
      })
      .eq("id", configId);

    await supabase
      .from("quiz")
      .update({
        titulo: quizData.nome,
        descricao: quizData.descricao,
      })
      .eq("id", quizId);

    await supabase.from("quiz_questoes").delete().eq("id_quiz", quizId);

    if (questoesSelecionadas?.length > 0) {
      const quizQuestoes = questoesSelecionadas.map((id) => ({
        id_quiz: quizId,
        id_questao: id,
      }));
      await supabase.from("quiz_questoes").insert(quizQuestoes);
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};
/**
 * Deleta quiz e todos os dados relacionados
 * A tabela 'resultado', 'jogador' e 'resposta' são deletadas via 'id_sala'.
 */
export const deleteQuiz = async (quizId) => {
    try {
        console.log("Iniciando exclusão do quiz:", quizId);

        //1️ BUSCA INICIAL: ID da Configuração e ID da Sala (tentativa 1 via relacionamento)
        const { data: quizData, error: quizError } = await supabase
            .from("quiz")
            .select(`
                id_configuracoes, 
                sala (id) // Busca o ID da sala (relacionamento 1:1)
            `)
            .eq("id", quizId)
            .single();

        if (quizError) throw quizError;
        if (!quizData) {
            console.warn(`Quiz com ID ${quizId} não encontrado.`);
            return { success: true, message: "Quiz não encontrado." };
        }

        const configId = quizData.id_configuracoes;
        let finalSalaId = quizData.sala?.[0]?.id || null;
        
        // 2️ BUSCA DE CONTINGÊNCIA: Garante que o ID da sala é obtido
        // Isso resolve o problema de Foreign Key se o relacionamento aninhado falhar.
        if (!finalSalaId) {
            const { data: salaDirectData } = await supabase
                .from("sala")
                .select("id")
                .eq("id_quiz", quizId)
                .maybeSingle(); // Assumimos que a sala é única

            if (salaDirectData) {
                finalSalaId = salaDirectData.id;
            }
        }

        const deletePromises = [];
        
        // 3️ DELETAR FILHOS DA SALA (Respostas, Jogadores, Resultados)
        if (finalSalaId) {
            // 3.1 - Deletar respostas (FILHO DIRETO DA SALA)
            deletePromises.push(
                supabase.from("resposta").delete().eq("id_sala", finalSalaId)
            );
            // 3.2 - Deletar jogadores (FILHO DIRETO DA SALA)
            deletePromises.push(
                supabase.from("jogador").delete().eq("id_sala", finalSalaId)
            );
            // 3.3 - Deletar resultados (FILHO DIRETO DA SALA)
            deletePromises.push(
                supabase.from("resultado").delete().eq("id_sala", finalSalaId)
            );
        }

        // 4️ DELETAR FILHOS DO QUIZ
        
        // 4.1 - Deletar quiz_questoes (tabela de ligação filho de Quiz)
        deletePromises.push(
            supabase.from("quiz_questoes").delete().eq("id_quiz", quizId)
        );
        
        //  EXECUTA TODAS AS EXCLUSÕES DE FILHOS EM PARALELO
        const results = await Promise.all(deletePromises);
        
        //  VERIFICA ERROS NAS OPERAÇÕES PARALELAS
        results.forEach((result) => {
            if (result.error) {
                console.error("Erro em uma exclusão paralela:", result.error);
                throw result.error; 
            }
        });
        
        // 5️ DELETAR O PAI DIRETO (SALA)
        if (finalSalaId) {
            const { error: salasDeleteError } = await supabase
                .from("sala")
                .delete()
                .eq("id", finalSalaId); 

            if (salasDeleteError) throw salasDeleteError;
        }

        // 6️ DELETAR O PAI (QUIZ) - Só é possível se a sala for deletada ou não existir.
        const { error: deleteQuizError } = await supabase
            .from("quiz")
            .delete()
            .eq("id", quizId);

        if (deleteQuizError) {
             console.error("Erro ao deletar Quiz (ID Principal):", deleteQuizError);
             throw deleteQuizError;
        }

        // 7️ DELETAR (CONFIGURAÇÕES)
        if (configId) {
            const { error: configError } = await supabase
                .from("configuracoes_quiz")
                .delete()
                .eq("id", configId);

            if (configError) throw configError;
        }

        console.log("Quiz deletado com sucesso!");
        return { success: true };
    } catch (error) {
        console.error("Erro geral ao deletar quiz:", error);
        return { success: false, error };
    }
};

/**
 * Ativa/desativa quiz
 */
export const toggleQuizStatus = async (quizId, ativo) => {
  await supabase.from("quiz").update({ ativo }).eq("id", quizId);
  return { success: true };
};

/**
 * Dashboard - Carrega dados do usuário
 */
export async function loadUserDashboardData(userId) {
  if (!userId) throw new Error("Usuário inválido");

  try {
    // 1️ BUSCAR TODOS OS QUIZZES DO USUÁRIO
    const { data: quizzesData, count: totalQuizzes, error: quizzesError } = await supabase
      .from("quiz")
      .select(`
        id, 
        titulo, 
        ativo, 
        created_at,
        configuracoes_quiz (
          numero_questoes,
          maximo_participantes
        )
      `, { count: "exact" })
      .eq("id_user", userId)
      .order("created_at", { ascending: false });

    if (quizzesError) throw quizzesError;

    // 2️ CONTAR QUESTÕES NO BANCO
    const { count: totalQuestoes } = await supabase
      .from("questoes")
      .select("id", { count: "exact" });

    // 3️ FILTRAR QUIZZES ATIVOS
    const activeQuizzes = quizzesData?.filter((q) => q.ativo) || [];
    const quizzesAtivos = activeQuizzes.length;

    // 4️ PEGAR ÚLTIMOS 5 QUIZZES CRIADOS
    const recentQuizzes = quizzesData?.slice(0, 5) || [];

    return {
      stats: { 
        totalQuizzes: totalQuizzes || 0, 
        totalQuestoes: totalQuestoes || 0, 
        quizzesAtivos 
      },
      activeQuizzes,
      recentQuizzes,
    };
  } catch (error) {
    console.error("Erro em loadUserDashboardData:", error);
    return {
      stats: { 
        totalQuizzes: 0, 
        totalQuestoes: 0, 
        quizzesAtivos: 0 
      },
      activeQuizzes: [],
      recentQuizzes: [],
    };
  }
}