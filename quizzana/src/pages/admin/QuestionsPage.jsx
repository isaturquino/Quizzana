"use client";

import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import SideBar from "../../components/layout/SideBar";
import Header from "../../components/layout/Header";
import QuestionForm from "../../components/forms/QuestionForm.jsx";
import Button from "../../components/ui/Button";
import "./QuestionsPage.css";

import { useQuestions } from "../../hooks/useQuestions.js";
import { useCategories } from "../../hooks/useCategories.js";
import {
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/supabase/questionsService.js";

export default function QuestionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { questions, loading, totalPages,refetch } = useQuestions(currentPage, 5);

  const {
    categories,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      refetch();
    } catch (error) {
      console.error("Erro ao deletar questão:", error);
    }
  };

  const handleSaveQuestion = async (questionData) => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, questionData);
      } else {
        await addQuestion(questionData);
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Erro ao salvar questão:", error);
    }
  };

  const CustomSelect = ({ value, onValueChange, children, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="select-container">
        <button className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
          {value === "all"
            ? placeholder
            : children.find((child) => child.props.value === value)?.props
                .children}
          <span className="select-arrow">▼</span>
        </button>

        {isOpen && (
          <div className="select-content">
            {React.Children.map(children, (child) =>
              React.cloneElement(child, {
                onSelect: (val) => {
                  onValueChange(val);
                  setIsOpen(false);
                },
              })
            )}
          </div>
        )}
      </div>
    );
  };

  const SelectItem = ({ value, children, onSelect }) => (
    <div className="select-item" onClick={() => onSelect(value)}>
      {children}
    </div>
  );

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || q.categoria_id === Number(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="layout">
      <SideBar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeItem="questions"
      />

      <div
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Header isSidebarOpen={isSidebarOpen} />

        <div className="questions-content">
          <div className="page-container">
            <div className="content-wrapper">
              <div className="page-header">
                <h1 className="page-title">Banco de Questões</h1>
                <p className="page-description">
                  Organize, crie e gerencie suas questões de forma prática
                </p>
              </div>

              <div className="controls-row">
                <Button onClick={handleAddQuestion} className="btn-primary">
                  <Plus className="w-5 h-5" />
                  Adicionar Questão
                </Button>

              </div>

              <div className="filter-section">
                <label className="filter-label">Categorias</label>

                <CustomSelect
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  placeholder="Todas"
                >
                  <SelectItem value="all">Todas</SelectItem>

                  {!categoriesLoading &&
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                </CustomSelect>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                  <p className="p-4">Carregando questões...</p>
                ) : (
                  <table className="questions-table">
                    <thead>
                      <tr>
                        <th>Questão</th>
                        <th>Categoria</th>
                        <th>Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredQuestions.map((q) => (
                        <tr key={q.id}>
                          <td>{q.question}</td>
                          <td>{q.category}</td>

                          <td>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditQuestion(q)}
                                className="btn-primary"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="btn-primary"
                              >
                                Excluir
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  className="btn-outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </button>

                <span className="pagination-number">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  className="btn-outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </div>

        <QuestionForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveQuestion}
          editingQuestion={editingQuestion}
          categories={categories}
          refetchCategories={refetchCategories}
        />
      </div>
    </div>
  );
}
