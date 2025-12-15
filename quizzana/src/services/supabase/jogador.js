import { supabase } from "./supabaseClient";

export async function createJogador(nome, idSala) {
  if (!idSala) {
    throw new Error("idSala é obrigatório para criar jogador");
  }

  const { data, error } = await supabase
    .from("jogador")
    .insert([
      {
        nome,
        id_sala: idSala
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

