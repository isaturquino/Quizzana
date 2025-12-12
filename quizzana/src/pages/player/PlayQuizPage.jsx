// PlayQuizPage.jsx - COM SUPABASE
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase/supabaseClient";
import "./PlayQuizPage.css";
import headerImg from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzanalogo.png";

export default function PlayQuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams(); // ID do quiz vindo da URL
  
  // TEMPORÁRIO: Se não houver quizId na URL, use um ID de teste
  const quizIdFinal = quizId || 1; // Substitua '1' pelo ID de um quiz existente no seu banco

  // ESTADOS
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [time, setTime] = useState(30);

  // BUSCAR QUIZ E QUESTÕES DO SUPABASE
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar dados do quiz
        const { data: quizData, error: quizError } = await supabase
          .from("quiz")
          .select("*")
          .eq("id", quizIdFinal);

        if (quizError) throw quizError;
        
        if (!quizData || quizData.length === 0) {
          throw new Error("Quiz não encontrado");
        }
        
        const quiz = quizData[0]; // Pega o primeiro resultado

        // 2. Buscar questões relacionadas ao quiz através da tabela de relacionamento
        const { data: quizQuestoesData, error: relError } = await supabase
          .from("quiz_questoes")
          .select("id_questao")
          .eq("id_quiz", quizIdFinal);

        if (relError) throw relError;

        // 3. Extrair IDs das questões
        const questoesIds = quizQuestoesData.map(item => item.id_questao);

        // 4. Buscar detalhes das questões
        const { data: questoesData, error: questoesError } = await supabase
          .from("questoes")
          .select("*")
          .in("id", questoesIds);

        if (questoesError) throw questoesError;

        // 5. Formatar dados para o componente
        const quizCompleto = {
          id: quiz.id,
          titulo: quiz.titulo || "Quiz",
          questoes: questoesData.map(q => ({
            id: q.id,
            pergunta: q.enunciado,
            opcao_a: q.alternativaA,
            opcao_b: q.alternativaB,
            opcao_c: q.alternativaC,
            opcao_d: q.alternativaD,
            resposta_correta: q.respostaCorreta,
            categoria_id: q.categoria_id,
          })),
        };

        setQuiz(quizCompleto);
      } catch (err) {
        console.error("Erro ao carregar quiz:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (quizIdFinal) {
      fetchQuiz();
    } else {
      setError("ID do quiz não fornecido");
      setLoading(false);
    }
  }, [quizIdFinal]);

  // TIMER
  useEffect(() => {
    if (!quiz || submitted || time <= 0) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          handleSubmit();
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
    if (!quiz || (selected === null && time > 0)) return;

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

  // PRÓXIMA QUESTÃO
  function proximaQuestao() {
    if (questaoAtual < quiz.questoes.length - 1) {
      setQuestaoAtual(questaoAtual + 1);
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
    
    // OPCIONAL: Salvar resultado no Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("resultados_quiz").insert({
          user_id: user.id,
          quiz_id: quiz.id,
          pontuacao: pontuacao,
          total_questoes: quiz.questoes.length,
          respostas: respostas,
          data_conclusao: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Erro ao salvar resultado:", err);
    }

    alert(`Quiz finalizado! Você acertou ${pontuacao} de ${quiz.questoes.length} questões!`);
    navigate("/");
  }

  // VOLTAR
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

  // FORMATAR TIMER
  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ESTADOS DE LOADING E ERRO
  if (loading) {
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

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "4rem 2rem",
          minHeight: "60vh"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "2rem"
          }}></div>
          <p style={{ 
            fontSize: "1.25rem", 
            color: "#6b7280",
            fontWeight: "500"
          }}>
            Carregando quiz...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !quiz) {
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

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "3rem 2rem",
          minHeight: "60vh"
        }}>
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fef3c7 0%, #fca5a5 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2rem",
            boxShadow: "0 10px 30px rgba(252, 165, 165, 0.3)"
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          
          <h2 style={{ 
            fontSize: "2rem", 
            marginBottom: "1rem", 
            color: "#111827",
            fontWeight: "700"
          }}>
            Quiz não encontrado
          </h2>
          
          <p style={{ 
            color: "#6b7280", 
            marginBottom: "2.5rem",
            fontSize: "1.1rem",
            maxWidth: "500px",
            textAlign: "center",
            lineHeight: "1.6"
          }}>
            {error || "Não foi possível carregar o quiz. Verifique se o ID está correto ou tente novamente mais tarde."}
          </p>
          
          <button 
            onClick={() => navigate("/")} 
            style={{ 
              padding: "1rem 2.5rem",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              transform: "translateY(0)"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.4)";
            }}
          >
            ← Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  if (!quiz.questoes || quiz.questoes.length === 0) {
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

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "3rem 2rem",
          minHeight: "60vh"
        }}>
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2rem",
            boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)"
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          
          <h2 style={{ 
            fontSize: "2rem", 
            marginBottom: "0.5rem", 
            color: "#111827",
            fontWeight: "700"
          }}>
            {quiz.titulo || "Quiz"}
          </h2>
          
          <p style={{ 
            color: "#6b7280", 
            marginBottom: "2.5rem",
            fontSize: "1.1rem",
            maxWidth: "500px",
            textAlign: "center",
            lineHeight: "1.6"
          }}>
            Este quiz ainda não possui questões cadastradas. Em breve teremos conteúdo disponível!
          </p>
          
          <button 
            onClick={() => navigate("/")} 
            style={{ 
              padding: "1rem 2.5rem",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              transform: "translateY(0)"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.4)";
            }}
          >
            ← Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // PROGRESSO
  const progressPercent = ((questaoAtual + 1) / quiz.questoes.length) * 100;

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