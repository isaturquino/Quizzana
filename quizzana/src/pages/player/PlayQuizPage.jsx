// PlayQuizPage.jsx - SEM SUPABASE (APENAS LAYOUT)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PlayQuizPage.css";
import headerImg from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzanalogo.png";

export default function PlayQuizPage() {
  const navigate = useNavigate();

  // DADOS MOCKADOS DO QUIZ
  const quiz = {
    titulo: "Quiz: História do Brasil",
    questoes: [
      {
        id: 1,
        pergunta: "Qual das seguintes fontes de energia não pode ser reabastecida naturalmente na escala de tempo humano, tornando-se um exemplo de recurso não renovável?",
        opcao_a: "Solar Power",
        opcao_b: "Wind Power",
        opcao_c: "Gas Natural",
        opcao_d: "Hydroelectric Power",
        resposta_correta: "C",
      },
      {
        id: 2,
        pergunta: "Qual é a capital do Brasil?",
        opcao_a: "São Paulo",
        opcao_b: "Rio de Janeiro",
        opcao_c: "Brasília",
        opcao_d: "Salvador",
        resposta_correta: "C",
      },
      {
        id: 3,
        pergunta: "Em que ano foi proclamada a independência do Brasil?",
        opcao_a: "1500",
        opcao_b: "1822",
        opcao_c: "1889",
        opcao_d: "1930",
        resposta_correta: "B",
      },
    ],
  };

  // ESTADOS
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [respostas, setRespostas] = useState([]);

  // TIMER
  const [time, setTime] = useState(30);

  //  TIMER
  useEffect(() => {
    if (submitted || time <= 0) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          handleSubmit(); // Auto-submit quando tempo acabar
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [time, submitted]);

  //  SELECIONAR OPÇÃO
  function handleSelect(opcao) {
    if (!submitted) setSelected(opcao);
  }

  //  SUBMETER RESPOSTA
  function handleSubmit() {
    if (selected === null && time > 0) return;

    setSubmitted(true);

    const questaoAtualData = quiz.questoes[questaoAtual];
    const respostaCorreta = questaoAtualData.resposta_correta;
    const acertou = selected === respostaCorreta;

    // Salvar resposta
    const novaResposta = {
      questao_id: questaoAtualData.id,
      resposta_usuario: selected,
      correta: acertou,
      tempo_resposta: 30 - time,
    };

    setRespostas([...respostas, novaResposta]);

    // Aguardar 2 segundos antes de próxima questão
    setTimeout(() => {
      proximaQuestao();
    }, 2000);
  }

  //  PRÓXIMA QUESTÃO
  function proximaQuestao() {
    if (questaoAtual < quiz.questoes.length - 1) {
      setQuestaoAtual(questaoAtual + 1);
      setSelected(null);
      setSubmitted(false);
      setTime(30); // Reset timer
    } else {
      // Quiz finalizado
      finalizarQuiz();
    }
  }

  //  FINALIZAR QUIZ
  function finalizarQuiz() {
    const pontuacao = respostas.filter((r) => r.correta).length;
    alert(`Quiz finalizado! Você acertou ${pontuacao} de ${quiz.questoes.length} questões!`);
    
    // Redirecionar (ou voltar)
    navigate("/");
  }

  //  VOLTAR
  function handleBack() {
    if (window.confirm("Tem certeza que deseja sair? Seu progresso será perdido.")) {
      navigate("/");
    }
  }

  // CSS DINÂMICO DAS OPÇÕES
  function optionClass(opcao) {
    const questaoAtualData = quiz.questoes[questaoAtual];

    if (!submitted) {
      return selected === opcao ? "pq-option selected" : "pq-option";
    }

    if (opcao === questaoAtualData.resposta_correta) {
      return "pq-option correct";
    }

    if (opcao === selected && opcao !== questaoAtualData.resposta_correta) {
      return "pq-option wrong";
    }

    return "pq-option";
  }

  // PROGRESSO
  const progressPercent = ((questaoAtual + 1) / quiz.questoes.length) * 100;

  // FORMATAR TIMER
  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const questaoAtualData = quiz.questoes[questaoAtual];
  const opcoes = [
    questaoAtualData.opcao_a,
    questaoAtualData.opcao_b,
    questaoAtualData.opcao_c,
    questaoAtualData.opcao_d,
  ];

  return (
    <div className="pq-container">
      {/* HEADER */}
      <header className="wr-header">
        <button className="wr-back" onClick={handleBack} aria-label="Voltar">
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
          }}
        />

        <img src={logo} alt="Logo" className="wr-logo" />
      </header>

      {/* PROGRESSO */}
      <div className="pq-progress-area">
        <p className="pq-progress-text">
          Questão {questaoAtual + 1} de {quiz.questoes.length}
        </p>

        <div className="pq-bar-bg">
          <div
            className="pq-bar-fill"
            style={{
              width: `${progressPercent}%`,
              transition: "width 0.5s ease",
            }}
          ></div>
        </div>

        <div className="pq-timer-box">
          <span className="pq-timer-icon">⏱️</span>
          <p className="pq-timer" style={{ color: time <= 5 ? "#ef4444" : "#374151" }}>
            {formatTime(time)}
          </p>
        </div>

        <h2 className="pq-quiz-title">{quiz.titulo}</h2>
      </div>

      {/* PERGUNTA */}
      <div className="pq-question-box">{questaoAtualData.pergunta}</div>

      {/* OPÇÕES */}
      <div className="pq-options-grid">
        {opcoes.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={optionClass(String.fromCharCode(65 + i))}
            onClick={() => handleSelect(String.fromCharCode(65 + i))}
            aria-pressed={selected === String.fromCharCode(65 + i)}
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
          {submitted ? "Próxima questão..." : "Responder"}
        </button>
      </div>
    </div>
  );
}