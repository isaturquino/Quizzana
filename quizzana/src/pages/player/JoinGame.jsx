import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./JoinGame.css";
import quizzanaLogo from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzana.png";

import { getSalaAtivaByCodigo } from "../../services/supabase/salaService";
import { createJogador } from "../../services/supabase/jogador";

export default function JoinGame() {
  const [nome, setNome] = useState("");
  const [codigoSala, setCodigoSala] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { codigoSala: codigoDaRota } = useParams();

  // Preencher código automaticamente pela URL
    useEffect(() => {
        // Se houver um código na rota, usá-lo.
        if (codigoDaRota) {
            setCodigoSala(codigoDaRota.toUpperCase());
        }
    // O array de dependências agora usa codigoDaRota
    }, [codigoDaRota]);

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!nome.trim() || !codigoSala.trim()) {
      alert("Preencha nome e código da sala");
      return;
    }

    try {
      setLoading(true);

      // 1️ Buscar sala ativa
      const sala = await getSalaAtivaByCodigo(codigoSala.toUpperCase());

      // 2️ Criar jogador
      const jogador = await createJogador(nome);

      // 3️ Salvar dados localmente
      localStorage.setItem("jogador", JSON.stringify(jogador));
      localStorage.setItem("sala", JSON.stringify(sala));

      // 4️ Ir para waiting room
      navigate(`/waiting-room/${sala.id}`);
    } catch (error) {
      console.error(error);
      alert("❌ Sala inválida ou encerrada");
    } finally {
      setLoading(false);
    }
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

            <form onSubmit={handleJoin} className="join-form">
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="join-input"
                disabled={loading}
              />

              <input
                type="text"
                placeholder="Código da sala"
                value={codigoSala}
                onChange={(e) =>
                  setCodigoSala(e.target.value.toUpperCase())
                }
                className="join-input"
                maxLength={6}
                disabled={loading}
              />

              <button className="join-btn" type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar na Sala"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
