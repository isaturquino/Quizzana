import React, { useState, useEffect } from "react";
import "./PlayQuizPage.css";
import headerImg from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzanalogo.png";

export default function QuizScreen() {
  // DADOS DA QUESTÃO
  const correctIndex = 2;
  const options = [
    "Solar Power",
    "Wind Power",
    "Gas Natural",
    "Hydroelectric Power"
  ];

  // ESTADOS
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // TIMER
  const [time, setTime] = useState(30);
  useEffect(() => {
    if (submitted || time <= 0) return;

    const timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [time, submitted]);

  // AÇÕES
  function handleSelect(i) {
    if (!submitted) setSelected(i);
  }

  function handleSubmit() {
    if (selected !== null) setSubmitted(true);
  }

  // CSS DINÂMICO DAS OPÇÕES
  function optionClass(i) {
    if (!submitted) return selected === i ? "pq-option selected" : "pq-option";
    if (i === correctIndex) return "pq-option correct";
    return "pq-option wrong";
  }

  // PROGRESSO (exemplo fixo)
  const progressPercent = submitted ? 100 : 18;

  // FORMATAR TIMER
  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pq-container">
      {/* HEADER */}
      <header className="pq-header">
        <button className="pq-back" aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>

        <div
          className="pq-header-bar"
          style={{
            backgroundImage: `url(${headerImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        />

        <img src={logo} alt="Logo Quizzana" className="pq-logo" />
      </header>

      {/* PROGRESSO */}
      <div className="pq-progress-area">
        <p className="pq-progress-text">Questão 1 de 10</p>

        <div className="pq-bar-bg">
          <div
            className="pq-bar-fill"
            style={{
              width: `${progressPercent}%`,
              transition: "width 0.5s ease"
            }}
          ></div>
        </div>

        <div className="pq-timer-box">
          <span className="pq-timer-icon">⏱️</span>
          <p className="pq-timer">{formatTime(time)}</p>
        </div>

        <h2 className="pq-quiz-title">Quiz: História do Brasil</h2>
      </div>

      {/* PERGUNTA */}
      <div className="pq-question-box">
        Qual das seguintes fontes de energia não pode ser reabastecida naturalmente na escala
        de tempo humano, tornando-se um exemplo de recurso não renovável?
      </div>

      {/* OPÇÕES */}
      <div className="pq-options-grid">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={optionClass(i)}
            onClick={() => handleSelect(i)}
            aria-pressed={selected === i}
            disabled={submitted}
          >
            <span className="pq-opt-label">{String.fromCharCode(65 + i)}</span>
            <span className="pq-opt-text">{opt}</span>
          </button>
        ))}
      </div>

      {/* BOTÃO RESPONDER */}
      <div className="pq-submit-area">
        <button
          className="pq-submit-btn"
          type="button"
          onClick={handleSubmit}
          disabled={selected === null || submitted}
        >
          {submitted ? "Respondido" : "Responder"}
        </button>
      </div>
    </div>
  );
}
