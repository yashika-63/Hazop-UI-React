import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = !!localStorage.getItem("empCode");
  const role = localStorage.getItem("Role");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is passed as null or not passed at all, allow access
  if (allowedRoles === null || allowedRoles === undefined) {
    return children;
  }

  // Otherwise check strict role inclusion
  if (!allowedRoles.includes(role)) {
    // If role doesn't match, redirect to a safe page (or RequestHandler since everyone has it)
    return <Navigate to="/RequestHandler" replace />;
  }

  return children;
};

export default PrivateRoute;