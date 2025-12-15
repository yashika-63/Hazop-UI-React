import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Login from './Login/Login';
import NodePage from "./AddNodeScreen/NodePage";
import NodeDetails from './AddNodeScreen/NodeDetails';
import HazopList from './HazopList/HazopList';
import HazopPage from './HazopEntry/HazopPage';
import RequestHandler from './ApprovalRequest/RequestHandler';
import RecommandationHandler from './HazopRecommandation/RecommandationHandler';
import HazopApprovalViewPage from './ApprovalRequest/HazopApprovalViewPage';
import HazopConfirmationViewPage from './ApprovalRequest/HazopConfirmationViewPage';
import UpdateNodeDetails from './AddNodeScreen/UpdateNodeDetails';
import HazopWorkflow from './HazopWorkflow/HazopStatus';
import MOCList from './MOC/MOCList';
import HazopStatusPage from './HazopList/HazopStatusPage';
import HazopView from './HazopList/HazopView';
import CreateNodeDetails from './AddNodeScreen/CreateNodeDetails';
import NodePopup from './AddNodeScreen/NodePopup';
import { ToastContainer } from 'react-toastify';
import './App.css';
import "./styles/global.css";
import RoleBasedHazopPage from './HazopEntry/RoleBasedHazopPage';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('empCode')
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/HazopPage" /> : <Login setToken={handleLogin} />}
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="app-container">
                <Topbar
                  toggleSidebar={toggleSidebar}
                  isOpen={isSidebarOpen}
                  handleLogout={handleLogout}
                />
                <Sidebar isOpen={isSidebarOpen} />

                <div className={`content-area ${isSidebarOpen ? 'shifted' : ''}`}>
                  <Routes>
                    <Route path="/NodePage" element={<NodePage />} />
                    <Route path="/HazopPage" element={<HazopPage />} />
                    <Route path="/HazopList" element={<HazopList />} />
                    <Route path="/RequestHandler" element={<RequestHandler />} />
                    <Route path="/NodeDetails" element={<NodeDetails />} />
                    <Route path="/RecommandationHandler" element={<RecommandationHandler />} />
                    <Route path="/hazop-approval-view" element={<HazopApprovalViewPage />} />
                    <Route path="/hazop-confirmation-view" element={<HazopConfirmationViewPage />} />
                    <Route path="/CreateNodeDetails" element={<CreateNodeDetails />} />
                    <Route path="/UpdateNodeDetails" element={<UpdateNodeDetails />} />
                    <Route path="/complete-hazop-view" element={<HazopView />} />
                    <Route path="/MOCList" element={<MOCList />} />
                    <Route path="/NodePopup/:id" element={<NodePopup />} />
                    <Route path="/HazopWorkflow/:id" element={<HazopWorkflow />} />
                    <Route path="/HazopStatusPage" element={<HazopStatusPage />} />
                    <Route path="/RoleBasedHazopPage" element={<RoleBasedHazopPage />} />
                    <Route path="/NodePopup" element={<NodePopup />} />
                    <Route path="/HazopView" element={<HazopView />} />

                    
                    <Route path="*" element={<Navigate to="/HazopPage" />} />
                  </Routes>
                </div>

                <ToastContainer position="top-right" autoClose={3000} />
              </div>
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
