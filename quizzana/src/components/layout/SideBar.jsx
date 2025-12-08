"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./SideBar.css";
import quizzanalogo from "../../assets/imgs/quizzanalogo.png";
import {
  Search,
  LayoutGrid,
  BookOpen,
  Database,
  BarChart3,
  Plus,
  Settings,
  Menu,
} from "lucide-react";

const Sidebar = ({ activeItem = "menu", isOpen, setIsOpen }) => {
  const navigate = useNavigate(); // Hook

  const menuItems = [
    { id: "menu", label: "Menu", icon: LayoutGrid, path: "/admin" },
    { id: "meus-quizzes", label: "Meus quizzes", icon: BookOpen, path: "/admin/biblioteca" },
    { id: "banco-questoes", label: "Banco de questões", icon: Database, path: "/admin/questions" },
    { id: "resultados", label: "Resultados", icon: BarChart3, path: "/results/:salaId" },
    { id: "criar-quiz", label: "Criar Quiz", icon: Plus, isAction: true, path: "/admin/create-quiz" },
  ];

  const handleNavigation = (path, itemId) => {
    navigate(path);
   
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="header-container">
        {isOpen && (
          <div className="logo">
            <img src={quizzanalogo} alt="Quizzana" />
          </div>
        )}
        <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
          <Menu size={18} />
        </button>
      </div>

      {isOpen && (
        <>
          {/* Menu Items */}
          <nav className="menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  className={`menu-item ${isActive ? "active" : ""} ${
                    item.isAction ? "action" : ""
                  }`}
                  onClick={() => handleNavigation(item.path, item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Perfil Section */}
          <div className="perfil-section">
            <span className="perfil-label">Perfil</span>
            <button 
              className="menu-item"
              onClick={() => navigate("/admin/settings")}
            >
              <Settings size={18} />
              <span>Configurações</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;