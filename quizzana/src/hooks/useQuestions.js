import { useEffect, useState } from "react";
import { supabase } from "../services/supabase/supabaseClient.js";

export function useQuestions(page = 1, limit = 5) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQuestions = async () => {
    setLoading(true);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Busca paginada
    const { data, error, count } = await supabase
      .from("questoes")
      .select(`
        id,
        enunciado,
        alternativaA,
        alternativaB,
        alternativaC,
        alternativaD,
        respostaCorreta,
        categoria_id,
        categoria ( nome )
      `, { count: "exact" })
      .range(from, to);

    if (error) {
      console.error("Erro ao buscar questões:", error);
      setQuestions([]);
    } else {
      const formatted = data.map(q => ({
        id: q.id,
        question: q.enunciado,
        alternatives: [
          q.alternativaA,
          q.alternativaB,
          q.alternativaC,
          q.alternativaD
        ],
        correctAnswer: q.respostaCorreta,
        categoria_id: q.categoria_id,
        category: q.categoria?.nome || "Sem categoria"
      }));

      setQuestions(formatted);

      setTotalPages(Math.ceil(count / limit));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [page]);

  return { questions, loading, totalPages, refetch: fetchQuestions };
}
