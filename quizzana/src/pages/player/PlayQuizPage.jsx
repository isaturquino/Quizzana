import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase/supabaseClient";
import { salvarResposta } from "../../services/supabase/respostaService";
import "./PlayQuizPage.css";
import headerImg from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzanalogo.png";

export default function PlayQuizPage() {
  const navigate = useNavigate();


  const { salaId } = useParams();
  const salaIdFinal = Number(salaId);

  // ESTADOS 
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [time, setTime] = useState(30);

  const jogador = JSON.parse(localStorage.getItem("jogador"));
  const sala = JSON.parse(localStorage.getItem("sala"));


  // BUSCAR QUIZ + SALA
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        setError(null);

        // 1️ BUSCAR SALA PELO ID
        const { data: salaData, error: salaError } = await supabase
          .from("sala")
          .select("id, ativa, id_quiz")
          .eq("id", salaIdFinal)
          .single();

        if (salaError || !salaData || !salaData.ativa) {
          throw new Error("Sala encerrada ou inválida.");
        }

        const quizIdFinal = salaData.id_quiz;

        // 2️ Buscar quiz 
        const { data: quizData, error: quizError } = await supabase
          .from("quiz")
          .select("*")
          .eq("id", quizIdFinal)
          .single();

        if (quizError || !quizData) {
          throw new Error("Quiz não encontrado.");
        }

        // 3️ Buscar relação quiz → questões
        const { data: quizQuestoesData, error: relError } = await supabase
          .from("quiz_questoes")
          .select("id_questao")
          .eq("id_quiz", quizIdFinal);

        if (relError) throw relError;

        const questoesIds = quizQuestoesData.map((q) => q.id_questao);

        // 4️ Buscar questões 
        const { data: questoesData, error: questoesError } = await supabase
          .from("questoes")
          .select("*")
          .in("id", questoesIds);

        if (questoesError) throw questoesError;

        const quizCompleto = {
          id: quizData.id,
          titulo: quizData.titulo || "Quiz",
          questoes: questoesData.map((q) => ({
            id: q.id,
            pergunta: q.enunciado,
            opcao_a: q.alternativaA,
            opcao_b: q.alternativaB,
            opcao_c: q.alternativaC,
            opcao_d: q.alternativaD,
            resposta_correta: q.respostaCorreta,
          })),
        };

        setQuiz(quizCompleto);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }


    if (salaIdFinal && !isNaN(salaIdFinal)) {
      fetchQuiz();
    } else {
      setError("ID da sala inválido.");
      setLoading(false);
    }
  }, [salaIdFinal]);

  // TIMER 
  useEffect(() => {
    if (!quiz || submitted || time <= 0) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          setTimeout(() => handleSubmit(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [time, submitted, quiz]);

  // SELECIONAR OPÇÃO
  function handleSelect(opcao) {
    if (!submitted) setSelected(opcao);
  }

  // SUBMETER RESPOSTA
  function handleSubmit() {
  if (!quiz || submitted) return;

  setSubmitted(true);

  const questaoAtualData = quiz.questoes[questaoAtual];
  const acertou = selected === questaoAtualData.resposta_correta;

  const jogador = JSON.parse(localStorage.getItem("jogador"));

  const pontuacao = acertou ? 1 : 0;

  // SALVAR NO BANCO
  salvarResposta({
    idJogador: jogador.id,
    idQuestao: questaoAtualData.id,
    idSala: sala.id,
    alternativaEscolhida: selected,
    respostaCorreta: questaoAtualData.resposta_correta,
    pontuacaoObtida: pontuacao,
  }).catch((err) => {
    console.error("Erro ao salvar resposta:", err);
  });

  // continua salvando local também 
  setRespostas((prev) => [
    ...prev,
    {
      questao_id: questaoAtualData.id,
      resposta_usuario: selected,
      correta: acertou,
      tempo_resposta: 30 - time,
    },
  ]);

  setTimeout(() => {
    proximaQuestao();
  }, 2000);
}


  // PRÓXIMA QUESTÃO
  function proximaQuestao() {
    if (questaoAtual < quiz.questoes.length - 1) {
      setQuestaoAtual((prev) => prev + 1);
      setSelected(null);
      setSubmitted(false);
      setTime(30);
    } else {
      finalizarQuiz();
    }
  }

  // FINALIZAR QUIZ
  async function finalizarQuiz() {
    const pontuacao = respostas.filter((r) => r.correta).length;

    alert(
      `Quiz finalizado! Você acertou ${pontuacao} de ${quiz.questoes.length} questões!`
    );

    navigate("/");
  }

  // VOLTAR
  function handleBack() {
    if (window.confirm("Deseja sair? Seu progresso será perdido.")) {
      navigate("/");
    }
  }

  // CLASSE DAS OPÇÕES
  function optionClass(opcao) {
    const questaoAtualData = quiz.questoes[questaoAtual];

    if (!submitted) {
      return selected === opcao ? "pq-option selected" : "pq-option";
    }

    if (opcao === questaoAtualData.resposta_correta) {
      return "pq-option correct";
    }

    if (opcao === selected) {
      return "pq-option wrong";
    }

    return "pq-option";
  }

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // FALLBACKS (NÃO MEXI)
  if (loading) {
    return <div className="pq-fallback-state">Carregando...</div>;
  }

  if (error || !quiz) {
    return (
      <div className="pq-fallback-state">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Voltar</button>
      </div>
    );
  }

  const progressPercent =
    ((questaoAtual + 1) / quiz.questoes.length) * 100;

  const questaoAtualData = quiz.questoes[questaoAtual];
  const opcoes = [
    questaoAtualData.opcao_a,
    questaoAtualData.opcao_b,
    questaoAtualData.opcao_c,
    questaoAtualData.opcao_d,
  ];

  return (
    <div className="pq-container">
      <header className="wr-header">
        <button className="wr-back" onClick={handleBack}>←</button>
        <div
          className="wr-header-bar"
          style={{ backgroundImage: `url(${headerImg})` }}
        />
        <img src={logo} className="wr-logo" alt="Logo" />
      </header>

      <div className="pq-progress-area">
        <p className="pq-progress-text">
          Questão {questaoAtual + 1} de {quiz.questoes.length}
        </p>

        <div className="pq-bar-bg">
          <div
            className="pq-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="pq-timer-box">
          <span>⏱️</span>
          <p className={`pq-timer ${time <= 5 ? "pq-timer-critical" : ""}`}>
            {formatTime(time)}
          </p>
        </div>

        <h2 className="pq-quiz-title">{quiz.titulo}</h2>
      </div>

      <div className="pq-question-box">{questaoAtualData.pergunta}</div>

      <div className="pq-options-grid">
        {opcoes.map((opt, i) => {
          const letra = String.fromCharCode(65 + i);
          return (
            <button
              key={letra}
              className={optionClass(letra)}
              onClick={() => handleSelect(letra)}
              disabled={submitted}
            >
              <span className="pq-opt-label">{letra}</span>
              <span className="pq-opt-text">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="pq-submit-area">
        <button
          className="pq-submit-btn"
          onClick={handleSubmit}
          disabled={selected === null || submitted}
        >
          {submitted ? "Próxima..." : "Responder"}
        </button>
      </div>
    </div>
  );
}
