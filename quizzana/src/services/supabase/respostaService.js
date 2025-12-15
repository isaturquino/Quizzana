import { supabase } from "./supabaseClient";

/**
 * Salva uma resposta do jogador
 */
export async function salvarResposta({
  idJogador,
  idSala,
  idQuestao,
  alternativaEscolhida,
  respostaCorreta,
  pontuacaoObtida,
}) {
  const { data, error } = await supabase
    .from("resposta")
    .insert([
      {
        id_jogador: idJogador,
        id_sala: idSala,
        id_questao: idQuestao,
        alternativa_escolhida: alternativaEscolhida,
        respostaCorreta,
        pontuacao_obtida: pontuacaoObtida,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar resposta:", error);
    throw error;
  }

  return data;
}
