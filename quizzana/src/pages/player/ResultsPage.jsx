/* --- COMPONENTE REACT COMPLETO --- */
import React from "react";
import TopBar from "../../components/layout/TopBar";
import "./ResultsPage.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ResultsPage() {
  const geral = {
    taxaAcertos: 7.3,
    tempoMedio: 18,
    participantes: 4
  };

  const ranking = [
    { pos: 1, nome: "Jogador", acertos: "4/10" },
    { pos: 2, nome: "Jogador", acertos: "3/10" },
    { pos: 3, nome: "Jogador", acertos: "2/10" },
    { pos: 4, nome: "Jogador", acertos: "1/10" }
  ].sort((a, b) => b.acertos.split('/')[0] - a.acertos.split('/')[0]);

  const questoesMaisErradas = [
    { texto: "What is the basic unit of life?", perc: 92 },
    { texto: "Which organelle is responsible for...?", perc: 92 },
    { texto: "What is the process of cell division...?", perc: 92 },
    { texto: "Which of the following is NOT a...?", perc: 92 },
    { texto: "What is the main function of mito...?", perc: 92 }
  ];

  const questoesMaisAcertadas = [
    { texto: "What is the basic unit of life?", perc: 92 },
    { texto: "Which organelle is responsible for...?", perc: 92 },
    { texto: "What is the process of cell division...?", perc: 92 },
    { texto: "Which of the following is NOT a...?", perc: 92 },
    { texto: "What is the main function of mito...?", perc: 92 }
  ];

  const desempenhoPorQuestao = {
    labels: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"],
    datasets: [
      {
        label: "Desempenho",
        data: [20, 60, 15, 95, 40, 25, 90, 65, 55, 60],
        backgroundColor: "rgba(153,102,255,0.7)"
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: value => value + "%" }
      }
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false
  };

  return (
    <div className="res-container">

      <TopBar onBack={() => window.history.back()} />

      <h2 className="res-page-title">Resultado do Quiz</h2>

      <div className="res-top-stats">
        <div className="res-card">
          <p className="res-card-label">Taxa de Acertos Geral</p>
          <p className="res-card-value">{geral.taxaAcertos}</p>
          <p className="res-card-sub">7.3 acertos em média</p>
        </div>

        <div className="res-card">
          <p className="res-card-label">Tempo Médio por Questão</p>
          <p className="res-card-value">{geral.tempoMedio}s</p>
          <p className="res-card-sub">De 30s disponíveis</p>
        </div>

        <div className="res-card">
          <p className="res-card-label">Total de Participantes</p>
          <p className="res-card-value">{geral.participantes}</p>
          <p className="res-card-sub">Jogadores ativos</p>
        </div>
      </div>

      <div className="res-main-grid">

        <div className="res-panel">
          <p className="res-panel-title">Ranking Final</p>

          <table className="res-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Nome</th>
                <th style={{ textAlign: "right" }}>Acertos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map(item => (
                <tr key={item.pos}>
                  <td>{item.pos}</td>
                  <td>{item.nome}</td>
                  <td style={{ textAlign: "right" }}>{item.acertos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QUESTÕES MAIS ERRADAS */}
        <div className="res-panel">
          <p className="res-panel-title" style={{ color: "#c30000" }}>
            Questões Mais Erradas
          </p>

          {questoesMaisErradas.map((q, i) => (
            <div className="res-q-item" key={i}>
              <div className="res-q-row">
                <span>{q.texto}</span>
                <span>{q.perc}%</span>
              </div>
              <div className="res-bar-container">
                <div className="res-bar-fill-wrong" style={{ width: q.perc + "%" }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* QUESTÕES MAIS ACERTADAS */}
        <div className="res-panel">
          <p className="res-panel-title" style={{ color: "#067a2f" }}>
            Questões Mais Acertadas
          </p>

          {questoesMaisAcertadas.map((q, i) => (
            <div className="res-q-item" key={i}>
              <div className="res-q-row">
                <span>{q.texto}</span>
                <span>{q.perc}%</span>
              </div>
              <div className="res-bar-container">
                <div className="res-bar-fill-correct" style={{ width: q.perc + "%" }}></div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="res-chart">
        <div className="res-chart-wrapper">
          <p className="res-chart-title">Desempenho por Questão</p>
          <div style={{ height: 260 }}>
            <Bar data={desempenhoPorQuestao} options={options} />
          </div>
        </div>
      </div>

      <button className="res-back-dashboard">Voltar ao Dashboard</button>

    </div>
  );
}
