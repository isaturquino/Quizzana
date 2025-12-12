import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getQuizzes } from "../services/supabase/quizService";

/**
 * Hook para buscar lista de quizzes com paginação
 * Filtra apenas os quizzes do usuário logado
 */
export function useQuizzes(page = 1, limit = 10) {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchQuizzes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { quizzes: data, totalPages: pages, total: count } = await getQuizzes(page, limit, user.id);
      
      setQuizzes(data);
      setTotalPages(pages);
      setTotal(count);
    } catch (error) {
      console.error("Erro ao carregar quizzes:", error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [page, limit, user]);

  return { 
    quizzes, 
    loading, 
    totalPages, 
    total,
    refetch: fetchQuizzes 
  };
}