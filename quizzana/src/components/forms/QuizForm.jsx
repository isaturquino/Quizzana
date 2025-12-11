"use client"
import "./QuizForm.css"

function QuizForm({ quizData, setQuizData }) {
  const handleChange = (field, value) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="quiz-form-card">
      <h3 className="form-title">Detalhes do Quiz</h3>
      <p className="form-subtitle">Informações básicas sobre o quiz</p>

      <div className="form-group">
        <label htmlFor="nome" className="form-label">
          Nome
        </label>
        <input
          type="text"
          id="nome"
          className="form-input"
          placeholder="Quiz Gincana 2025"
          value={quizData.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="descricao" className="form-label">
          Descrição
        </label>
        <textarea
          id="descricao"
          className="form-textarea"
          placeholder="Conhecimentos sobre a última gincana. Teste o que você sabe sobre as provas flamingosas, recreativas, esportivas e culturais."
          rows={5}
          value={quizData.descricao}
          onChange={(e) => handleChange("descricao", e.target.value)}
        />
      </div>
    </div>
  )
}

export default QuizForm
