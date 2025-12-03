import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Login from './Login/Login';
import NodePage from "./AddNodeScreen/NodePage";
import NodeDetails from './AddNodeScreen/NodeDetails';
import HazopList from './HazopList/HazopList';
import HazopPage from './HazopEntry/HazopPage';
import RequestHandler from './ApprovalRequest/RequestHandler';
import { ToastContainer } from 'react-toastify';
import './App.css';
import "./styles/global.css";
import RecommandationHandler from './HazopRecommandation/RecommandationHandler';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('empCode')
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Call this after login
  const handleLogin = () => setIsAuthenticated(true);

  // Call this after logout
  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>

        {/* Login Route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/HazopPage" /> : <Login setToken={handleLogin} />}
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <>
                <Topbar toggleSidebar={toggleSidebar} handleLogout={handleLogout} />
                <Sidebar isOpen={isSidebarOpen} />
                <div className={`content-area ${isSidebarOpen ? 'shifted' : ''}`}>
                  <Routes>
                    <Route path="/NodePage" element={<NodePage />} />
                    <Route path="/HazopPage" element={<HazopPage />} />
                    <Route path="/HazopList" element={<HazopList />} />
                    <Route path="/RequestHandler" element={<RequestHandler />} />
                    <Route path="/NodeDetails" element={<NodeDetails />} />
                    <Route path='/RecommandationHandler' element={<RecommandationHandler/>}/>
                    <Route path="*" element={<Navigate to="/HazopPage" />} />
                  </Routes>
                </div>
                <ToastContainer />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      </Router>
  );
};

export default App;
