import { supabase } from "./supabaseClient";

export async function createJogador(nome) {
  const { data, error } = await supabase
    .from("jogador")
    .insert({ nome })
    .select()
    .single();

  if (error) throw error;
  return data;
}
