import { supabase } from "./supabaseClient";

/**
 * Cria uma sala vinculada a um quiz
 */
export async function createSala({ quizId, codigoSala }) {
  try {
    const { data, error } = await supabase
      .from("sala")
      .insert([
        {
          id_quiz: quizId,
          codigo_sala: codigoSala,
          ativa: true, 
          dataCriacao: new Date().toISOString(), 
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar sala:", error);
    throw error;
  }
}

/**
 * Busca sala ativa pelo código
 */
export async function getSalaAtivaByCodigo(codigoSala) {
  const codigoFormatado = codigoSala.trim().toUpperCase();
  const { data, error } = await supabase
    .from("sala")
    .select("*")
    .eq("codigo_sala", codigoFormatado)
    .eq("ativa", true)
    .single();

  if (error) throw error;

  return data;
}
