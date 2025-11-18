import { useState } from "react";
import "./JoinGame.css";
import quizzanaLogo from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzana.png"; 

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
      <div className="navbar"></div>

      <div className="join-container">
        <div className="join-left">
          {/* fundo como elemento <img> absoluto */}
          <img 
            src={quizzanaLogo} 
            className="join-left-bg" 
            alt="Background Quizzana"
          />

          {/* logo - grande, centralizada e com flutuação opcional */}
          <img 
            src={logo} 
            className="join-logo idle" 
            alt="Logo Quizzana"
          />

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
