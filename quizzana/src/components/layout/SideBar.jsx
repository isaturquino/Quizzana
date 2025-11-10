"use client"
import { useState } from "react"
import "./SideBar.css"
import { Search, LayoutGrid, FileQuestion, Database, BarChart3, Plus, Settings, Menu } from "lucide-react"

const Sidebar = ({ activeItem = "menu" }) => {
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    { id: "menu", label: "Menu", icon: LayoutGrid },
    { id: "meus-quizzes", label: "Meus quizzes", icon: FileQuestion },
    { id: "banco-questoes", label: "Banco de questões", icon: Database },
    { id: "resultados", label: "Resultados", icon: BarChart3 },
    { id: "criar-quiz", label: "Criar Quiz", icon: Plus, isAction: true },
  ]

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={20} />
      </button>

      {isOpen && (
        <>
          {/* Logo */}
          <div className="logo">
            <span className="logo-icon">Q</span>
            <span className="logo-text">Quizzana</span>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input type="text" placeholder="Buscar..." className="search-input" />
          </div>

          {/* Menu Items */}
          <nav className="menu">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id

              return (
                <button
                  key={item.id}
                  className={`menu-item ${isActive ? "active" : ""} ${item.isAction ? "action" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
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
  )
}

export default Sidebar
