// JoinGame.jsx - FUNCIONA COM SEU QR CODE EXISTENTE
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../services/supabase/supabaseClient";
import "./JoinGame.css";
import quizzanaLogo from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzana.png";

export default function JoinGame() {
  const [nome, setNome] = useState("");
  const [codigoManual, setCodigoManual] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { codigoSala } = useParams();
  const [searchParams] = useSearchParams();
  
  // Pegar o quiz ID da URL (vindo do QR Code)
  const quizId = searchParams.get("quiz");

  // Se vier quiz ID, buscar o código da sala automaticamente
  useEffect(() => {
    if (quizId) {
      buscarSalaPorQuizId(quizId);
    }
  }, [quizId]);

  const buscarSalaPorQuizId = async (qId) => {
    setLoading(true);
    const { data: sala, error } = await supabase
      .from("sala")
      .select("codigo_sala, id")
      .eq("id_quiz", qId)
      .eq("ativa", false)
      .single();

    if (!error && sala) {
      setCodigoManual(sala.codigo_sala);
    }
    setLoading(false);
  };

  // Função para entrar na sala
  const entrarNaSala = async (codigo, nomeJogador) => {
    if (!nomeJogador.trim()) {
      alert("Por favor, digite seu nome");
      return;
    }

    if (!codigo) {
      alert("Por favor, digite o código da sala");
      return;
    }

    setLoading(true);

    try {
      // 1️ Buscar sala pelo código
      const { data: sala, error: salaError } = await supabase
        .from("sala")
        .select("*")
        .eq("codigo_sala", codigo.toUpperCase())
        .single();

      if (salaError || !sala) {
        alert("❌ Sala não encontrada! Verifique o código.");
        setLoading(false);
        return;
      }

      // Verificar se a sala já está ativa
      if (sala.ativa) {
        alert("⚠️ Esta sala já iniciou o quiz!");
        setLoading(false);
        return;
      }

      // 2️ Verificar se o jogador já está na sala
      const { data: jogadorExistente } = await supabase
        .from("jogador")
        .select("*")
        .eq("nome", nomeJogador)
        .eq("id_sala", sala.id)
        .maybeSingle();

      if (jogadorExistente) {
        alert("✅ Você já está nesta sala!");
        navigate(`/waiting-room/${sala.id}`);
        setLoading(false);
        return;
      }

      // 3 Inserir jogador na sala
      const { data: jogador, error: jogadorError } = await supabase
        .from("jogador")
        .insert({
          nome: nomeJogador,
          id_sala: sala.id,
        })
        .select()
        .single();

      if (jogadorError) {
        alert("❌ Erro ao entrar na sala. Tente novamente.");
        console.error(jogadorError);
        setLoading(false);
        return;
      }

      // 4 Redirecionar para a waiting-room
      navigate(`/waiting-room/${sala.id}`);
    } catch (error) {
      console.error("Erro:", error);
      alert("❌ Erro ao entrar na sala");
      setLoading(false);
    }
  };

  // Handler para o formulário
  const handleJoinManual = async (e) => {
    e.preventDefault();
    const codigo = codigoSala || codigoManual;
    await entrarNaSala(codigo, nome);
  };

  return (
    <>
      <div className="navbar"></div>

      <div className="join-container">
        <div className="join-left">
          <img src={quizzanaLogo} className="join-left-bg" alt="Background" />
          <img src={logo} className="join-logo idle" alt="Logo" />
          <h1 className="join-title">Quizzana</h1>
          <p className="join-subtitle">Olá, seja bem-vindo.</p>
        </div>

        <div className="join-right">
          <div className="join-content">
            <h2 className="join-heading">Participar do Quiz</h2>
            <p className="join-desc">
              Entre, teste seus conhecimentos e divirta-se!
            </p>

            {/* Mostrar mensagem se veio do QR Code */}
            {quizId && (
              <div className="qr-detected-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>QR Code detectado! Digite seu nome para entrar.</span>
              </div>
            )}

            <form onSubmit={handleJoinManual} className="join-form">
              {/* Input Nome */}
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="join-input"
                required
                disabled={loading}
              />

              {/* Input Código */}
              <input
                type="text"
                placeholder="Código da sala (ex: ABC123)"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
                className="join-input"
                required
                maxLength={6}
                disabled={loading || !!quizId}
              />

              {/* Botão Entrar */}
              <button 
                className="join-btn" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar na Sala"}
              </button>
            </form>

            {/* Informações de ajuda */}
            <div className="join-help">
              <p>
                <strong>💡 Como entrar:</strong>
              </p>
              <ul>
                <li>Escaneie o QR Code com a câmera do celular</li>
                <li>Ou digite manualmente o código da sala</li>
              </ul>
            </div>

            {codigoManual && (
              <div className="join-info">
                <p>Código: <strong>{codigoManual}</strong></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}