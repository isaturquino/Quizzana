"use client"
import "./ConfiguracoesForm.css"

function ConfiguracoesForm({ configuracoes, setConfiguracoes }) {
  const handleChange = (field, value) => {
    setConfiguracoes((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleToggle = (field) => {
    setConfiguracoes((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="config-form-card">
      <h3 className="form-title">Configurações do Quiz</h3>
      <p className="form-subtitle">Configure como o quiz funcionará</p>

      <div className="form-group">
        <label htmlFor="tempoMax" className="form-label">
          Tempo máx.
        </label>
        <select
          id="tempoMax"
          className="form-select"
          value={configuracoes.tempoMax}
          onChange={(e) => handleChange("tempoMax", Number(e.target.value))}
        >
          <option value={10}>⏱️ 10 minutos</option>
          <option value={20}>⏱️ 20 minutos</option>
          <option value={30}>⏱️ 30 minutos</option>
          <option value={45}>⏱️ 45 minutos</option>
          <option value={60}>⏱️ 60 minutos</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="numeroQuestoes" className="form-label">
          Número de Questões
        </label>
        <select
          id="numeroQuestoes"
          className="form-select"
          value={configuracoes.numeroQuestoes}
          onChange={(e) => handleChange("numeroQuestoes", Number(e.target.value))}
        >
          <option value={5}>📝 5</option>
          <option value={10}>📝 10</option>
          <option value={15}>📝 15</option>
          <option value={20}>📝 20</option>
          <option value={25}>📝 25</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="pontosPorQuestao" className="form-label">
          Pontos por Questão
        </label>
        <select
          id="pontosPorQuestao"
          className="form-select"
          value={configuracoes.pontosPorQuestao}
          onChange={(e) => handleChange("pontosPorQuestao", Number(e.target.value))}
        >
          <option value={5}>⭐ 5</option>
          <option value={10}>⭐ 10</option>
          <option value={15}>⭐ 15</option>
          <option value={20}>⭐ 20</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="maxParticipantes" className="form-label">
          Máx. Participantes
        </label>
        <select
          id="maxParticipantes"
          className="form-select"
          value={configuracoes.maxParticipantes}
          onChange={(e) => handleChange("maxParticipantes", Number(e.target.value))}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </div>

      <div className="form-group-toggle">
        <div className="toggle-content">
          <label className="toggle-label">Embaralhar Questões</label>
          <p className="toggle-description">Mostrar em ordem aleatória</p>
        </div>
        <button
          className={`toggle-switch ${configuracoes.embaralharQuestoes ? "active" : ""}`}
          onClick={() => handleToggle("embaralharQuestoes")}
          aria-pressed={configuracoes.embaralharQuestoes}
        >
          <span className="toggle-slider" />
        </button>
      </div>

      <div className="form-group-toggle">
        <div className="toggle-content">
          <label className="toggle-label">Seleção Aleatória</label>
          <p className="toggle-description">Sistema escolhe questões automaticamente</p>
        </div>
        <button
          className={`toggle-switch ${configuracoes.selecaoAleatoria ? "active" : ""}`}
          onClick={() => handleToggle("selecaoAleatoria")}
          aria-pressed={configuracoes.selecaoAleatoria}
        >
          <span className="toggle-slider" />
        </button>
      </div>
    </div>
  )
}

export default ConfiguracoesForm
