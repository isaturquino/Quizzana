import { supabase } from "./supabaseClient";

/**
 *  Busca o ID do Quiz a partir do ID da Sala. Necessário para checagem de Admin.
 */
const getQuizIdFromSalaId = async (salaId) => {
    const { data, error } = await supabase
        .from("sala")
        .select("id_quiz")
        .eq("id", salaId)
        .single();
    
    if (error) {
        throw new Error("Sala não encontrada ou erro de banco de dados.");
    }
    return data.id_quiz;
};


/**
 * Verifica se o usuário logado é o criador do quiz daquela sala.
 */
export const checkIfUserIsQuizCreator = async (salaId, userId) => { 
    try {
        const userIdString = userId;
        if (!userIdString || !salaId) return false;
        
        // 1. Acha o quizId
        const quizId = await getQuizIdFromSalaId(salaId);

        // 2. Checa o criador no quiz
        const { data, error } = await supabase
            .from("quiz")
            .select("id_user")
            .eq("id", quizId)
            .single();

        if (error) {
            console.error("Erro ao buscar criador do quiz:", error);
            return false;
        };

        const quizCreatorId = data.id_user;
        console.log(`Checagem Admin: User logado=${userIdString}, Criador DB=${quizCreatorId}`);

        return quizCreatorId === userIdString;
    } catch (error) {
        console.error("Erro geral na checagem de Admin:", error);
        return false;
    }
};

/**
 * Busca ranking com nomes dos jogadores (Filtra diretamente pelo ID da Sala)
 */
export const getRankingWithPlayerNames = async (salaId) => { 
    try {
        const { data, error } = await supabase
            .from("resultado")
            .select(
                `
                id_jogador,
                acertos,
                pontuacaototal,
                datafinalizacao, 
                jogador(nome) // JOIN simplificado, sem filtro extra no JOIN
                `
            )
            .eq("id_sala", salaId) // FILTRO CORRETO E SIMPLIFICADO
            .order("pontuacaototal", { ascending: false })
            .order("datafinalizacao", { ascending: true });

        if (error) throw error;

        return data.map((item, index) => ({
            pos: index + 1,
            nome: item.jogador?.nome || `Jogador ${item.id_jogador}`,
            acertos: item.acertos,
            pontuacao: item.pontuacaototal,
        }));
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        return [];
    }
};

/**
 * Busca dados gerais do resultado (Filtra diretamente pelo ID da Sala)
 */
export const getGeneralStats = async (salaId) => { 
    try {
        const { data, error } = await supabase
            .from("resultado")
            .select("acertos, pontuacaototal") // SELECT simplificado
            .eq("id_sala", salaId); // FILTRO CORRETO E SIMPLIFICADO

        if (error) throw error;

        const participantes = data.length;
        const somaAcertos = data.reduce(
            (acc, item) => acc + Number(item.acertos || 0),
            0
        );
        const somaPontuacao = data.reduce(
            (acc, item) => acc + Number(item.pontuacaototal || 0),
            0
        );

        return {
            participantes,
            mediaAcertos: participantes ? (somaAcertos / participantes).toFixed(1) : 0,
            mediaPontuacao: participantes ? (somaPontuacao / participantes).toFixed(0) : 0,
        };
    } catch (error) {
        console.error("Erro ao buscar stats gerais:", error);
        return { participantes: 0, mediaAcertos: 0, mediaPontuacao: 0 };
    }
};

/**
 * Busca estatísticas detalhadas por questão (Função auxiliar interna - Usa diretamente salaId)
 */
const getQuestionStats = async (salaId) => { 
    try {
        // Agora, só precisamos filtrar a tabela 'resposta' por salaId.
        const { data: respostas, error: respostasError } = await supabase
            .from("resposta")
            .select(
                `
                id_questao,
                alternativa_escolhida,
                respostaCorreta, 
                pontuacao_obtida,
                questoes (
                    enunciado
                )
                `
            )
            .eq("id_sala", salaId); // FILTRO DIRETO POR SALA

        if (respostasError) throw respostasError;

        // ... lógica de agregação em memória (agrupamento e cálculo) é mantida ...
        const questoesMap = {};
        respostas.forEach((resp) => {
            const qId = resp.id_questao;

            if (!questoesMap[qId]) {
                questoesMap[qId] = {
                    id: qId,
                    enunciado: resp.questoes?.enunciado || `Questão ${qId}`,
                    totalRespostas: 0,
                    acertos: 0,
                    erros: 0,
                };
            }

            questoesMap[qId].totalRespostas++;

            if (resp.alternativa_escolhida === resp.respostaCorreta) { 
                questoesMap[qId].acertos++;
            } else {
                questoesMap[qId].erros++;
            }
        });

        const questoesStats = Object.values(questoesMap).map((q) => ({
            ...q,
            porcentagemAcerto:
                q.totalRespostas > 0
                    ? ((q.acertos / q.totalRespostas) * 100).toFixed(1)
                    : 0,
        }));

        return questoesStats;

    } catch (error) {
        console.error("Erro ao buscar stats de questões:", error);
        return [];
    }
};

/**
 * Busca questões mais erradas (ADMIN)
 */
export const getMostMissedQuestions = async (salaId) => { 
    try {
        const stats = await getQuestionStats(salaId);

        return stats
            .sort((a, b) => b.erros - a.erros)
            .slice(0, 5)
            .map((q) => ({
                enunciado: q.enunciado,
                erros: q.erros,
                total: q.totalRespostas,
                porcentagemErro: (100 - parseFloat(q.porcentagemAcerto)).toFixed(1),
            }));
    } catch (error) {
        console.error("Erro ao buscar questões mais erradas:", error);
        return [];
    }
};

/**
 * Busca questões mais acertadas (ADMIN)
 */
export const getMostCorrectQuestions = async (salaId) => { 
    try {
        const stats = await getQuestionStats(salaId);

        return stats
            .sort((a, b) => b.acertos - a.acertos)
            .slice(0, 5)
            .map((q) => ({
                enunciado: q.enunciado,
                acertos: q.acertos,
                total: q.totalRespostas,
                porcentagemAcerto: q.porcentagemAcerto,
            }));
    } catch (error) {
        console.error("Erro ao buscar questões mais acertadas:", error);
        return [];
    }
};

/**
 * Busca desempenho por questão para o gráfico (ADMIN)
 */
export const getPerformanceByQuestion = async (salaId) => { 
    try {
        const stats = await getQuestionStats(salaId);

        return stats.map((q, index) => ({
            questao: index + 1,
            enunciado: q.enunciado,
            porcentagem: parseFloat(q.porcentagemAcerto),
        }));
    } catch (error) {
        console.error("Erro ao buscar desempenho:", error);
        return [];
    }
};

/**
 * Salva o resultado final do jogador na tabela 'resultado'.
 */
export const salvarResultadoFinal = async ({
    idSala,
    idJogador,
    pontuacaoTotal,
    acertos,
}) => {
    try {
        const resultado = {
            id_sala: idSala,
            id_jogador: idJogador,
            pontuacaototal: pontuacaoTotal,
            acertos: acertos,
            datafinalizacao: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("resultado")
            .insert([resultado]);

        if (error) throw error;
        
        // Se a coluna 'datafinalizacao' não existe na sua tabela, remova-a do objeto 'resultado' acima.

        return data;
    } catch (error) {
        console.error("Erro ao salvar resultado final:", error);
        throw new Error("Não foi possível salvar a pontuação final.");
    }
}; 

/**
 * Busca o ID da Sala de Jogo mais recente (não precisa estar finalizada) 
 * para um dado Quiz ID.
 */
export const getLastCompletedSalaId = async (quizId) => {
    try {
        const { data, error } = await supabase
            .from("sala")
            // Seleciona o ID da sala e a data de criação
            .select("id, dataCriacao, ativa") 
            .eq("id_quiz", quizId) 
            // Ordena pela mais recente e pega apenas 1
            .order("dataCriacao", { ascending: false })
            .limit(1);
            // .single(); // ❌ REMOVIDO: Usar .limit(1) e tratar o array

        if (error) {
            console.error("Erro ao buscar a última Sala:", error);
            return null;
        }
        
        // Verifica se há dados e se o array não está vazio
        if (!data || data.length === 0) {
            console.warn(`Nenhuma sessão de sala encontrada para o Quiz ID: ${quizId}`);
            return null;
        }

        // Retorna o ID do primeiro (e único) item do array
        return data[0].id; 
    } catch (error) {
        console.error("Erro ao buscar a última Sala:", error);
        return null;
    }
};
