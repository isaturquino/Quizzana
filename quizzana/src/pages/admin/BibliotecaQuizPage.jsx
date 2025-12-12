import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './../../components/layout/SideBar';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { Search, Filter, ChevronLeft, ChevronRight, Clock, FileText, Users, MoreVertical } from 'lucide-react';
import { useQuizzes } from '../../hooks/useQuiz';
import { deleteQuiz, toggleQuizStatus } from '../../services/supabase/quizService';
import './BibliotecaQuizPage.css';

export default function BibliotecaQuizPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Todas Categorias');

  // Buscar quizzes do Supabase
  const { quizzes, loading, totalPages, total, refetch } = useQuizzes(currentPage, 10);

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Tem certeza que deseja deletar este quiz?')) {
      const result = await deleteQuiz(quizId);
      if (result.success) {
        alert('Quiz deletado com sucesso!');
        refetch();
      } else {
        alert('Erro ao deletar quiz!');
      }
    }
  };

  const handleToggleStatus = async (quizId, currentStatus) => {
    try {
      await toggleQuizStatus(quizId, !currentStatus);
      alert(`Quiz ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      refetch();
    } catch (error) {
      alert('Erro ao alterar status do quiz!');
    }
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/admin/create-quiz/${quizId}`);
  };

  const handleCreateQuiz = () => {
    navigate('/admin/create-quiz');
  };

  // Filtrar quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesTab = activeTab === 'todos' || 
                       (activeTab === 'ativo' && quiz.ativo) ||
                       (activeTab === 'finalizado' && !quiz.ativo);
    
    const matchesSearch = quiz.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quiz.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const renderPageNumbers = () => {
    const pages = [];
    
    if (currentPage > 1) {
      pages.push(
        <button 
          key="prev" 
          className="biblioteca-pagination-btn"
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <ChevronLeft size={16} /> Anterior
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button 
          key="next" 
          className="biblioteca-pagination-btn"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Próximo <ChevronRight size={16} />
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="layout">
        <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Header isSidebarOpen={isSidebarOpen} />
          <div className="biblioteca-container" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Carregando quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <SideBar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header isSidebarOpen={isSidebarOpen} />
        
        <div className="biblioteca-container">
          {/* Seção de cabeçalho */}
          <div className="biblioteca-page-header">
            <div className="biblioteca-header-content">
              <h1 className="biblioteca-page-title">Meus Quizzes</h1>
              <p className="biblioteca-page-subtitle">
                Crie, gerencie e analise seus quizzes ({total} quizzes)
              </p>
            </div>
            <Button className="btn-primary" onClick={handleCreateQuiz}>
              + Criar Novo Quiz
            </Button>
          </div>

          {/* Biblioteca de Quizzes */}
          <div className="biblioteca-section">
            <div className="biblioteca-header">
              <div>
                <h2 className="biblioteca-title">Biblioteca de Quizzes</h2>
                <p className="biblioteca-subtitle">Navegue e gerencie todos os seus quizzes</p>
              </div>
            </div>

            {/* Filtros e Tabs */}
            <div className="biblioteca-filters-section">
              <div className="biblioteca-tabs-container">
                <button 
                  className={`biblioteca-tab ${activeTab === 'todos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('todos')}
                >
                  Todos quizzes
                </button>
                <button 
                  className={`biblioteca-tab ${activeTab === 'ativo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ativo')}
                >
                  Ativos
                </button>
                <button 
                  className={`biblioteca-tab ${activeTab === 'finalizado' ? 'active' : ''}`}
                  onClick={() => setActiveTab('finalizado')}
                >
                  Finalizados
                </button>
              </div>

              <div className="biblioteca-search-filter-container">
                <div className="biblioteca-search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar Quizzes"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Paginação superior */}
            <div className="biblioteca-pagination-container top">
              {renderPageNumbers()}
            </div>

            {/* Lista de Quizzes */}
            <div className="biblioteca-quizzes-list">
              {filteredQuizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                  <p>Nenhum quiz encontrado.</p>
                  <Button onClick={handleCreateQuiz} className="btn-primary" style={{ marginTop: '1rem' }}>
                    Criar Primeiro Quiz
                  </Button>
                </div>
              ) : (
                filteredQuizzes.map(quiz => (
                  <div key={quiz.id} className="biblioteca-quiz-card">
                    <div className="biblioteca-quiz-icon">
                      📚
                    </div>
                    
                    <div className="biblioteca-quiz-content">
                      <div className="biblioteca-quiz-header-card">
                        <h3 className="biblioteca-quiz-title">{quiz.titulo}</h3>
                        <span className={`biblioteca-status-badge ${quiz.ativo ? 'ativo' : 'finalizado'}`}>
                          {quiz.ativo ? 'Ativo' : 'Finalizado'}
                        </span>
                      </div>
                      
                      <p className="biblioteca-quiz-description">
                        {quiz.descricao || 'Sem descrição'}
                      </p>
                      
                      <div className="biblioteca-quiz-meta">
                        <span className="biblioteca-meta-item">
                          <FileText size={14} />
                          {quiz.configuracoes_quiz?.[0]?.numero_questoes || 0} questões
                        </span>
                        <span className="biblioteca-meta-item">
                          <Clock size={14} />
                          {quiz.configuracoes_quiz?.[0]?.tempo_limite || 0} min
                        </span>
                        <span className="biblioteca-meta-item">
                          <Users size={14} />
                          {quiz.configuracoes_quiz?.[0]?.maximo_participantes || 0} participantes
                        </span>
                      </div>
                    </div>

                    <div className="biblioteca-quiz-actions">
                      <button 
                        className="biblioteca-btn-view"
                        onClick={() => handleEditQuiz(quiz.id)}
                      >
                        Editar
                      </button>
                      
                      <div className="biblioteca-dropdown">
                        <button className="biblioteca-btn-more">
                          <MoreVertical size={18} />
                        </button>
                        
                        <div className="biblioteca-dropdown-content">
                          <button onClick={() => handleToggleStatus(quiz.id, quiz.ativo)}>
                            {quiz.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          <button 
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            style={{ color: '#ef4444' }}
                          >
                            Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Paginação inferior */}
            <div className="biblioteca-pagination-container bottom">
              {renderPageNumbers()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}