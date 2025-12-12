import { supabase } from "./supabaseClient";

/**
 * Cria um novo quiz completo com configurações e questões
 * Automaticamente associa ao usuário logado
 */
export const createQuiz = async (quizData, configuracoes, questoesSelecionadas, userId) => {
    try {
        // Validar se tem userId
        if (!userId) {
            throw new Error("Usuário não autenticado");
        }

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

        // 2. DEPOIS - Inserir o Quiz na tabela 'quiz' com o id_configuracoes E id_user
        const { data: quizCreated, error: quizError } = await supabase
            .from("quiz")
            .insert([
                {
                    titulo: quizData.nome,
                    descricao: quizData.descricao,
                    ativo: true,
                    id_configuracoes: configId, // Relacionamento com configurações
                    id_user: userId, // ADICIONA O ID DO USUÁRIO
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
 * Filtra apenas os quizzes do usuário logado
 */
export const getQuizzes = async (page = 1, limit = 10, userId) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Validar se tem userId
    if (!userId) {
        throw new Error("Usuário não autenticado");
    }

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
        .eq("id_user", userId) // FILTRA APENAS QUIZZES DO USUÁRIO
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
                pontuacao_por_questao,
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


// 🚨 NOVO SERVIÇO PARA O DASHBOARD 🚨

/**
 * Busca estatísticas e dados de quizzes criados APENAS pelo usuário logado para o Dashboard.
 * @param {string} userId - O ID do usuário logado (UID do Supabase).
 */
export async function loadUserDashboardData(userId) {
    if (!userId) {
        throw new Error("ID do usuário é necessário para carregar o dashboard.");
    }

    try {
        // ------------------------------------
        // 1. ESTATÍSTICAS (Filtradas pelo usuário)
        // ------------------------------------
        
        // Busca quizzes do usuário para estatísticas
        const { data: quizzesData, count: totalQuizzes, error: quizError } = await supabase
            .from('quiz')
            .select('id, ativo', { count: 'exact' })
            .eq('id_user', userId); // FILTRO PRINCIPAL

        if (quizError) throw quizError;

        // Busca questões totais no banco (mantida busca geral)
        const { count: totalQuestoes, error: questoesError } = await supabase
            .from('questoes')
            .select('id', { count: 'exact' });

        if (questoesError) throw questoesError;

        const quizzesAtivos = quizzesData?.filter(q => q.ativo).length || 0;


        // ------------------------------------
        // 2. QUIZZES ATIVOS (Filtrados pelo usuário)
        // ------------------------------------
        const { data: activeData, error: activeError } = await supabase
            .from('quiz')
            .select(`
                id,
                titulo,
                configuracoes_quiz (
                    maximo_participantes
                )
            `)
            .eq('id_user', userId) // FILTRO
            .eq('ativo', true)
            .order('created_at', { ascending: false })
            .limit(3);

        if (activeError) throw activeError;

        // ------------------------------------
        // 3. ÚLTIMOS QUIZZES CRIADOS (Filtrados pelo usuário)
        // ------------------------------------
        const { data: recentData, error: recentError } = await supabase
            .from('quiz')
            .select(`
                id,
                titulo,
                configuracoes_quiz (
                    numero_questoes
                )
            `)
            .eq('id_user', userId) // FILTRO
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentError) throw recentError;
        
        // Retorna todos os dados de forma estruturada
        return {
            stats: {
                totalQuizzes,
                totalQuestoes,
                quizzesAtivos
            },
            activeQuizzes: activeData || [],
            recentQuizzes: recentData || []
        };
    } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error);
        throw error;
    }
}