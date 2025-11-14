import React, { useState } from 'react';
import SideBar from './../../components/layout/SideBar';
import Header from '../../components/layout/Header';

export default function EditQuiz() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    return (
  <div className="layout">
    <SideBar 
      isOpen={isSidebarOpen}
      setIsOpen={setIsSidebarOpen}
    />
    <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Header isSidebarOpen={isSidebarOpen} />
    </div>
  </div>
);
}
