import React, { useState } from 'react';
import SideBar from './../../components/layout/SideBar';
import Header from '../../components/layout/Header';

import './DashboardPage.css';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div>
      <SideBar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
      />

      <Header 
        isSidebarOpen={isSidebarOpen}
      />

      {/* Edit quiz content */}
    </div>
  )
}
