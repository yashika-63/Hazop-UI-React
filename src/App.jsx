import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './App.css';
import HazopPage from './HazopEntry/HazopPage';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <Topbar toggleSidebar={toggleSidebar} />

      <Sidebar isOpen={isSidebarOpen} />
      <div className={`content-area ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="page-wrapper">
          <div className="page-card">
            <HazopPage />
          </div>
        </div>
      </div>

    </Router>
  );
};

export default App;
