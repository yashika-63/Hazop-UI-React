import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Login from './Login/Login';
import { ToastContainer } from 'react-toastify';
import './App.css';
import "./styles/global.css";

/* Context Import */

/* Pages */
import NodePage from "./AddNodeScreen/NodePage";
import NodeDetails from './AddNodeScreen/NodeDetails';
import HazopList from './HazopList/HazopList';
import HazopPage from './HazopEntry/HazopPage';
import RequestHandler from './ApprovalRequest/RequestHandler';
import RecommandationHandler from './HazopRecommandation/RecommandationHandler';
import HazopApprovalViewPage from './ApprovalRequest/HazopApprovalViewPage';
import HazopConfirmationViewPage from './ApprovalRequest/HazopConfirmationViewPage';
import HazopWorkflow from './HazopWorkflow/HazopStatus';
import MOCList from './MOC/MOCList';
import HazopStatusPage from './HazopList/HazopStatusPage';
import HazopView from './HazopList/HazopView';
import CreateNodeDetails from './AddNodeScreen/CreateNodeDetails';
import NodePopup from './AddNodeScreen/NodePopup';
import RoleBasedHazopPage from './HazopEntry/RoleBasedHazopPage';
import NodeRetrieve from './AddNodeScreen/NodeRetrieve';
import ViewNodeDiscussion from './AddNodeScreen/ViewNodeDiscussion';
import Dashboard from './Dashboard/Dashboard';
import UpdateNode from './AddNodeScreen/UpdateNode';

/* Role Imports */
import { PERMISSIONS } from "./RBAC/Permissions";
import PrivateRoute from "./RBAC/PrivateRoute"; 
import { ROLES } from './RBAC/roles';
import { useTheme } from './Context/ThemeContext';
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 1. Get current theme from Context (to style the main container)
  const { theme } = useTheme(); 
console.log("📱 App Component Rendered with Theme:", theme);

  const isAuthenticated = !!localStorage.getItem('empCode');
  const userRole = localStorage.getItem("Role");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogin = () => window.location.reload();
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const getDefaultRoute = () => {
    if (userRole === ROLES.LEAD) return "/RoleBasedHazopPage";
    if (userRole === ROLES.MEMBER) return "/HazopStatusPage";
    return "/HazopPage";
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login setToken={handleLogin} />}
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              // 2. Apply the theme class to the main wrapper
              <div className={`app-container ${theme}`}>
                <Topbar 
                   toggleSidebar={toggleSidebar} 
                   isOpen={isSidebarOpen} 
                   handleLogout={handleLogout}
                />
                <Sidebar isOpen={isSidebarOpen} />

                <div className={`content-area ${isSidebarOpen ? 'shifted' : ''}`}>
                  <Routes>
                    
                    {/* --- 1. HAZOP CREATOR ONLY --- */}
                    <Route path="/HazopPage" element={<PrivateRoute allowedRoles={PERMISSIONS.HazopPage}><HazopPage /></PrivateRoute>} />
                    <Route path="/HazopList" element={<PrivateRoute allowedRoles={PERMISSIONS.HazopList}><HazopList/></PrivateRoute>} />
                    <Route path="/MOCList" element={<PrivateRoute allowedRoles={PERMISSIONS.MOCList}><MOCList /></PrivateRoute>} />
                    
                    {/* Node Management (Creator Only) */}
                    <Route path="/NodePage" element={<PrivateRoute allowedRoles={PERMISSIONS.NodePages}><NodePage /></PrivateRoute>} />
                    <Route path="/CreateNodeDetails" element={<PrivateRoute allowedRoles={PERMISSIONS.NodePages}><CreateNodeDetails /></PrivateRoute>} />
                    <Route path="/NodeDetails" element={<PrivateRoute allowedRoles={PERMISSIONS.NodePages}><NodeDetails /></PrivateRoute>} />
                    <Route path="/NodeRetrieve" element={<PrivateRoute allowedRoles={PERMISSIONS.NodePages}><NodeRetrieve /></PrivateRoute>} />
                    <Route path="/UpdateNode" element={<PrivateRoute allowedRoles={PERMISSIONS.NodePages}><UpdateNode /></PrivateRoute>} />
                    <Route path="/NodePopup/:id" element={<PrivateRoute allowedRoles={PERMISSIONS.NodePages}><NodePopup /></PrivateRoute>} />
                    <Route path="/NodePopup" element={<PrivateRoute allowedRoles={PERMISSIONS.NodePages}><NodePopup /></PrivateRoute>} />

                    {/* --- 2. CREATOR & TEAM LEAD --- */}
                    <Route path="/RoleBasedHazopPage" element={<PrivateRoute allowedRoles={PERMISSIONS.RoleBasedHazopPage}><RoleBasedHazopPage /></PrivateRoute>} />

                    {/* --- 3. ALL ROLES (Creator, Lead, Member) --- */}
                    <Route path="/RequestHandler" element={<PrivateRoute allowedRoles={PERMISSIONS.ApprovalRequest} allowWithoutRole={true} ><RequestHandler /></PrivateRoute>} />
                    <Route path="/HazopStatusPage" element={<PrivateRoute allowedRoles={PERMISSIONS.HazopStatusPage}><HazopStatusPage /></PrivateRoute>} />
                    
                    {/* Shared Logic / Views */}
                    <Route path="/Dashboard" element={<PrivateRoute allowedRoles={PERMISSIONS.Dashboard}><Dashboard /></PrivateRoute>} />
                    <Route path="/RecommandationHandler" element={<PrivateRoute allowedRoles={PERMISSIONS.ApprovalRequest}><RecommandationHandler /></PrivateRoute>} />
                    <Route path="/hazop-approval-view" element={<PrivateRoute allowedRoles={PERMISSIONS.ApprovalRequest}><HazopApprovalViewPage /></PrivateRoute>} />
                    <Route path="/hazop-confirmation-view" element={<PrivateRoute allowedRoles={PERMISSIONS.ApprovalRequest}><HazopConfirmationViewPage /></PrivateRoute>} />
                    <Route path="/HazopWorkflow/:id" element={<PrivateRoute allowedRoles={PERMISSIONS.ApprovalRequest}><HazopWorkflow /></PrivateRoute>} />
                    <Route path="/complete-hazop-view" element={<PrivateRoute allowedRoles={PERMISSIONS.ApprovalRequest}><HazopView /></PrivateRoute>} />
                    <Route path="/HazopView" element={<PrivateRoute allowedRoles={PERMISSIONS.ApprovalRequest}><HazopView /></PrivateRoute>} />
                    <Route path="/ViewNodeDiscussion" element={<PrivateRoute allowedRoles={PERMISSIONS.ApprovalRequest}><ViewNodeDiscussion/></PrivateRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
                  </Routes>
                </div>
                {/* 3. Pass theme to ToastContainer */}
                <ToastContainer position="top-right" autoClose={3000} theme={theme} /> 
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