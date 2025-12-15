import { useEffect, useState } from "react";
import { supabase } from "../services/supabase/supabaseClient.js";

export function useQuestions(page = 1, limit = null) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQuestions = async () => {
    setLoading(true);

    let query = supabase
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
      `, { count: "exact" });

    // 👉 Só aplica paginação se limit existir
    if (limit) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

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

      if (limit) {
        setTotalPages(Math.ceil(count / limit));
      } else {
        setTotalPages(1);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, limit]);

  return { questions, loading, totalPages, refetch: fetchQuestions };
}
