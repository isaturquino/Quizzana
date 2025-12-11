import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase/supabaseClient";
import "./WaitingRoom.css";

export default function WaitingRoom() {
  const navigate = useNavigate();
  const { salaId } = useParams();

  const [jogadores, setJogadores] = useState([]);
  const [sala, setSala] = useState(null);

  // 🔥 1. Carregar dados da sala
  const carregarSala = async () => {
    const { data, error } = await supabase
      .from("sala")
      .select("*")
      .eq("id", salaId)
      .single();

    if (error) console.log("Erro ao carregar sala:", error);
    else setSala(data);

    // Se a sala já estiver ativa → vai direto para o quiz
    if (data?.ativa === true) {
      navigate(`/play/${salaId}`);
    }
  };

  // 🔥 2. Carregar jogadores
  const carregarJogadores = async () => {
    const { data, error } = await supabase
      .from("jogador")
      .select("*")
      .eq("id_sala", salaId);

    if (!error) setJogadores(data);
  };

  // 🔥 3. Realtime — quando um novo jogador entrar
  const iniciarRealtime = () => {
    supabase
      .channel(`jogadores-sala-${salaId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jogador", filter: `id_sala=eq.${salaId}` },
        (payload) => {
          setJogadores((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    // Sala ativada → redireciona
    supabase
      .channel(`sala-${salaId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sala", filter: `id=eq.${salaId}` },
        (payload) => {
          if (payload.new.ativa === true) {
            navigate(`/play/${salaId}`);
          }
        }
      )
      .subscribe();
  };

  // 🔥 Quando iniciar
  useEffect(() => {
    carregarSala();
    carregarJogadores();
    iniciarRealtime();
  }, []);

  // 🔥 4. ADMIN inicia o jogo
  const iniciarJogo = async () => {
    await supabase
      .from("sala")
      .update({ ativa: true })
      .eq("id", salaId);

    navigate(`/play/${salaId}`);
  };

  return (
    <div className="waiting-container">
      <h1>Sala de Espera</h1>
      <p>Código da sala: <strong>{sala?.codigo_sala}</strong></p>

      <h2>Jogadores</h2>
      <ul className="players-list">
        {jogadores.map((j) => (
          <li key={j.id}>{j.nome}</li>
        ))}
      </ul>

      <button className="start-btn" onClick={iniciarJogo}>
        Iniciar Jogo
      </button>
    </div>
  );
}
