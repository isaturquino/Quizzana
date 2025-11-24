"use client"

import React from "react"
import { useState } from "react"
import { Search, Plus } from "lucide-react"
import QuestionForm from "../../components/forms/QuestionForm.jsx"
import "./QuestionsPage.css"

export default function QuestionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Dados de exemplo das questões
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "Qual é o valor de x na equação 2x + 5 = 17?",
      category: "Matemática",
      alternatives: [
        { text: "Alternativa 1", isCorrect: false },
        { text: "Alternativa 2", isCorrect: true },
      ],
    },
    {
      id: 2,
      question: "Durante a fase de análise de requisitos de um sistema, qual é ....",
      category: "APS",
      alternatives: [
        { text: "Alternativa 1", isCorrect: true },
        { text: "Alternativa 2", isCorrect: false },
      ],
    },
    {
      id: 3,
      question: "Em que ano ocorreu a Proclamação da República no Brasil?",
      category: "História",
      alternatives: [
        { text: "Alternativa 1", isCorrect: false },
        { text: "Alternativa 2", isCorrect: true },
      ],
    },
    {
      id: 4,
      question: "Qual é a principal função dos glóbulos vermelhos no sangue?",
      category: "Biologia",
      alternatives: [
        { text: "Alternativa 1", isCorrect: true },
        { text: "Alternativa 2", isCorrect: false },
      ],
    },
  ])

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setIsModalOpen(true)
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setIsModalOpen(true)
  }

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const handleSaveQuestion = (questionData) => {
    if (editingQuestion) {
      // Editar questão existente
      setQuestions(questions.map((q) => (q.id === editingQuestion.id ? { ...questionData, id: q.id } : q)))
    } else {
      // Adicionar nova questão
      const newQuestion = {
        ...questionData,
        id: Math.max(...questions.map((q) => q.id), 0) + 1,
      }
      setQuestions([...questions, newQuestion])
    }
    setIsModalOpen(false)
  }

  // Componente Select customizado
  const CustomSelect = ({ value, onValueChange, children, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="select-container">
        <button className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
          {value === "all" ? placeholder : children.find((child) => child.props.value === value)?.props.children}
          <span className="select-arrow">▼</span>
        </button>
        {isOpen && (
          <div className="select-content">
            {React.Children.map(children, (child) =>
              React.cloneElement(child, {
                onSelect: (val) => {
                  onValueChange(val)
                  setIsOpen(false)
                },
              }),
            )}
          </div>
        )}
      </div>
    )
  }

  const SelectItem = ({ value, children, onSelect }) => (
    <div className="select-item" onClick={() => onSelect(value)}>
      {children}
    </div>
  )

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Banco de Questões</h1>
          <p className="page-description">Organize, crie e gerencie suas questões de forma prática</p>
        </div>

        {/* Controles superiores */}
        <div className="controls-row">
          <button onClick={handleAddQuestion} className="btn-primary">
            <Plus className="w-5 h-5" />
            Adicionar Questão
          </button>

          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Filtro de categorias */}
        <div className="filter-section">
          <label className="filter-label">Categorias</label>
          <CustomSelect value={selectedCategory} onValueChange={setSelectedCategory} placeholder="Todas">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="matematica">Matemática</SelectItem>
            <SelectItem value="aps">APS</SelectItem>
            <SelectItem value="historia">História</SelectItem>
            <SelectItem value="biologia">Biologia</SelectItem>
          </CustomSelect>
        </div>

        {/* Tabela de questões */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="questions-table">
            <thead>
              <tr>
                <th>Questão</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.question}</td>
                  <td>{q.category}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditQuestion(q)} className="btn-primary">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="btn-primary">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="pagination">
          <button
            className={currentPage === 1 ? "btn-outline active" : "btn-outline"}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button className="btn-outline" onClick={() => setCurrentPage(2)}>
            2
          </button>
          <button className="btn-outline" onClick={() => setCurrentPage(3)}>
            3
          </button>
          <span className="pagination-ellipsis">...</span>
          <button className="btn-outline" onClick={() => setCurrentPage(20)}>
            20
          </button>
          <button className="btn-outline" onClick={() => setCurrentPage(21)}>
            21
          </button>
        </div>
      </div>

      {/* Form de questão */}
      <QuestionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
        editingQuestion={editingQuestion}
      />
    </div>
  )
}
