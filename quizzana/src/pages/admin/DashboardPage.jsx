import React, { useState } from 'react';
import SideBar from '../../components/layout/SideBar';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { Users, BookOpen, FolderOpen, Star } from 'lucide-react';
import './DashboardPage.css';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Dados mockados para exemplo
  const activeQuizzes = [
    { id: 1, title: 'Quiz de História 2', participants: 32 },
    { id: 2, title: 'Quiz DW2', participants: 28 },
    { id: 3, title: 'Quiz Gincana 2025', participants: 45 },
  ];

  const recentQuizzes = [
    { id: 1, title: 'Biologia Celular', category: 'Biologia', questions: 10 },
    { id: 2, title: 'Romantismo', category: 'Português', questions: 13 },
    { id: 3, title: 'Kanban', category: 'APS', questions: 15 },
  ];

  return (
    <div>
      <SideBar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <Header 
        isSidebarOpen={isSidebarOpen}
      />

      <div className={`dashboard-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* Header com título e botão */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Dashboard</h1>
            <p>Bem-vindo de volta Usuário! Veja mais informações de seus quiz.</p>
          </div>
          <Button variant="primary" icon="plus" onClick={() => navigate('/admin/create-quiz')}>
            Criar Novo Quiz
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Total de Quizzes</h3>
              <p>12</p>
            </div>
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Questões no Banco</h3>
              <p>126</p>
            </div>
            <div className="stat-icon">
              <FolderOpen size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Quizes ativos</h3>
              <p>4</p>
            </div>
            <div className="stat-icon">
              <Star size={24} />
            </div>
          </div>
        </div>

        {/* Seções de quizzes ativos e recentes */}
        <div className="content-sections">
          {/* Quizzes Ativos */}
          <div className="section-card">
            <h2>Quizzes Ativos</h2>
            <p className="subtitle">Acompanhe todos os quizzes em andamento.</p>
            
            <div>
              {activeQuizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-item">
                  <div className="quiz-info">
                    <div className="quiz-avatar">
                      <Star size={20} />
                    </div>
                    <div className="quiz-details">
                      <h3>{quiz.title}</h3>
                      <p>
                        <Users size={14} />
                        {quiz.participants} participantes
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary">Ver</Button>
                </div>
              ))}
            </div>
          </div>

          {/* Últimos Quizzes Criados */}
          <div className="section-card">
            <h2>Últimos Quizzes Criados</h2>
            <p className="subtitle">Veja o que você criou por último!</p>
            
            <div>
              {recentQuizzes.map((quiz, index) => (
                <div key={quiz.id} className="recent-quiz-item">
                  <div className="quiz-number">{index + 1}</div>
                  <div className="recent-quiz-info">
                    <h3>{quiz.title}</h3>
                    <p>{quiz.category}</p>
                  </div>
                  <div className="quiz-questions">{quiz.questions} Questões</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="actions-section">
          <h2>Ações Rápidas</h2>
          <p className="subtitle">Crie rápido seus quizzes e questões.</p>
          
          <div className="actions-grid">
            <Button variant="primary" icon="plus" onClick={() => navigate('/admin/create-quiz')}>
              Criar Quiz
            </Button>
            <Button variant="primary" icon="plus" onClick={() => navigate('/admin/questions')}>
              Adicionar Questão
            </Button>
            <Button variant="primary" icon="plus" onClick={() => navigate('/admin/biblioteca')}>
              Ver Bando de Questões
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}