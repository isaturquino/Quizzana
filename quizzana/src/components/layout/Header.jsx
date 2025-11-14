"use client"
import React, { useState } from 'react'
import { Search } from 'lucide-react'
import "./Header.css"

const Header = ({ isSidebarOpen }) => {
  return (
    <header className={`header ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="header-content">
        <div className="header-search">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="search-input"
          />
        </div>
        
        <div className="header-logo">
          <span className="header-logo-text">Quizzana</span>
        </div>
      </div>
    </header>
  )
}

export default Header
