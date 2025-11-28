import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './App.css';
import EmployeeForm from './Test/EmployeeForm';
import HazopPage from "./AddNodeScreen/NodePage";

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
            <Routes>
              <Route path="/employee" element={<EmployeeForm />} />
              <Route path="/hazop" element={<HazopPage />} />
              <Route path="/" element={<EmployeeForm />} /> {/* Default page */}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
