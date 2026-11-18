import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COMPANY_NAME } from "../utils/constants";

export default function Navbar() {
  const { candidate, admin, logoutCandidate, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith("/admin");

  const linkClass = ({ isActive }) =>
    `text-sm font-medium ${isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"}`;

  // ---------- Admin area ----------
  if (inAdmin) {
    const onAdminLogout = () => {
      logoutAdmin();
      navigate("/admin/login");
    };

    return (
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to={admin ? "/admin" : "/admin/login"} className="flex items-center gap-2 text-lg font-bold text-indigo-600">
            {COMPANY_NAME} Careers
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">Admin</span>
          </Link>

          <div className="flex items-center gap-5">
            {admin && (
              <>
                <NavLink to="/admin" end className={linkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/jobs" className={linkClass}>
                  Manage Jobs
                </NavLink>
              </>
            )}
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              View site
            </Link>
            {admin && (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-500 sm:inline">{admin.name}</span>
                <button onClick={onAdminLogout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
    );
  }

  // ---------- Public / candidate area ----------
  const onLogout = () => {
    logoutCandidate();
    navigate("/");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-600">
          {COMPANY_NAME} Careers
        </Link>

        <div className="flex items-center gap-5">
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>

          {candidate && (
            <>
              <NavLink to="/my-applications" className={linkClass}>
                My Applications
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
            </>
          )}

          {candidate ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:inline">{candidate.name}</span>
              <button onClick={onLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}