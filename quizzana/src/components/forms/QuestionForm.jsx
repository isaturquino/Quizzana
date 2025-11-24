"use client"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import CategoryForm from "./CategoryForm.jsx"
import "./QuestionForm.css"

export default function QuestionForm({ isOpen, onClose, onSave, editingQuestion }) {
  const [enunciado, setEnunciado] = useState("")
  const [categoria, setCategoria] = useState("")
  const [alternativas, setAlternativas] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
  const [categorias, setCategorias] = useState(["Matemática", "APS", "História", "Biologia"])

  useEffect(() => {
    if (editingQuestion) {
      setEnunciado(editingQuestion.question)
      setCategoria(editingQuestion.category)
      setAlternativas(
        editingQuestion.alternatives || [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      )
    } else {
      setEnunciado("")
      setCategoria("")
      setAlternativas([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ])
    }
  }, [editingQuestion, isOpen])

  const handleAddAlternativa = () => {
    setAlternativas([...alternativas, { text: "", isCorrect: false }])
  }

  const handleRemoveAlternativa = (index) => {
    if (alternativas.length > 2) {
      setAlternativas(alternativas.filter((_, i) => i !== index))
    }
  }

  const handleAlternativaChange = (index, field, value) => {
    const newAlternativas = [...alternativas]
    newAlternativas[index][field] = value
    setAlternativas(newAlternativas)
  }

  const handleSave = () => {
    const questionData = {
      question: enunciado,
      category: categoria,
      alternatives: alternativas,
    }
    onSave(questionData)
    handleClose()
  }

  const handleClose = () => {
    setEnunciado("")
    setCategoria("")
    setAlternativas([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ])
    onClose()
  }

  const handleAddCategory = (newCategory) => {
    setCategorias([...categorias, newCategory])
    setCategoria(newCategory)
  }

  const CustomSelect = ({ value, onValueChange, children, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="select-container">
        <button className="select-trigger" onClick={() => setIsOpen(!isOpen)} type="button">
          {value || placeholder}
          <span className="select-arrow">▼</span>
        </button>
        {isOpen && <div className="select-content">{children}</div>}
      </div>
    )
  }

  const SelectItem = ({ value, children, onSelect }) => (
    <div
      className="select-item"
      onClick={() => {
        onSelect(value)
      }}
    >
      {children}
    </div>
  )

  const CustomCheckbox = ({ checked, onCheckedChange }) => (
    <div className={`checkbox ${checked ? "checkbox-checked" : ""}`} onClick={() => onCheckedChange(!checked)}>
      {checked && <span className="checkbox-check">✓</span>}
    </div>
  )

  if (!isOpen) return null

  return (
    <>
      <div className="form-overlay">
        <div className="form-content large-form">
          <div className="form-header">
            <h2 className="form-title">{editingQuestion ? "Editar" : "Adicionar"} Questão</h2>
            <button className="form-close" onClick={handleClose} type="button">
              ×
            </button>
          </div>

          <div className="form-body">
            {/* Enunciado */}
            <div className="form-group">
              <label className="form-label">Enunciado</label>
              <textarea
                value={enunciado}
                onChange={(e) => setEnunciado(e.target.value)}
                placeholder="Digite o enunciado da questão..."
                className="form-textarea"
              />
            </div>

            {/* Categorias */}
            <div className="form-group">
              <label className="form-label">Categorias</label>
              <div className="flex gap-2 items-center">
                <CustomSelect value={categoria} onValueChange={setCategoria} placeholder="Selecione uma categoria">
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat} onSelect={setCategoria}>
                      {cat}
                    </SelectItem>
                  ))}
                  <div className="border-t mt-1 pt-1">
                    <button className="add-category-btn" onClick={() => setIsCategoryFormOpen(true)} type="button">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Categoria
                    </button>
                  </div>
                </CustomSelect>
              </div>
            </div>

            {/* Alternativas */}
            <div className="form-group">
              <label className="form-label">Alternativas</label>
              <div className="alternatives-container">
                {alternativas.map((alt, index) => (
                  <div key={index} className="alternative-row">
                    <input
                      value={alt.text}
                      onChange={(e) => handleAlternativaChange(index, "text", e.target.value)}
                      placeholder={`Alternativa ${index + 1}`}
                      className="alternative-input"
                    />
                    <div className="alternative-actions">
                      <div className="checkbox-container">
                        <CustomCheckbox
                          checked={alt.isCorrect}
                          onCheckedChange={(checked) => handleAlternativaChange(index, "isCorrect", checked)}
                        />
                        <span className="checkbox-label">Correta</span>
                      </div>
                      {alternativas.length > 2 && (
                        <button
                          className="remove-alternative-btn"
                          onClick={() => handleRemoveAlternativa(index)}
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button className="add-alternative-btn" onClick={handleAddAlternativa} type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Alternativa
                </button>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="form-actions">
              <button className="btn-outline" onClick={handleClose} type="button">
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSave} type="button">
                Salvar
              </button>
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
