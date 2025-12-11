"use client"

import { useState } from "react"
import { Search, ArrowLeft } from "lucide-react"
import SideBar from "../../components/layout/SideBar"
import Header from "../../components/layout/Header"
import QuizForm from "../../components/forms/QuizForm"
import ConfiguracoesForm from "../../components/forms/ConfiguracoesForm"
import { useQuestions } from "../../hooks/useQuestions" 
import Button from "../../components/ui/Button"
import "./CreateQuizPage.css"

function CreateQuiz() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId)
      } else {
        return [...prev, questionId]
      }
    })
  }

  const handleCreateQuiz = () => {
    const quizPayload = {
      ...quizData,
      ...configuracoes,
      questoesSelecionadas: selectedQuestions,
    }
    console.log("Criando quiz:", quizPayload)
  }

  // Filtra questões pelo search e categoria
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "todas" || q.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <p>Carregando questões...</p>
  }

  return (
    <div className="layout">
      <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeItem="criar-quiz" />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Header isSidebarOpen={isSidebarOpen} />

        <div className="create-quiz-content">
          <div className="page-header-quiz">
            <div>
              <h1 className="page-title-quiz">Criar Novo Quiz</h1>
              <p className="page-subtitle-quiz">Configure as opções e selecione as questões</p>
            </div>
            <Button className="btn-primary">Criar sala e gerar QrCode →</Button>
          </div>

          <div className="forms-grid">
            <QuizForm quizData={quizData} setQuizData={setQuizData} />
            <ConfiguracoesForm configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />
          </div>

          <div className="questions-selection-section">
            <h2 className="section-title">Selecionar Questões do Banco</h2>
            <p className="section-subtitle">Escolha as questões que farão parte do quiz</p>

            <div className="questions-filters">
              <div className="filter-group">
                <label className="filter-label">Categoria:</label>
                <select
                  className="filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="matemática">Matemática</option>
                  <option value="aps">APS</option>
                  <option value="história">História</option>
                  <option value="biologia">Biologia</option>
                  <option value="geografia">Geografia</option>
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
              {filteredQuestions.map((question) => (
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
              ))}
            </div>
          </div>

          <div className="actions-footer">
            <button className="btn-voltar">
              <ArrowLeft size={18} />
              Voltar
            </button>
            <button className="btn-criar-quiz" onClick={handleCreateQuiz}>
              Criar sala e gerar QrCode →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateQuiz
