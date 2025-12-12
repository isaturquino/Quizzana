import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../components/layout/SideBar';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { Users, BookOpen, FolderOpen, Star } from 'lucide-react';
import { supabase } from '../../services/supabase/supabaseClient';
import './DashboardPage.css';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  
  // Estados para dados do dashboard
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestoes: 0,
    quizzesAtivos: 0
  });
  
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Buscar estatísticas gerais
      const [quizzesResult, questoesResult] = await Promise.all([
        supabase.from('quiz').select('id, ativo', { count: 'exact' }),
        supabase.from('questoes').select('id', { count: 'exact' })
      ]);

      const totalQuizzes = quizzesResult.count || 0;
      const totalQuestoes = questoesResult.count || 0;
      const quizzesAtivos = quizzesResult.data?.filter(q => q.ativo).length || 0;

      // 2. Buscar quizzes ativos
      const { data: activeData } = await supabase
        .from('quiz')
        .select(`
          id,
          titulo,
          configuracoes_quiz (
            maximo_participantes
          )
        `)
        .eq('ativo', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // 3. Buscar últimos quizzes criados
      const { data: recentData } = await supabase
        .from('quiz')
        .select(`
          id,
          titulo,
          configuracoes_quiz (
            numero_questoes
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalQuizzes,
        totalQuestoes,
        quizzesAtivos
      });

      setActiveQuizzes(activeData || []);
      setRecentQuizzes(recentData || []);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <Header isSidebarOpen={isSidebarOpen} />
        <div className={`dashboard-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
          <p style={{ textAlign: 'center', padding: '3rem' }}>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SideBar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeItem="dashboard"
      />

      <Header isSidebarOpen={isSidebarOpen} />

      <div className={`dashboard-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* Header com título e botão */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Dashboard</h1>
            <p>Bem-vindo de volta! Veja as informações dos seus quizzes.</p>
          </div>
          <Button className="btn-primary" onClick={() => navigate('/admin/create-quiz')}>
            + Criar Novo Quiz
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Total de Quizzes</h3>
              <p>{stats.totalQuizzes}</p>
            </div>
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Questões no Banco</h3>
              <p>{stats.totalQuestoes}</p>
            </div>
            <div className="stat-icon">
              <FolderOpen size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Quizzes Ativos</h3>
              <p>{stats.quizzesAtivos}</p>
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
                      <h3>{quiz.titulo}</h3>
                      <p>
                        <Users size={14} />
                        {quiz.configuracoes_quiz?.[0]?.maximo_participantes || 0} participantes
                      </p>
                    </div>
                  </div>
                  <Button className="btn-secondary">Ver</Button>
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
                    <h3>{quiz.titulo}</h3>
                    <p>Quiz Personalizado</p>
                  </div>
                  <div className="quiz-questions">
                    {quiz.configuracoes_quiz?.[0]?.numero_questoes || 0} Questões
                  </div>
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
            <Button className="btn-primary" onClick={() => navigate('/admin/create-quiz')}>
              + Criar Quiz
            </Button>
            <Button className="btn-primary" onClick={() => navigate('/admin/questions')}>
              + Adicionar Questão
            </Button>
            <Button className="btn-primary" onClick={() => navigate('/admin/biblioteca')}>
              📚 Ver Banco de Questões
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}