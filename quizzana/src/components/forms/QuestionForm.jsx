"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import CategoryForm from "./CategoryForm.jsx"
import { addCategory } from "../../services/supabase/categoria.js"
import "./QuestionForm.css"

export default function QuestionForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingQuestion, 
  categories,
  refetchCategories 
}) {
  
  const [enunciado, setEnunciado] = useState("")
  const [categoriaId, setCategoriaId] = useState(null)

  const [alternativas, setAlternativas] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
  ])

  

  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)

  // Preencher ao editar
  useEffect(() => {
    if (editingQuestion) {
      setEnunciado(editingQuestion.question)
      setCategoriaId(editingQuestion.categoria_id)

      // Ajustar alternativas com base na letra (A/B/C/D)
      const letters = ["A", "B", "C", "D"]

      setAlternativas(
        editingQuestion.alternatives.map((alt, i) => ({
          text: alt,
          isCorrect: editingQuestion.correctAnswer === letters[i]
        }))
      )

    } else {
      setEnunciado("")
      setCategoriaId(null)
      setAlternativas([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ])
    }
  }, [editingQuestion, isOpen])

  // Salvar questão
  const handleSave = () => {
    const correctIndex = alternativas.findIndex(a => a.isCorrect)

    if (correctIndex === -1) {
      alert("Selecione uma alternativa correta antes de salvar.")
      return
    }

    const formatted = alternativas.map(a => a.text)
    const letters = ["A", "B", "C", "D"]

    const questionData = {
      question: enunciado,
      alternatives: formatted,
      correctAnswer: letters[correctIndex],
      categoryId: categoriaId
    }

    onSave(questionData)
  }

  // Criar categoria
  const handleAddCategory = async (categoryName) => {
    const newCat = await addCategory(categoryName)
    await refetchCategories()
    setCategoriaId(newCat.id)
    setIsCategoryFormOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="form-overlay">
        <div className="form-content large-form">

          <div className="form-header">
            <h2 className="form-title">
              {editingQuestion ? "Editar Questão" : "Adicionar Questão"}
            </h2>
            <button className="form-close" onClick={onClose}>×</button>
          </div>

          <div className="form-body">

            {/* Enunciado */}
            <div className="form-group">
              <label className="form-label">Enunciado</label>
              <textarea
                className="form-textarea"
                value={enunciado}
                onChange={(e) => setEnunciado(e.target.value)}
              />
            </div>

            {/* Categoria */}
            <div className="form-group">
              <label className="form-label">Categoria</label>

              <div className="flex gap-2 items-center">

                <select
                  className="form-select"
                  value={categoriaId || ""}
                  onChange={(e) => setCategoriaId(Number(e.target.value))}
                >
                  <option value="">Selecione...</option>

                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn-primary flex items-center gap-2"
                  onClick={() => setIsCategoryFormOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Nova
                </button>

              </div>
            </div>

            {/* Alternativas */}
            <div className="form-group">
              <label className="form-label">Alternativas</label>

              {alternativas.map((alt, index) => (
                <div key={index} className="alternative-row">

                  <input
                    className="alternative-input"
                    value={alt.text}
                    onChange={(e) => {
                      const newAlt = [...alternativas]
                      newAlt[index].text = e.target.value
                      setAlternativas(newAlt)
                    }}
                  />

                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="correta"
                      checked={alt.isCorrect}
                      onChange={() => {
                        const newAlt = alternativas.map((a, i) => ({
                          ...a,
                          isCorrect: i === index
                        }))
                        setAlternativas(newAlt)
                      }}
                    />
                    Correta
                  </label>

                </div>
              ))}
            </div>

            {/* Botões */}
            <div className="form-actions">
              <button className="btn-outline" onClick={onClose}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave}>Salvar</button>
            </div>

          </div>

        </div>
      </div>

      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onAdd={handleAddCategory}
      />
    </>
  )
}
