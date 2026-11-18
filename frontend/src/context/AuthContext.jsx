import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser, registerUser } from "../api/auth";
import { TOKEN_KEYS } from "../api/client";

const AuthContext = createContext(null);

const appError = (message) => Object.assign(new Error(message), { isAppError: true });

export function AuthProvider({ children }) {
  const [candidate, setCandidate] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore each session separately.
  useEffect(() => {
    localStorage.removeItem("token"); // old single-session key from the previous version

    const restore = async (role, setter) => {
      const token = localStorage.getItem(TOKEN_KEYS[role]);
      if (!token) return;
      try {
        const user = await getMe(token);
        if (user.role === role) setter(user);
        else localStorage.removeItem(TOKEN_KEYS[role]);
      } catch {
        localStorage.removeItem(TOKEN_KEYS[role]);
      }
    };

    Promise.all([restore("candidate", setCandidate), restore("admin", setAdmin)]).finally(() =>
      setLoading(false)
    );
  }, []);

  const loginAs = async (role, email, password) => {
    const data = await loginUser(email, password);
    if (data.user.role !== role) {
      throw appError(
        role === "admin"
          ? "This account is not an admin. Please use the candidate login."
          : "This is an admin account. Please use the admin login page."
      );
    }
    localStorage.setItem(TOKEN_KEYS[role], data.access_token);
    (role === "admin" ? setAdmin : setCandidate)(data.user);
    return data.user;
  };

  const loginCandidate = (email, password) => loginAs("candidate", email, password);
  const loginAdmin = (email, password) => loginAs("admin", email, password);

  // Registration is always for candidates.
  const register = async (form) => {
    const data = await registerUser(form);
    localStorage.setItem(TOKEN_KEYS.candidate, data.access_token);
    setCandidate(data.user);
    return data.user;
  };

  const logoutCandidate = () => {
    localStorage.removeItem(TOKEN_KEYS.candidate);
    setCandidate(null);
  };

  const logoutAdmin = () => {
    localStorage.removeItem(TOKEN_KEYS.admin);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        candidate,
        admin,
        loading,
        loginCandidate,
        loginAdmin,
        register,
        logoutCandidate,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);