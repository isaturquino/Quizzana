
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase/supabaseClient"; 

export function useQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("questoes")
        .select(`
          id,
          enunciado,
          alternativaA,
          alternativaB,
          alternativaC,
          alternativaD,
          respostaCorreta,
          id_categoria,
          categoria:categorias(nome)
        `);

      if (error) {
        console.error("Erro ao buscar questões:", error);
        setQuestions([]);
      } else {
        const formatted = data.map(q => ({
          id: q.id,
          question: q.enunciado,
          alternatives: [q.alternativaA, q.alternativaB, q.alternativaC, q.alternativaD],
          correctAnswer: q.respostaCorreta,
          category: q.categoria?.nome || "Sem categoria"
        }));
        setQuestions(formatted);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  return { questions, loading };
}
