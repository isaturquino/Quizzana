import { supabase } from "./supabaseClient";

// CREATE
export const addQuestion = async (questionData) => {
  const { data, error } = await supabase
    .from("questoes")
    .insert([
      {
        enunciado: questionData.question,
        alternativaA: questionData.alternatives[0],
        alternativaB: questionData.alternatives[1],
        alternativaC: questionData.alternatives[2],
        alternativaD: questionData.alternatives[3],
        respostaCorreta: questionData.correctAnswer, 
        categoria_id: questionData.categoryId, 
      }
    ])
    .select();

  if (error) throw error;
  return data[0];
};

// UPDATE
export const updateQuestion = async (id, questionData) => {
  const { data, error } = await supabase
    .from("questoes")
    .update({
      enunciado: questionData.question,
      alternativaA: questionData.alternatives[0],
      alternativaB: questionData.alternatives[1],
      alternativaC: questionData.alternatives[2],
      alternativaD: questionData.alternatives[3],
      respostaCorreta: questionData.correctAnswer,
      categoria_id: questionData.categoryId,
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

// DELETE
export const deleteQuestion = async (id) => {
  const { error } = await supabase
    .from("questoes")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
