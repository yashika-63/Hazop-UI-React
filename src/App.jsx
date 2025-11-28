import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './App.css';
import EmployeeForm from './Test/EmployeeForm';

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
            <EmployeeForm />
          </div>
        </div>
      </div>

    </Router>
  );
};

export default App;
