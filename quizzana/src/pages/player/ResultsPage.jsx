import React, { useContext, useState } from "react"; // ⚠️ Adicionei useState e useContext
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../../components/layout/TopBar";
import "./ResultsPage.css";
import { AuthContext } from "../../context/AuthContext";
import { Bar } from "react-chartjs-2";
import { useResults } from "../../hooks/useResults"; // Lógica de Admin/Dados deve estar aqui!

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ResultsPage() {
  const { salaId } = useParams(); // Pega da URL
  
  // ✅ CORREÇÃO 1: Mantém o user para passar ao hook
  const { user } = useContext(AuthContext); 
  
  // ❌ REMOVIDO: const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();

  // ✅ CORREÇÃO 2: Passa o 'user' para o useResults
  const {
    loading,
    isAdmin, // ✅ ESTE isAdmin vem agora do useResults (corrigido abaixo)
    ranking,
    generalStats,
    mostMissed,
    mostCorrect,
    performance,
    error,
  } = useResults(salaId, user); // <--- PASSANDO O USER AQUI!

  // ========== CONFIGURAÇÃO DO GRÁFICO ==========
  const desempenhoPorQuestao = {
    labels: performance.map((d) => `Q${d.questao}`),
    datasets: [
      {
        label: "% de Acerto",
        data: performance.map((d) => d.porcentagem),
        backgroundColor: "rgba(153,102,255,0.7)",
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => value + "%" },
      },
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  // ========== ESTADOS DE LOADING E ERRO ==========
  if (loading) {
    return (
      <div className="res-container">
        <TopBar onBack={() => navigate(-1)} />
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="res-container">
        <TopBar onBack={() => navigate(-1)} />
        <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // ❌ REMOVIDO: O bloco useEffect que fazia a checagem de Admin localmente
  // Ele estava em conflito com o 'isAdmin' vindo do hook.

  // ========== RENDERIZAÇÃO ==========
  return (
    <div className="res-container">
      <TopBar onBack={() => navigate(-1)} />

      <h2 className="res-page-title">
        {isAdmin ? "Resultado do Quiz (Admin)" : "Resultado do Quiz"}
      </h2>

      {/* ========== STATS GERAIS (Só Admin vê os cards) ========== */}
      {isAdmin && (
        <div className="res-top-stats">
          {/* ... Cards de Média de Acertos, Pontuação Média e Participantes ... */}
          <div className="res-card">
            <p className="res-card-label">Média de Acertos</p>
            <p className="res-card-value">{generalStats.mediaAcertos}</p>
            <p className="res-card-sub">De {generalStats.participantes > 0 ? generalStats.participantes : 0} participantes</p>
          </div>

          <div className="res-card">
            <p className="res-card-label">Pontuação Média</p>
            <p className="res-card-value">{generalStats.mediaPontuacao}</p>
            <p className="res-card-sub">Pontos por jogador</p>
          </div>

          <div className="res-card">
            <p className="res-card-label">Total de Participantes</p>
            <p className="res-card-value">{generalStats.participantes}</p>
            <p className="res-card-sub">Jogadores ativos</p>
          </div>
        </div>
      )}

      {/* ========== RANKING (TODOS VEEM) ========== */}
      <div className="res-panel">
        <p className="res-panel-title">🏆 Ranking Final</p>
        
        {/* ... código do Ranking ... */}
        <table className="res-table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Nome</th>
              <th style={{ textAlign: "right" }}>Acertos</th>
              <th style={{ textAlign: "right" }}>Pontuação</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", opacity: 0.5 }}>
                  Nenhum resultado disponível
                </td>
              </tr>
            ) : (
              ranking.map((item) => (
                <tr key={item.pos}>
                  <td>
                    {item.pos === 1 && "🥇 "}
                    {item.pos === 2 && "🥈 "}
                    {item.pos === 3 && "🥉 "}
                    {item.pos > 3 && `${item.pos}º`}
                  </td>
                  <td>{item.nome}</td>
                  <td style={{ textAlign: "right" }}>{item.acertos}</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>
                    {item.pontuacao} pts
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== SEÇÃO ADMIN (SÓ SE isAdmin for TRUE) ========== */}
      {isAdmin && (
        <>
          {/* QUESTÕES MAIS ERRADAS (mantido) */}
          <div className="res-panel">
            <p className="res-panel-title" style={{ color: "#c30000" }}>
              ❌ Questões Mais Erradas
            </p>
            {/* ... código da tabela de mais erradas ... */}
            {mostMissed.length === 0 ? (
              <p style={{ opacity: 0.5 }}>Nenhum dado disponível</p>
            ) : (
              <table className="res-table">
                <thead>
                  <tr>
                    <th>Questão</th>
                    <th style={{ textAlign: "right" }}>Erros</th>
                    <th style={{ textAlign: "right" }}>Taxa de Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {mostMissed.map((q, idx) => (
                    <tr key={idx}>
                      <td>{q.enunciado.substring(0, 60)}...</td>
                      <td style={{ textAlign: "right" }}>
                        {q.erros}/{q.total}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          color: "#c30000",
                          fontWeight: "bold",
                        }}
                      >
                        {q.porcentagemErro}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>


          {/* QUESTÕES MAIS ACERTADAS (mantido) */}
          <div className="res-panel">
            <p className="res-panel-title" style={{ color: "#067a2f" }}>
              ✅ Questões Mais Acertadas
            </p>
            {/* ... código da tabela de mais acertadas ... */}
            {mostCorrect.length === 0 ? (
              <p style={{ opacity: 0.5 }}>Nenhum dado disponível</p>
            ) : (
              <table className="res-table">
                <thead>
                  <tr>
                    <th>Questão</th>
                    <th style={{ textAlign: "right" }}>Acertos</th>
                    <th style={{ textAlign: "right" }}>Taxa de Acerto</th>
                  </tr>
                </thead>
                <tbody>
                  {mostCorrect.map((q, idx) => (
                    <tr key={idx}>
                      <td>{q.enunciado.substring(0, 60)}...</td>
                      <td style={{ textAlign: "right" }}>
                        {q.acertos}/{q.total}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          color: "#067a2f",
                          fontWeight: "bold",
                        }}
                      >
                        {q.porcentagemAcerto}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* GRÁFICO DE DESEMPENHO (mantido) */}
          <div className="res-chart">
            <div className="res-chart-wrapper">
              <p className="res-chart-title">📊 Desempenho por Questão</p>

              {performance.length === 0 ? (
                <p style={{ opacity: 0.5 }}>Nenhum dado disponível</p>
              ) : (
                <div style={{ height: "300px" }}>
                  <Bar data={desempenhoPorQuestao} options={chartOptions} />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========== MENSAGEM PARA JOGADORES (SÓ SE isAdmin for FALSE) ========== */}
      {!isAdmin && (
        <div
          className="res-panel"
          style={{
            background: "#f0f7ff",
            border: "2px solid #4a9eff",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <p style={{ margin: 0, color: "#1a5490", fontWeight: "500" }}>
            ℹ️ Você está visualizando o ranking final. Relatórios detalhados
            estão disponíveis apenas para o criador do quiz.
          </p>
        </div>
      )}
     <button
        className="res-back-dashboard"
        onClick={() => navigate(isAdmin ? "/admin" : "/")} // <-- Rota condicional!
      >
        {isAdmin ? "Voltar ao Dashboard Admin" : "Voltar à Página Inicial"}
      </button>
    </div>
  );
}