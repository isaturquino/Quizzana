import React, { useState } from "react";
import SideBar from "../../components/layout/SideBar";
import Header from "../../components/layout/Header";
import "./ManageSalaPage.css";

// --- Componentes Reutilizáveis ---
const Participant = ({ number, name, answered, avatarSrc }) => (
  <div className="participant-item">
    <span className="participant-number">{number}</span>
    <img src={avatarSrc} alt={name} className="participant-avatar" />
    <span className="participant-name">{name}</span>
    {answered && <span className="participant-status">Respondeu</span>}
  </div>
);

const AnswerOption = ({ letter, text, votes, colorClass }) => (
  <div className={`answer-option ${colorClass}`}>
    <span className="answer-letter">{letter}</span>
    <span className="answer-text">{text}</span>
    <span className="answer-votes">{votes} votos</span>
  </div>
);

// --- Componente Principal ---
function ManageSalas() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Dados Mockados ---
  const participants = [
    { id: 1, name: "Jogador 1", answered: true, avatar: "/img/avatar1.png" },
    { id: 2, name: "Jogador 2", answered: true, avatar: "/img/avatar2.png" },
    { id: 3, name: "Jogador 3", answered: true, avatar: "/img/avatar3.png" },
    { id: 4, name: "Jogador 4", answered: true, avatar: "/img/avatar4.png" },
    { id: 5, name: "Jogador 5", answered: true, avatar: "/img/avatar5.png" },
  ];

  const answers = [
    { letter: "A", text: "Solar Power", votes: 3, colorClass: "option-a" },
    { letter: "B", text: "Wind Power", votes: 1, colorClass: "option-b" },
    { letter: "C", text: "Natural Gas", votes: 1, colorClass: "option-c" },
    { letter: "D", text: "Hydroelectric Power", votes: 0, colorClass: "option-d" },
  ];

  const totalParticipants = participants.length;
  const answeredParticipants = participants.filter(p => p.answered).length;

  return (
    <div className="layout">
      <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Header isSidebarOpen={isSidebarOpen} />

        <div className="quiz-wrapper">
          <h1 className="quiz-title">Quiz: História do Brasil - Sala de Gestão</h1>

          <div className="quiz-grid">

            {/* LADO ESQUERDO: Participantes */}
            <div className="participants-panel">
              <h2 className="panel-title">Participantes Conectados: {totalParticipants}</h2>
              <div className="participants-list">
                {participants.map((p, idx) => (
                  <Participant
                    key={p.id}
                    number={idx + 1}
                    name={p.name}
                    answered={p.answered}
                    avatarSrc={p.avatar}
                  />
                ))}
              </div>
              <div className="participants-summary">
                {answeredParticipants}/{totalParticipants} participantes responderam
              </div>
            </div>

            {/* LADO DIREITO: Questão e Respostas */}
            <div className="question-panel">
              <div className="question-header">
                <span className="question-count">Questão 1 de 10</span>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: "10%" }}></div>
                </div>
                <div className="timer">00:00</div>
              </div>

              <div className="question-box">
                Qual das seguintes fontes de energia não pode ser reabastecida
                naturalmente em uma escala de tempo humana, tornando-se um
                exemplo de recurso não renovável?
              </div>

              <h2 className="responses-title">Respostas dos Participantes:</h2>
              <div className="answers-grid">
                {answers.map(a => (
                  <AnswerOption key={a.letter} {...a} />
                ))}
              </div>

              <div className="action-buttons">
                <button className="btn btn-end-quiz">Encerrar Quiz</button>
                <button className="btn btn-next-question">Próxima questão</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageSalas;
