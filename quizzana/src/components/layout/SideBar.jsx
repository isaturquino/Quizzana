"use client";
import { useState } from "react";
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

const Sidebar = ({ activeItem = "menu" }) => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: "menu", label: "Menu", icon: LayoutGrid },
    { id: "meus-quizzes", label: "Meus quizzes", icon: BookOpen },
    { id: "banco-questoes", label: "Banco de questões", icon: Database },
    { id: "resultados", label: "Resultados", icon: BarChart3 },
    { id: "criar-quiz", label: "Criar Quiz", icon: Plus, isAction: true },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="header-container">
        {isOpen && (
          <div className="logo">
            <img src={quizzanalogo} alt="Quizzana" />
          </div>
        )}
        <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
          <Menu size={18} /> {/* Diminuído também */}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Search Bar */}
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              className="search-input"
            />
          </div>

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
            <button className="menu-item">
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
