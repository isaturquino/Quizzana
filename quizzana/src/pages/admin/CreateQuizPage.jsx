"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import SideBar from "../../components/layout/SideBar";
import Header from "../../components/layout/Header";
import QuizForm from "../../components/forms/QuizForm";
import ConfiguracoesForm from "../../components/forms/ConfiguracoesForm";
import QuizCreatedModal from "../../components/ui/QuizCreatedModal";
import { useQuestions } from "../../hooks/useQuestions";
import { useCategories } from "../../hooks/useCategories";
import {
  createQuiz,
  getQuizById,
  updateQuiz,
} from "../../services/supabase/quizService";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import "./CreateQuizPage.css";

function CreateQuiz() {
  // Usando 'quizId' consistentemente para o ID da URL
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const isEditing = !!quizId; // Checa se está em modo de edição

  const [showModal, setShowModal] = useState(false);
  const [createdQuizData, setCreatedQuizData] = useState({
    quizId: null,
    quizName: "",
    codigoSala: null,
  });

  const [quizData, setQuizData] = useState({
    nome: "",
    descricao: "",
  });

  const [configuracoes, setConfiguracoes] = useState({
    tempoMax: 20,
    numeroQuestoes: 15,
    pontosPorQuestao: 10,
    maxParticipantes: 50,
    embaralharQuestoes: true,
    selecaoAleatoria: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const { questions, loading } = useQuestions();
  const { categories, loading: loadingCategories } = useCategories();

  useEffect(() => {
    // Usa 'quizId' do useParams
    if (quizId && user) {
      loadQuizData(quizId);
    }
  }, [quizId, user]);

  const loadQuizData = async (quizId) => {
    setIsLoadingQuiz(true);
    try {
      const quiz = await getQuizById(quizId);

      setQuizData({
        nome: quiz.titulo,
        descricao: quiz.descricao || "",
      });

      if (quiz.configuracoes_quiz?.[0]) {
        const config = quiz.configuracoes_quiz[0];
        setConfiguracoes({
          tempoMax: config.tempo_limite,
          numeroQuestoes: config.numero_questoes,
          pontosPorQuestao: config.pontuacao_por_acerto,
          maxParticipantes: config.maximo_participantes,
          embaralharQuestoes: true,
          selecaoAleatoria: true,
        });
      }

      if (quiz.quiz_questoes) {
        const questoesIds = quiz.quiz_questoes.map((q) => q.id_questao);
        setSelectedQuestions(questoesIds);
      }
    } catch (error) {
      console.error("Erro ao carregar quiz:", error);
      alert("Erro ao carregar dados do quiz ou ID inválido!");
      navigate("/admin/biblioteca");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  //  VALIDAÇÃO: Bloqueia seleção se atingir o limite
  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        // Permite desmarcar sempre
        return prev.filter((id) => id !== questionId);
      } else {
        //  VERIFICA O LIMITE antes de adicionar
        if (prev.length >= configuracoes.numeroQuestoes) {
          alert(
            `Você só pode selecionar ${configuracoes.numeroQuestoes} questões! Desmarque alguma para adicionar outra.`
          );
          return prev;
        }
        return [...prev, questionId];
      }
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/admin/biblioteca");
  };

  const handleCreateQuiz = async () => {
    if (!user) {
      alert("Você precisa estar logado para criar/editar quizzes!");
      return;
    }

    if (!quizData.nome.trim()) {
      alert("Por favor, preencha o nome do quiz!");
      return;
    }

    if (selectedQuestions.length === 0) {
      alert("Selecione pelo menos uma questão!");
      return;
    }

    // VALIDAÇÃO: Verifica se número de questões selecionadas está correto
    if (selectedQuestions.length !== configuracoes.numeroQuestoes) {
      alert(
        `Você deve selecionar exatamente ${configuracoes.numeroQuestoes} questões! (Atualmente: ${selectedQuestions.length})`
      );
      return;
    }

    setIsCreating(true);

    try {
      let result;

      if (isEditing) {
        // Usa quizId
        result = await updateQuiz(
          quizId,
          quizData,
          configuracoes,
          selectedQuestions
        );

        if (result.success) {
          alert("Quiz atualizado com sucesso!");
          navigate("/admin/biblioteca");
        } else {
          alert("Erro ao atualizar quiz: " + result.error?.message);
        }
      } else {
        result = await createQuiz(
          quizData,
          configuracoes,
          selectedQuestions,
          user.id
        );

        if (result.success) {
          setCreatedQuizData({
            quizId: result.quizId,
            quizName: quizData.nome,
            codigoSala: result.codigoSala,
          });
          setShowModal(true);

          setQuizData({ nome: "", descricao: "" });
          setSelectedQuestions([]);
        } else {
          alert("Erro ao criar quiz: " + result.error?.message);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar quiz:", error);
      alert("Erro inesperado ao salvar quiz!");
    } finally {
      setIsCreating(false);
    }
  };


  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "todas" ||
      q.categoria_id === Number(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading || loadingCategories || isLoadingQuiz) {
    return (
      <div className="layout">
        <SideBar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          activeItem="criar-quiz"
        />
        <div
          className={`main-content ${
            isSidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
        >
          <Header isSidebarOpen={isSidebarOpen} />
          <div className="create-quiz-content">
            <p>
              Carregando{" "}
              {isLoadingQuiz ? "dados do quiz" : "questões e categorias"}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  //  CALCULA quantas questões ainda podem ser selecionadas
  const questoesRestantes =
    configuracoes.numeroQuestoes - selectedQuestions.length;

  return (
    <div className="layout">
      <SideBar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeItem="criar-quiz"
      />
      <div
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Header isSidebarOpen={isSidebarOpen} />

        <div className="create-quiz-content">
          <div className="page-header-quiz">
            <div className="header-titles">
              <h1 className="page-title-quiz">
                {isEditing ? "Editar Quiz" : "Criar Novo Quiz"}
              </h1>
              <p className="page-subtitle-quiz">
                Configure as opções e selecione as questões
              </p>
            </div>

            {/* BOTÕES DE AÇÃO NO MODO EDIÇÃO */}
            {isEditing && (
              <div className="edit-actions-buttons">
                {/* Botão Compartilhar Quiz */}
                <Button className="btn-primary" onClick={() => setShowModal(true)}>
                        Compartilhar quiz
                </Button>
              </div>
            )}

            {/* BOTÃO PRINCIPAL (SALVAR/CRIAR) */}
            <Button
              className="btn-primary"
              onClick={handleCreateQuiz}
              disabled={
                isCreating ||
                selectedQuestions.length !== configuracoes.numeroQuestoes
              }
              style={{
                opacity:
                  selectedQuestions.length !== configuracoes.numeroQuestoes
                    ? 0.6
                    : 1,
              }}
            >
              {isCreating
                ? "Salvando..."
                : isEditing
                ? "Salvar Alterações →"
                : "Criar Quiz →"}
            </Button>
          </div>

          <div className="forms-grid">
            <QuizForm quizData={quizData} setQuizData={setQuizData} />
            <ConfiguracoesForm
              configuracoes={configuracoes}
              setConfiguracoes={setConfiguracoes}
            />
          </div>

          <div className="questions-selection-section">
            <h2 className="section-title">Selecionar Questões do Banco</h2>

            {/* ✅ INDICADOR DE PROGRESSO */}
            <div
              style={{
                background: questoesRestantes === 0 ? "#d4edda" : "#fff3cd",
                border: `2px solid ${
                  questoesRestantes === 0 ? "#28a745" : "#ffc107"
                }`,
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "24px" }}>
                {questoesRestantes === 0 ? "✅" : "⚠️"}
              </span>
              <div>
                <strong>
                  {selectedQuestions.length} de {configuracoes.numeroQuestoes}{" "}
                  questões selecionadas
                </strong>
                {questoesRestantes > 0 ? (
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    Selecione mais {questoesRestantes} questão(ões) para atingir
                    o limite configurado
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: "14px", color: "#155724" }}>
                    ✓ Limite atingido! Você pode criar o quiz agora.
                  </p>
                )}
              </div>
            </div>

            <div className="questions-filters">
              <div className="filter-group">
                <label className="filter-label">Categoria:</label>
                <select
                  className="filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-questions">
                <Search className="search-icon-small" size={18} />
                <input
                  type="text"
                  placeholder="Buscar Questão ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-questions"
                />
              </div>
            </div>

            <div className="questions-list">
              {filteredQuestions.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#666",
                    padding: "20px",
                  }}
                >
                  Nenhuma questão encontrada
                </p>
              ) : (
                filteredQuestions.map((question) => {
                  const isSelected = selectedQuestions.includes(question.id);
                  const isDisabled =
                    !isSelected &&
                    selectedQuestions.length >= configuracoes.numeroQuestoes;

                  return (
                    <div
                      key={question.id}
                      className={`question-item ${
                        isDisabled ? "question-item-disabled" : ""
                      }`}
                      style={{
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`question-${question.id}`}
                        checked={isSelected}
                        onChange={() => handleQuestionToggle(question.id)}
                        className="question-checkbox"
                        disabled={isDisabled}
                      />
                      <label
                        htmlFor={`question-${question.id}`}
                        className="question-label"
                        style={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                        }}
                      >
                        {question.question}
                      </label>
                      <span className="category-badge">
                        {question.category}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="actions-footer">
            <button
              className="btn-voltar"
              onClick={() => navigate("/admin/biblioteca")}
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <button
              className="btn-criar-quiz"
              onClick={handleCreateQuiz}
              disabled={
                isCreating ||
                selectedQuestions.length !== configuracoes.numeroQuestoes
              }
              style={{
                opacity:
                  selectedQuestions.length !== configuracoes.numeroQuestoes
                    ? 0.6
                    : 1,
              }}
            >
              {isCreating
                ? "Salvando..."
                : isEditing
                ? "Salvar Alterações →"
                : "Criar Quiz →"}
            </button>
          </div>
        </div>
      </div>

      <QuizCreatedModal
        isOpen={showModal}
        onClose={handleCloseModal}
        quizId={createdQuizData.quizId}
        quizName={createdQuizData.quizName}
        codigoSala={createdQuizData.codigoSala}
      />
    </div>
  );
}

export default CreateQuiz;
