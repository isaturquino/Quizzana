import { supabase } from "./supabaseClient";

/**
 * Cria um novo quiz completo com configurações e questões
 */
export const createQuiz = async (quizData, configuracoes, questoesSelecionadas) => {
  try {
    // 1. PRIMEIRO - Inserir as Configurações na tabela 'configuracoes_quiz'
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

    // 2. DEPOIS - Inserir o Quiz na tabela 'quiz' com o id_configuracoes
    const { data: quizCreated, error: quizError } = await supabase
      .from("quiz")
      .insert([
        {
          titulo: quizData.nome,
          descricao: quizData.descricao,
          ativo: true,
          id_configuracoes: configId, // Relacionamento com configurações
        },
      ])
      .select()
      .single();

    if (quizError) throw quizError;

    const quizId = quizCreated.id;

    // 3. Inserir as Questões Selecionadas na tabela 'quiz_questoes'
    if (questoesSelecionadas && questoesSelecionadas.length > 0) {
      const quizQuestoes = questoesSelecionadas.map((questaoId) => ({
        id_quiz: quizId,
        id_questao: questaoId,
      }));

      const { error: questoesError } = await supabase
        .from("quiz_questoes")
        .insert(quizQuestoes);

      if (questoesError) throw questoesError;
    }

    return { success: true, quizId, data: quizCreated };
  } catch (error) {
    console.error("Erro ao criar quiz:", error);
    return { success: false, error };
  }
};

/**
 * Busca todos os quizzes com paginação e informações completas
 */
export const getQuizzes = async (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

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
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Erro ao buscar quizzes:", error);
    throw error;
  }

  return {
    quizzes: data,
    totalPages: Math.ceil(count / limit),
    total: count,
  };
};

/**
 * Busca um quiz específico com todas as informações
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

  if (error) {
    console.error("Erro ao buscar quiz:", error);
    throw error;
  }

  return data;
};

/**
 * Atualiza um quiz existente
 */
export const updateQuiz = async (quizId, quizData, configuracoes, questoesSelecionadas) => {
  try {
    // 1. Buscar o id_configuracoes do quiz
    const { data: quizInfo, error: fetchError } = await supabase
      .from("quiz")
      .select("id_configuracoes")
      .eq("id", quizId)
      .single();

    if (fetchError) throw fetchError;

    const configId = quizInfo.id_configuracoes;

    // 2. Atualizar configurações
    const { error: configError } = await supabase
      .from("configuracoes_quiz")
      .update({
        tempo_limite: configuracoes.tempoMax,
        numero_questoes: configuracoes.numeroQuestoes,
        pontuacao_por_acerto: configuracoes.pontosPorQuestao,
        maximo_participantes: configuracoes.maxParticipantes,
      })
      .eq("id", configId);

    if (configError) throw configError;

    // 3. Atualizar informações básicas do quiz
    const { error: quizError } = await supabase
      .from("quiz")
      .update({
        titulo: quizData.nome,
        descricao: quizData.descricao,
      })
      .eq("id", quizId);

    if (quizError) throw quizError;

    // 3. Atualizar questões (deletar antigas e inserir novas)
    if (questoesSelecionadas) {
      // Deletar questões antigas
      const { error: deleteError } = await supabase
        .from("quiz_questoes")
        .delete()
        .eq("id_quiz", quizId);

      if (deleteError) throw deleteError;

      // Inserir novas questões
      if (questoesSelecionadas.length > 0) {
        const quizQuestoes = questoesSelecionadas.map((questaoId) => ({
          id_quiz: quizId,
          id_questao: questaoId,
        }));

        const { error: insertError } = await supabase
          .from("quiz_questoes")
          .insert(quizQuestoes);

        if (insertError) throw insertError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar quiz:", error);
    return { success: false, error };
  }
};

/**
 * Deleta um quiz (e suas configurações/questões em cascata)
 */
export const deleteQuiz = async (quizId) => {
  try {
    // Buscar o id_configuracoes antes de deletar
    const { data: quizInfo } = await supabase
      .from("quiz")
      .select("id_configuracoes")
      .eq("id", quizId)
      .single();

    const configId = quizInfo?.id_configuracoes;

    // 1. Deletar questões associadas
    await supabase.from("quiz_questoes").delete().eq("id_quiz", quizId);

    // 2. Deletar o quiz
    const { error } = await supabase.from("quiz").delete().eq("id", quizId);

    if (error) throw error;

    // 3. Deletar configurações (se existir)
    if (configId) {
      await supabase.from("configuracoes_quiz").delete().eq("id", configId);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar quiz:", error);
    return { success: false, error };
  }
};

/**
 * Ativa ou desativa um quiz
 */
export const toggleQuizStatus = async (quizId, ativo) => {
  const { error } = await supabase
    .from("quiz")
    .update({ ativo })
    .eq("id", quizId);

  if (error) {
    console.error("Erro ao alterar status do quiz:", error);
    throw error;
  }

  return { success: true };
};