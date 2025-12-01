import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './App.css';
import "./styles/global.css";
import HazopPage from './HazopEntry/HazopPage';
import NodePage from "./AddNodeScreen/NodePage";
import { ToastContainer } from 'react-toastify';
import NodeDetails from './AddNodeScreen/NodeDetails';

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
              <Route path='/node/:id' element={<NodeDetails />} />
            </Routes>
            <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
