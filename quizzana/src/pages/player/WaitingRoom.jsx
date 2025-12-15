import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase/supabaseClient";
import "./WaitingRoom.css";
import headerImg from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzanalogo.png";

export default function WaitingRoom() {
  const navigate = useNavigate();
  const { salaId } = useParams();

  const [jogadores, setJogadores] = useState([]);
  const [sala, setSala] = useState(null);
  const [configuracoes, setConfiguracoes] = useState(null); 
  const [limiteAtingido, setLimiteAtingido] = useState(false); 

  const jogadorLocal = JSON.parse(localStorage.getItem("jogador"));

  //  CARREGAR SALA + CONFIGURAÇÕES
  const carregarSala = async () => {
    // 1️ Buscar sala com dados do quiz
    const { data, error } = await supabase
      .from("sala")
      .select("*, quiz(*)") // ✅ JOIN com quiz
      .eq("id", salaId)
      .single();

    if (!error) {
      setSala(data);

      // 2️ Buscar configurações do quiz
      if (data?.quiz?.id_configuracoes) {
        const { data: configData } = await supabase
          .from("configuracoes_quiz")
          .select("*")
          .eq("id", data.quiz.id_configuracoes)
          .single();

        if (configData) {
          setConfiguracoes(configData);
        }
      }
    }

    if (data?.ativa) navigate(`/play/${data.id}`);
  };

  //  CARREGAR JOGADORES + VALIDAR LIMITE
  const carregarJogadores = async () => {
    const { data, error } = await supabase
      .from("jogador")
      .select("*")
      .eq("id_sala", salaId);

    if (!error && data) {
      setJogadores(data);

      //  VERIFICAR LIMITE DE PARTICIPANTES
      if (configuracoes && data.length >= configuracoes.maximo_participantes) {
        const jogadorJaEsta = data.some((j) => j.id === jogadorLocal?.id);

        if (!jogadorJaEsta) {
          setLimiteAtingido(true);
          alert(
            `Sala cheia! Limite de ${configuracoes.maximo_participantes} participantes atingido.`
          );
          navigate("/join");
        }
      }
    }
  };

  const iniciarRealtime = () => {
    //  Recarregar jogadores ao detectar mudanças
    supabase
      .channel(`jogadores-sala-${salaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jogador",
          filter: `id_sala=eq.${salaId}`,
        },
        () => {
          carregarJogadores(); 
        }
      )
      .subscribe();

    supabase
      .channel(`sala-${salaId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sala", filter: `id=eq.${salaId}` },
        (payload) => {
          if (payload.new.ativa) navigate(`/play/${payload.new.id}`);
        }
      )
      .subscribe();
  };

  useEffect(() => {
    carregarSala();
  }, []);

  useEffect(() => {
    if (configuracoes) {
      carregarJogadores();
      iniciarRealtime();
    }
  }, [configuracoes]);

  const voltarParaJoin = () => navigate("/join");

  const formatarTempo = (createdAt) => {
    if (!createdAt) return "Conectado agora";
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return diff < 1 ? "Conectado agora" : `Conectado a ${diff}min`;
  };

  //  SE SALA CHEIA, MOSTRA MENSAGEM
  if (limiteAtingido) {
    return (
      <div className="wr-frame">
        <div className="wr-border">
          <div className="wr-main">
            <div className="wr-center">
              <h1 className="wr-title">Sala Cheia</h1>
              <p className="wr-sub">
                Esta sala atingiu o limite de participantes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wr-frame">
      <div className="wr-border">
        <header className="wr-header">
          <button className="wr-back" aria-label="Voltar" onClick={voltarParaJoin}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>

          <div
            className="wr-header-bar"
            style={{
              backgroundImage: `url(${headerImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            aria-hidden="true"
          />

          <img src={logo} alt="Logotipo do Quizzana" className="wr-logo" />
        </header>

        <main className="wr-main">
          <div className="wr-center">
            <h1 className="wr-title">Aguardando o administrador iniciar...</h1>
            <p className="wr-sub">O quiz começará em breve. Prepare-se!</p>

            <div className="wr-spinner" aria-hidden="true">
              <div className="wr-spinner-dot" />
            </div>

            <section className="wr-participants" aria-labelledby="participants-title">
              <div className="wr-participants-header">
                <div className="wr-participants-title" id="participants-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.6">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Participantes Conectados</span>
                </div>
                {/* MOSTRA CONTADOR COM LIMITE */}
                <div className="wr-badge">
                  {jogadores.length}
                  {configuracoes && `/${configuracoes.maximo_participantes}`}
                </div>
              </div>

              <ul className="wr-list">
                {jogadores.map((jogador) => (
                  <li key={jogador.id} className="wr-list-item">
                    <div className="wr-avatar">
                      <svg viewBox="0 0 36 36" width="36" height="36">
                        <defs>
                          <linearGradient id={`g-${jogador.id}`} x1="0" x2="1">
                            <stop offset="0" stopColor="#ffd54a" />
                            <stop offset="1" stopColor="#ffb74d" />
                          </linearGradient>
                        </defs>
                        <circle cx="18" cy="18" r="17" fill={`url(#g-${jogador.id})`} />
                        <circle cx="18" cy="14" r="5" fill="#fff" />
                        <rect x="8" y="22" width="20" height="8" rx="4" fill="#fff" />
                      </svg>
                    </div>
                    <div className="wr-item-text">
                      <div className="wr-name">{jogador.nome}</div>
                      <div className="wr-time">{formatarTempo(jogador.created_at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <div className="wr-alert" role="status" aria-live="polite">
              <div className="wr-alert-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6l4 2" />
                </svg>
              </div>
              <div className="wr-alert-text">Fique atento! O quiz começará em breve.</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}