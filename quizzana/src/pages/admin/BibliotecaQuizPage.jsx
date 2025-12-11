import React, { useState } from 'react';
import SideBar from './../../components/layout/SideBar';
import Header from '../../components/layout/Header';
import { Search, Filter, ChevronLeft, ChevronRight, Clock, FileText, Users, MoreVertical } from 'lucide-react';
import './BibliotecaQuizPage.css';

export default function BibliotecaQuizPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Todas Categorias');

  // Dados de exemplo dos quizzes
  const quizzes = [
    {
      id: 1,
      title: 'Quiz Gincana 2025',
      description: 'Conhecimentos sobre a última gincana',
      status: 'ativo',
      questions: 15,
      duration: 20,
      participants: 45,
      icon: '📚'
    },
    {
      id: 2,
      title: 'Quiz DW2',
      description: 'Conceitos básicos sobre DW2',
      status: 'ativo',
      questions: 12,
      duration: 18,
      participants: 28,
      icon: '📚'
    },
    {
      id: 3,
      title: 'Quiz de História 2',
      description: 'O que mais caiem no Enem',
      status: 'finalizado',
      questions: 18,
      duration: 22,
      participants: 32,
      icon: '📚'
    }
  ];

  const totalPages = 48;

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesTab = activeTab === 'todos' || quiz.status === activeTab;
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderPageNumbers = () => {
    const pages = [];
    
    // Botão Anterior
    if (currentPage > 1) {
      pages.push(
        <button 
          key="prev" 
          className="pagination-btn"
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <ChevronLeft size={16} /> Anterior
        </button>
      );
    }

    // Botão Próximo
    if (currentPage < totalPages) {
      pages.push(
        <button 
          key="next" 
          className="pagination-btn"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Próximo <ChevronRight size={16} />
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="layout">
      <SideBar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header isSidebarOpen={isSidebarOpen} />
        
        <div className="biblioteca-quiz-container">
          {/* Seção de cabeçalho */}
          <div className="page-header">
            <div className="header-content2">
              <h1 className="page-title">Meus Quizzes</h1>
              <p className="page-subtitle">Crie, gerencie e analise seus quizzes</p>
            </div>
            <button className="btn-criar-quiz">
              + Criar Novo Quiz
            </button>
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
            <div className="filters-section">
              <div className="tabs-container">
                <button 
                  className={`tab ${activeTab === 'todos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('todos')}
                >
                  Todos quizzes
                </button>
                <button 
                  className={`tab ${activeTab === 'ativo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ativo')}
                >
                  Ativos
                </button>
                <button 
                  className={`tab ${activeTab === 'finalizado' ? 'active' : ''}`}
                  onClick={() => setActiveTab('finalizado')}
                >
                  Finalizados
                </button>
              </div>

              <div className="search-filter-container">
                <div className="search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar Quizzes"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="category-dropdown">
                  <Filter size={18} />
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option>Todas Categorias</option>
                    <option>Educação</option>
                    <option>Entretenimento</option>
                    <option>Corporativo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Paginação superior */}
            <div className="pagination-container top">
              {renderPageNumbers()}
            </div>

            {/* Lista de Quizzes */}
            <div className="quizzes-list">
              {filteredQuizzes.map(quiz => (
                <div key={quiz.id} className="quiz-card">
                  <div className="quiz-icon">
                    📚
                  </div>
                  
                  <div className="quiz-content">
                    <div className="quiz-header-card">
                      <h3 className="quiz-title">{quiz.title}</h3>
                      <span className={`status-badge ${quiz.status}`}>
                        {quiz.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                      </span>
                    </div>
                    
                    <p className="quiz-description">{quiz.description}</p>
                    
                    <div className="quiz-meta">
                      <span className="meta-item">
                        <FileText size={14} />
                        {quiz.questions} questões
                      </span>
                      <span className="meta-item">
                        <Clock size={14} />
                        {quiz.duration} min
                      </span>
                      <span className="meta-item">
                        <Users size={14} />
                        {quiz.participants} participantes
                      </span>
                    </div>
                  </div>

                  <div className="quiz-actions">
                    <button className="btn-view">View</button>
                    <button className="btn-more">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação inferior */}
            <div className="pagination-container bottom">
              {renderPageNumbers()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
