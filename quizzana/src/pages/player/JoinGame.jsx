import { useState } from "react";
import "./JoinGame.css";
import quizzanaLogo from "../../assets/imgs/header.jpg";

export default function JoinGame() {
  const [nome, setNome] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();

    if (!nome) {
      alert("Preencha seu nome!");
      return;
    }

    console.log(`Jogador: ${nome}`);
  };

  return (
    <>
      {/* Barra Superior */}
      <div className="navbar">
        <div className="navbar-logo">Quizzana</div>
      </div>

      <div className="join-container">
        
        {/* Lado Esquerdo (com imagem de fundo) */}
        <div className="join-left">
          <img 
            src={quizzanaLogo} 
            className="join-left-bg" 
            alt="Background Quizzana" 
          />
         
          <p className="join-subtitle">Olá, seja bem-vindo.</p>
        </div>

        {/* Lado Direito (conteúdo principal) */}
        <div className="join-right">
          <div className="join-content">
            <h2 className="join-heading">Participar do Quiz</h2>
            <p className="join-desc">Entre, teste seus conhecimentos e divirta-se!</p>

            <form onSubmit={handleJoin} className="join-form">
              <input
                type="text"
                placeholder="Ex: João123"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="join-input"
              />

              <button className="join-btn" type="submit">
                Entrar na sala
              </button>
            </form>

            <p className="join-help">Como funciona?</p>
          </div>
        </div>
      </div>
    </>
  );
}