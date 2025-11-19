import React from "react";
import "./WaitingRoom.css";
import headerImg from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzanalogo.png";

export default function WaitingRoom() {
  const participants = [
    { id: 1, name: "Jogador 1", time: "Conectado a 5min" },
    { id: 2, name: "Jogador 2", time: "Conectado a 3min" },
    { id: 3, name: "Jogador 3", time: "Conectado a 2min" },
    { id: 4, name: "Jogador 4", time: "Conectado a 1min" },
  ];

  return (
    <div className="wr-frame">
      <div className="wr-border">
        <header className="wr-header">
          <button className="wr-back" aria-label="Voltar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>

          {/* barra superior: imagem decorativa */}
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

          {/* logo posicionada sobre a barra */}
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.6" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Participantes Conectados</span>
                </div>
                <div className="wr-badge" aria-hidden="true">{participants.length}</div>
              </div>

              <ul className="wr-list" role="list">
                {participants.map((p) => (
                  <li key={p.id} className="wr-list-item" role="listitem">
                    <div className="wr-avatar" aria-hidden="true">
                      <svg viewBox="0 0 36 36" width="36" height="36" role="img" aria-label={`Avatar de ${p.name}`}>
                        <defs>
                          <linearGradient id={`g-${p.id}`} x1="0" x2="1">
                            <stop offset="0" stopColor="#ffd54a" />
                            <stop offset="1" stopColor="#ffb74d" />
                          </linearGradient>
                        </defs>
                        <circle cx="18" cy="18" r="17" fill={`url(#g-${p.id})`} />
                        <circle cx="18" cy="14" r="5" fill="#fff" />
                        <rect x="8" y="22" width="20" height="8" rx="4" fill="#fff" />
                      </svg>
                    </div>

                    <div className="wr-item-text">
                      <div className="wr-name">{p.name}</div>
                      <div className="wr-time">{p.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <div className="wr-alert" role="status" aria-live="polite">
              <div className="wr-alert-left" aria-hidden="true">
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
