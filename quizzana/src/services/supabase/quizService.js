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

    // 1. Criar configurações
    const { data: configCreated, error: configError } = await supabase
      .from("configuracoes_quiz")
      .insert([
        {
          tempo_limite: configuracoes.tempoMax,
          numero_questoes: configuracoes.numeroQuestoes,
          pontuacao_por_acerto: configuracoes.pontosPorQuestao,
          maximo_participantes: configuracoes.maxParticipantes,
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

    // 4.  CRIAR SALA

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
 * Deleta quiz
 */
export const deleteQuiz = async (quizId) => {
  try {
    const { data } = await supabase
      .from("quiz")
      .select("id_configuracoes")
      .eq("id", quizId)
      .single();

    const configId = data?.id_configuracoes;

    await supabase.from("quiz_questoes").delete().eq("id_quiz", quizId);
    await supabase.from("sala").delete().eq("id_quiz", quizId);
    await supabase.from("quiz").delete().eq("id", quizId);

    if (configId) {
      await supabase.from("configuracoes_quiz").delete().eq("id", configId);
    }

    return { success: true };
  } catch (error) {
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
 * Dashboard
 */
export async function loadUserDashboardData(userId) {
  if (!userId) throw new Error("Usuário inválido");

  const { data: quizzesData, count: totalQuizzes } = await supabase
    .from("quiz")
    .select("id, ativo", { count: "exact" })
    .eq("id_user", userId);

  const { count: totalQuestoes } = await supabase
    .from("questoes")
    .select("id", { count: "exact" });

  const quizzesAtivos = quizzesData?.filter((q) => q.ativo).length || 0;

  return {
    stats: { totalQuizzes, totalQuestoes, quizzesAtivos },
  };
}
