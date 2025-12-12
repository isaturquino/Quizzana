/* --- COMPONENTE REACT AJUSTADO PARA USAR APENAS A TABELA "resultado" --- */
import React, { useEffect, useState } from "react";
import TopBar from "../../components/layout/TopBar";
import "./ResultsPage.css";
import { Bar } from "react-chartjs-2";
import { supabase } from "../../services/supabase/supabaseClient";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ResultsPage() {
  const salaId = 1;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [geral, setGeral] = useState({});
  const [ranking, setRanking] = useState([]);
  const [qErradas, setQErradas] = useState([]);
  const [qAcertadas, setQAcertadas] = useState([]);
  const [desempenho, setDesempenho] = useState([]);

  const handleError = (label, err) => {
    console.error(`Erro em ${label}:`, err);
    setErrorMsg(prev => prev + ` | ${label}`);
  };

  const loadResults = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      /* ====================== 1) RESULTADOS GERAIS ====================== */
      try {
        const { data, error } = await supabase
          .from("resultado")
          .select("*")
          .eq("id_quiz", salaId);

        if (error) throw error;

        const participantes = data.length;
        const somaAcertos = data.reduce(
          (acc, item) => acc + Number(item.acertos || 0),
          0
        );

        setGeral({
          taxaAcertos: participantes
            ? (somaAcertos / participantes).toFixed(1)
            : 0,
          tempoMedio: 18,
          participantes,
        });
      } catch (err) {
        handleError("resultado (geral)", err);
      }

      /* ====================== 2) RANKING ====================== */
      try {
        const { data, error } = await supabase
          .from("resultado")
          .select("id_jogador, acertos")
          .eq("id_quiz", salaId)
          .order("acertos", { ascending: false });

        if (error) throw error;

        setRanking(
          data.map((item, index) => ({
            pos: index + 1,
            nome: `Jogador ${item.id_jogador}`,
            acertos: `${item.acertos}`
          }))
        );
      } catch (err) {
        handleError("resultado (ranking)", err);
      }

      /* ====================== 3, 4 e 5 NÃO EXISTEM NA TABELA ====================== */
      setQErradas([]);
      setQAcertadas([]);
      setDesempenho([]);

    } catch (err) {
      handleError("loadResults geral", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const desempenhoPorQuestao = {
    labels: desempenho.map(d => `Q${d.questao}`),
    datasets: [
      {
        label: "Desempenho",
        data: desempenho.map(d => d.porcentagem),
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

      {loading && <p>Carregando dados...</p>}
      {!loading && errorMsg && (
        <p style={{ color: "red" }}>
          Problemas ao buscar dados: {errorMsg}. Veja o console.
        </p>
      )}

      <div className="res-top-stats">
        <div className="res-card">
          <p className="res-card-label">Taxa de Acertos Geral</p>
          <p className="res-card-value">{geral.taxaAcertos}</p>
          <p className="res-card-sub">{geral.taxaAcertos} acertos em média</p>
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

      {/* RANKING */}
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

      {/* BLOCOS VAZIOS */}
      <div className="res-panel">
        <p className="res-panel-title" style={{ color: "#c30000" }}>
          Questões Mais Erradas
        </p>
        <p style={{ opacity: 0.5 }}>Nenhum dado disponível</p>
      </div>

      <div className="res-panel">
        <p className="res-panel-title" style={{ color: "#067a2f" }}>
          Questões Mais Acertadas
        </p>
        <p style={{ opacity: 0.5 }}>Nenhum dado disponível</p>
      </div>

      <div className="res-chart">
        <div className="res-chart-wrapper">
          <p className="res-chart-title">Desempenho por Questão</p>
          <p style={{ opacity: 0.5 }}>Nenhum dado disponível</p>
        </div>
      </div>

      <button className="res-back-dashboard">Voltar ao Dashboard</button>

    </div>
  );
}
