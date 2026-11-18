import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// role is "candidate" or "admin"; each one checks only its own session.
export default function ProtectedRoute({ role }) {
  const { candidate, admin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="text-center text-slate-500">Loading...</p>;

  const user = role === "admin" ? admin : candidate;
  if (!user) {
    const loginPath = role === "admin" ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}