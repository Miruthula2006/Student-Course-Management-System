import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

const ProtectedRoute = ({ role, roles, children }) => {
  const { user, isReady } = useAuth();
  const token = sessionStorage.getItem("token");

  if (!isReady) return <p role="status">Checking access...</p>;

  if (!user || !token) {
    return <Navigate to={role === "admin" ? "/admin-login" : "/student-login"} replace />;
  }

  const allowedRoles = roles || (role ? [role] : null);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/student-dashboard"} replace />;
  }

  return children;
};

export default ProtectedRoute;