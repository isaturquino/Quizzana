import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  checkIfUserIsQuizCreator,
  getRankingWithPlayerNames,
  getGeneralStats,
  getMostMissedQuestions,
  getMostCorrectQuestions,
  getPerformanceByQuestion,
} from "../services/supabase/resultsService";

export const useResults = (salaId,user) => {

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Dados que TODOS veem
  const [ranking, setRanking] = useState([]);
  const [generalStats, setGeneralStats] = useState({
    participantes: 0,
    mediaAcertos: 0,
    mediaPontuacao: 0,
  });

  // Dados que só ADMIN vê
  const [mostMissed, setMostMissed] = useState([]);
  const [mostCorrect, setMostCorrect] = useState([]);
  const [performance, setPerformance] = useState([]);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!salaId) {
      setError("Sala ID não encontrado");
      setLoading(false);
      return;
    }

    loadResults();
  }, [salaId, user]);

  const loadResults = async () => {
    setLoading(true);
    setError(null);

    try {
        let userIsAdmin = false;
      // 1️ Verificar se é admin
      if (user && user.id) {
          // Se o usuário está logado, checa o privilégio
          userIsAdmin = await checkIfUserIsQuizCreator(salaId, user.id);
      } else {
          // Se o usuário não está logado, userIsAdmin já é false,
          console.log("Usuário deslogado. Assumindo que NÃO é Admin.");
      }
      
      setIsAdmin(userIsAdmin);

      // 2️ Buscar dados que TODOS veem
      const [rankingData, statsData] = await Promise.all([
        getRankingWithPlayerNames(salaId),
        getGeneralStats(salaId),
      ]);

      setRanking(rankingData);
      setGeneralStats(statsData);

      // 3️ Se for admin, buscar dados detalhados
      if (userIsAdmin) {
        const [missedData, correctData, perfData] = await Promise.all([
          getMostMissedQuestions(salaId),
          getMostCorrectQuestions(salaId),
          getPerformanceByQuestion(salaId),
        ]);

        setMostMissed(missedData);
        setMostCorrect(correctData);
        setPerformance(perfData);
      }else {
          // Garantir que o jogador não veja dados antigos
          setMostMissed([]);
          setMostCorrect([]);
          setPerformance([]);
      }
    } catch (err) {
      console.error("Erro ao carregar resultados:", err);
      setError("Erro ao carregar resultados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    isAdmin,
    ranking,
    generalStats,
    mostMissed,
    mostCorrect,
    performance,
    error,
  };
};