"use client"

import { useState } from "react"
import "./CategoryForm.css"

export default function CategoryForm({ isOpen, onClose, onAdd }) {
  const [categoryName, setCategoryName] = useState("")

  const handleSave = () => {
    if (categoryName.trim()) {
      onAdd(categoryName.trim())
      setCategoryName("")
      onClose()
    }
  }

  const handleCancel = () => {
    setCategoryName("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="form-overlay">
      <div className="form-content">
        <div className="form-header">
          <h2 className="form-title">Adicionar Nova Categoria</h2>
          <button className="form-close" onClick={handleCancel} type="button">
            ×
          </button>
        </div>

        <div className="form-body">
          <div className="form-group">
            <label className="form-label">Nome da Categoria</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Digite o nome da categoria..."
              className="form-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave()
                }
              }}
            />
          </div>

          <div className="form-actions">
            <button className="btn-outline" onClick={handleCancel} type="button">
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={!categoryName.trim()} type="button">
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
