import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ roles, children }) {
  const { user, token, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
}
