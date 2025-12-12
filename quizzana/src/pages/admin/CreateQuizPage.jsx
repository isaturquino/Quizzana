"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Search, ArrowLeft } from "lucide-react"
import SideBar from "../../components/layout/SideBar"
import Header from "../../components/layout/Header"
import QuizForm from "../../components/forms/QuizForm"
import ConfiguracoesForm from "../../components/forms/ConfiguracoesForm"
import QuizCreatedModal from "../../components/ui/QuizCreatedModal"
import { useQuestions } from "../../hooks/useQuestions" 
import { useCategories } from "../../hooks/useCategories"
import { createQuiz, getQuizById, updateQuiz } from "../../services/supabase/quizService"
import Button from "../../components/ui/Button"
import "./CreateQuizPage.css"

function CreateQuiz() {
  const { id } = useParams() // Pega o ID da URL se existir
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false)
  const isEditing = !!id // Se tem ID, está editando

  // Estado para controlar o modal
  const [showModal, setShowModal] = useState(false)
  const [createdQuizData, setCreatedQuizData] = useState({
    quizId: null,
    quizName: ""
  })

  const [quizData, setQuizData] = useState({
    nome: "",
    descricao: "",
  })

  const [configuracoes, setConfiguracoes] = useState({
    tempoMax: 20,
    numeroQuestoes: 15,
    pontosPorQuestao: 10,
    maxParticipantes: 50,
    embaralharQuestoes: true,
    selecaoAleatoria: true,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [selectedQuestions, setSelectedQuestions] = useState([])

  // Hook para buscar questões do Supabase
  const { questions, loading } = useQuestions()
  
  // Hook para buscar categorias do Supabase
  const { categories, loading: loadingCategories } = useCategories()

  // Carregar dados do quiz se estiver editando
  useEffect(() => {
    if (id) {
      loadQuizData(id)
    }
  }, [id])

  const loadQuizData = async (quizId) => {
    setIsLoadingQuiz(true)
    try {
      const quiz = await getQuizById(quizId)
      
      // Preencher dados do quiz
      setQuizData({
        nome: quiz.titulo,
        descricao: quiz.descricao || "",
      })

      // Preencher configurações
      if (quiz.configuracoes_quiz?.[0]) {
        const config = quiz.configuracoes_quiz[0]
        setConfiguracoes({
          tempoMax: config.tempo_limite,
          numeroQuestoes: config.numero_questoes,
          pontosPorQuestao: config.pontuacao_por_acerto,
          maxParticipantes: config.maximo_participantes,
          embaralharQuestoes: true,
          selecaoAleatoria: true,
        })
      }

      // Preencher questões selecionadas
      if (quiz.quiz_questoes) {
        const questoesIds = quiz.quiz_questoes.map(q => q.id_questao)
        setSelectedQuestions(questoesIds)
      }
    } catch (error) {
      console.error("Erro ao carregar quiz:", error)
      alert("Erro ao carregar dados do quiz!")
    } finally {
      setIsLoadingQuiz(false)
    }
  }

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId)
      } else {
        return [...prev, questionId]
      }
    })
  }

  const handleCreateQuiz = async () => {
    // Validações
    if (!quizData.nome.trim()) {
      alert("Por favor, preencha o nome do quiz!")
      return
    }

    if (selectedQuestions.length === 0) {
      alert("Selecione pelo menos uma questão!")
      return
    }

    setIsCreating(true)

    try {
      let result
      
      if (isEditing) {
        // Atualizar quiz existente
        result = await updateQuiz(id, quizData, configuracoes, selectedQuestions)
        
        if (result.success) {
          alert("Quiz atualizado com sucesso!")
          navigate("/admin/biblioteca")
        } else {
          alert("Erro ao atualizar quiz: " + result.error?.message)
        }
      } else {
        // Criar novo quiz
        result = await createQuiz(quizData, configuracoes, selectedQuestions)

        if (result.success) {
          // Abrir modal com informações do quiz criado
          setCreatedQuizData({
            quizId: result.quizId,
            quizName: quizData.nome
          })
          setShowModal(true)
          
          // Limpar formulário
          setQuizData({ nome: "", descricao: "" })
          setSelectedQuestions([])
        } else {
          alert("Erro ao criar quiz: " + result.error?.message)
        }
      }
    } catch (error) {
      console.error("Erro ao salvar quiz:", error)
      alert("Erro inesperado ao salvar quiz!")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    navigate("/admin/biblioteca")
  }

  // Filtra questões pelo search e categoria
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "todas" || q.categoria_id === Number(selectedCategory)
    return matchesSearch && matchesCategory
  })

  if (loading || loadingCategories || isLoadingQuiz) {
    return (
      <div className="layout">
        <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeItem="criar-quiz" />
        <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <Header isSidebarOpen={isSidebarOpen} />
          <div className="create-quiz-content">
            <p>Carregando {isLoadingQuiz ? 'dados do quiz' : 'questões e categorias'}...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeItem="criar-quiz" />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Header isSidebarOpen={isSidebarOpen} />

        <div className="create-quiz-content">
          <div className="page-header-quiz">
            <div>
              <h1 className="page-title-quiz">
                {isEditing ? 'Editar Quiz' : 'Criar Novo Quiz'}
              </h1>
              <p className="page-subtitle-quiz">Configure as opções e selecione as questões</p>
            </div>
            <Button 
              className="btn-primary" 
              onClick={handleCreateQuiz}
              disabled={isCreating}
            >
              {isCreating ? "Salvando..." : (isEditing ? "Salvar Alterações →" : "Criar Quiz →")}
            </Button>
          </div>

          <div className="forms-grid">
            <QuizForm quizData={quizData} setQuizData={setQuizData} />
            <ConfiguracoesForm configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />
          </div>

          <div className="questions-selection-section">
            <h2 className="section-title">Selecionar Questões do Banco</h2>
            <p className="section-subtitle">
              Escolha as questões que farão parte do quiz ({selectedQuestions.length} selecionadas)
            </p>

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
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  Nenhuma questão encontrada
                </p>
              ) : (
                filteredQuestions.map((question) => (
                  <div key={question.id} className="question-item">
                    <input
                      type="checkbox"
                      id={`question-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleQuestionToggle(question.id)}
                      className="question-checkbox"
                    />
                    <label htmlFor={`question-${question.id}`} className="question-label">
                      {question.question}
                    </label>
                    <span className="category-badge">{question.category}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="actions-footer">
            <button className="btn-voltar" onClick={() => navigate("/admin/biblioteca")}>
              <ArrowLeft size={18} />
              Voltar
            </button>
            <button 
              className="btn-criar-quiz" 
              onClick={handleCreateQuiz}
              disabled={isCreating}
            >
              {isCreating ? "Salvando..." : (isEditing ? "Salvar Alterações →" : "Criar Quiz →")}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Quiz Criado */}
      <QuizCreatedModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        quizId={createdQuizData.quizId}
        quizName={createdQuizData.quizName}
      />
    </div>
  )
}

export default CreateQuiz