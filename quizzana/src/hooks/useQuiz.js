import { useEffect, useState } from "react";
import { getQuizzes } from "../services/supabase/quizService";

/**
 * Hook para buscar lista de quizzes com paginação
 */
export function useQuizzes(page = 1, limit = 10) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const { quizzes: data, totalPages: pages, total: count } = await getQuizzes(page, limit);
      
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
  }, [page, limit]);

  return { 
    quizzes, 
    loading, 
    totalPages, 
    total,
    refetch: fetchQuizzes 
  };
}