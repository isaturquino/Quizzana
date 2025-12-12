import React, { useState, useEffect } from "react";
import SideBar from "../../components/layout/SideBar";
import Header from "../../components/layout/Header";
import "./ManageSalaPage.css";
import { supabase } from "../../services/supabase/supabaseClient";

// --- Componentes Reutilizáveis ---
const Participant = ({ number, name, answered }) => {
  const getAvatar = (name) => {
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const colors = ["FF6B6B", "4ECDC4", "45B7D1", "FFA07A", "98D8C8", "F7DC6F", "BB8FCE", "85C1E2"];
    const bgColor = colors[name.length % colors.length];

    return `https://ui-avatars.com/api/?name=${initials}&background=${bgColor}&color=fff&size=40&bold=true`;
  };

  return (
    <div className="participant-item">
      <span className="participant-number">{number}</span>
      <img src={getAvatar(name)} alt={name} className="participant-avatar" />
      <span className="participant-name">{name}</span>
      {answered && <span className="participant-status">Respondeu</span>}
    </div>
  );
};

const AnswerOption = ({ letter, text, votes, colorClass }) => (
  <div className={`answer-option ${colorClass}`}>
    <span className="answer-letter">{letter}</span>
    <span className="answer-text">{text}</span>
    <span className="answer-votes">{votes} votos</span>
  </div>
);

// --- Componente Principal ---
export default function ManageSalas() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [participants, setParticipants] = useState([]);
  const [answers, setAnswers] = useState([]);

  const salaId = "sala001"; // ← você pode substituir depois

  // --- Buscar dados do Supabase ---
  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("sala_id", salaId);

    if (!error) setParticipants(data);
  };

  const loadAnswers = async () => {
    const { data, error } = await supabase
      .from("answers")
      .select("*")
      .eq("sala_id", salaId);

    if (!error) setAnswers(data);
  };

  // --- useEffect carregando dados e tempo real ---
  useEffect(() => {
    loadParticipants();
    loadAnswers();

    // 🔥 Realtime: participantes
    const subParticipants = supabase
      .channel("participants-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, loadParticipants)
      .subscribe();

    // 🔥 Realtime: respostas
    const subAnswers = supabase
      .channel("answers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "answers" }, loadAnswers)
      .subscribe();

    return () => {
      supabase.removeChannel(subParticipants);
      supabase.removeChannel(subAnswers);
    };
  }, []);

  const totalParticipants = participants.length;
  const answeredParticipants = participants.filter((p) => p.answered).length;

  return (
    <div className="layout">
      <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Header isSidebarOpen={isSidebarOpen} />

        <div className="quiz-wrapper">
          <h1 className="quiz-title">Quiz: História do Brasil - Sala de Gestão</h1>

          <div className="quiz-grid">
            {/* Participantes */}
            <div className="participants-panel">
              <h2 className="panel-title">
                Participantes Conectados: {totalParticipants}
              </h2>

              <div className="participants-list">
                {participants.map((p, idx) => (
                  <Participant
                    key={p.id}
                    number={idx + 1}
                    name={p.name}
                    answered={p.answered}
                  />
                ))}
              </div>

              <div className="participants-summary">
                {answeredParticipants}/{totalParticipants} participantes responderam
              </div>
            </div>

            {/* Questão e Respostas */}
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
                naturalmente em uma escala de tempo humana?
              </div>

              <h2 className="responses-title">Respostas dos Participantes:</h2>

              <div className="answers-grid">
                {answers.map((a) => (
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
