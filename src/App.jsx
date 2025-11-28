import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './App.css';
import HazopPage from './HazopEntry/HazopPage';
import NodePage from "./AddNodeScreen/NodePage";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <Topbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`content-area ${isSidebarOpen ? 'shifted' : ''}`}>
            <Routes>
              <Route path="/NodePage" element={<NodePage />} />
              <Route path="/HazopPage" element={<HazopPage />} />
            </Routes>
      </div>
    </Router>
  );
};

export default App;
