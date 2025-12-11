import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase/supabaseClient";
import "./JoinGame.css";
import quizzanaLogo from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzana.png"; 

export default function JoinGame() {
  const [nome, setNome] = useState("");
  const navigate = useNavigate();
  const { codigoSala } = useParams();  // PEGANDO O CÓDIGO DO QR CODE

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Digite seu nome");
      return;
    }

    // 1️⃣ Buscar sala pelo código do QR
    const { data: sala, error: salaError } = await supabase
      .from("sala")
      .select("*")
      .eq("codigo_sala", codigoSala)
      .single();

    if (salaError || !sala) {
      alert("Sala não encontrada!");
      return;
    }

    // 2️⃣ Inserir jogador na sala
    const { data: jogador, error: jogadorError } = await supabase
      .from("jogador")
      .insert({
        nome: nome,
        id_sala: sala.id
      })
      .select()
      .single();

    if (jogadorError) {
      alert("Erro ao entrar na sala");
      return;
    }

    // 3️⃣ Redirecionar para a waiting-room
    navigate(`/waiting-room/${sala.id}`);
  };

  return (
    <>
      <div className="navbar"></div>

      <div className="join-container">
        <div className="join-left">
          <img src={quizzanaLogo} className="join-left-bg" />
          <img src={logo} className="join-logo idle" />
          <h1 className="join-title">Quizzana</h1>
          <p className="join-subtitle">Olá, seja bem-vindo.</p>
        </div>

        <div className="join-right">
          <div className="join-content">
            <h2 className="join-heading">Participar do Quiz</h2>
            <p className="join-desc">Entre, teste seus conhecimentos e divirta-se!</p>

            <form onSubmit={handleJoin} className="join-form">
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="join-input"
              />
              <button className="join-btn" type="submit">
                Entrar
              </button>
            </form>

            <p className="join-help">Código: {codigoSala}</p>
          </div>
        </div>
      </div>
    </>
  );
}
