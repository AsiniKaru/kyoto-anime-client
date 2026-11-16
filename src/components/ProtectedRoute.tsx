import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: string[];
}) {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <div className="p-10 text-center text-slate-400">Loading...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && roles.length && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }
  return children;
}
