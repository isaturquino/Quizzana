import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../components/layout/SideBar';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { Users, BookOpen, FolderOpen, Star } from 'lucide-react';
// Importe o Contexto de Autenticação
import { AuthContext } from '../../context/AuthContext'; 
// Importe a nova função de serviço
import { loadUserDashboardData } from '../../services/supabase/quizService'; 
import './DashboardPage.css';

export default function Dashboard() {
    const { user } = useContext(AuthContext); // Obtém o usuário logado
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

    // 🚨 O useEffect agora depende do 'user'
    useEffect(() => {
        if (user?.id) {
            loadDashboardData(user.id);
        } else if (user === null) {
            // Se soubermos que o usuário não está logado
            setLoading(false);
        }
    }, [user]);

    // 🚨 Função que chama o novo serviço filtrado
    const loadDashboardData = async (userId) => {
        try {
            setLoading(true);

            // Chamada única ao serviço que faz todas as buscas filtradas
            const data = await loadUserDashboardData(userId);

            setStats(data.stats);
            setActiveQuizzes(data.activeQuizzes);
            setRecentQuizzes(data.recentQuizzes);

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            // Limpa os dados em caso de erro
            setStats({ totalQuizzes: 0, totalQuestoes: 0, quizzesAtivos: 0 });
            setActiveQuizzes([]);
            setRecentQuizzes([]);
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
                    <p style={{ textAlign: 'center', padding: '3rem' }}>Carregando seus quizzes...</p>
                </div>
            </div>
        );
    }
    
    // Opcional: Mostrar uma mensagem se o usuário não estiver logado e o carregamento terminou
    if (!user && !loading) {
        return (
            <div>
                <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <Header isSidebarOpen={isSidebarOpen} />
                <div className={`dashboard-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
                    <p style={{ textAlign: 'center', padding: '3rem', color: '#dc3545' }}>Acesso negado. Por favor, faça login.</p>
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
                            <h3>Total de Seus Quizzes</h3> {/* 🚨 Título ajustado para ser claro */}
                            <p>{stats.totalQuizzes}</p>
                        </div>
                        <div className="stat-icon">
                            <BookOpen size={24} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>Questões no Banco</h3> {/* Mantido como total geral */}
                            <p>{stats.totalQuestoes}</p>
                        </div>
                        <div className="stat-icon">
                            <FolderOpen size={24} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>Seus Quizzes Ativos</h3> {/* 🚨 Título ajustado para ser claro */}
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
                        <h2>Seus Quizzes Ativos</h2>
                        <p className="subtitle">Acompanhe seus quizzes em andamento.</p>
                        
                        <div>
                            {activeQuizzes.length > 0 ? (
                                activeQuizzes.map((quiz) => (
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
                                        <Button className="btn-primary">Ver</Button>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-message">Nenhum quiz ativo no momento.</p>
                            )}
                        </div>
                    </div>

                    {/* Últimos Quizzes Criados */}
                    <div className="section-card">
                        <h2>Seus Últimos Quizzes</h2>
                        <p className="subtitle">Veja o que você criou por último!</p>
                        
                        <div>
                            {recentQuizzes.length > 0 ? (
                                recentQuizzes.map((quiz, index) => (
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
                                ))
                            ) : (
                                <p className="empty-message">Nenhum quiz criado recentemente.</p>
                            )}
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