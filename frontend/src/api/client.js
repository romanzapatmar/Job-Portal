import axios from "axios";

export const TOKEN_KEYS = { candidate: "candidate_token", admin: "admin_token" };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Admin API calls use the admin token; everything else uses the candidate token.
const roleForUrl = (url = "") => (url.startsWith("/api/admin") ? "admin" : "candidate");

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem(TOKEN_KEYS[roleForUrl(config.url)]);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a logged-in session expires, clear only that session and send it to its own login page.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthCall = url.startsWith("/api/auth/"); // login/register/me handle their own errors
    if (err.response?.status === 401 && !isAuthCall) {
      const role = roleForUrl(url);
      if (localStorage.getItem(TOKEN_KEYS[role])) {
        localStorage.removeItem(TOKEN_KEYS[role]);
        window.location.href = role === "admin" ? "/admin/login" : "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err, fallback = "Something went wrong. Please try again.") => {
  if (err.isAppError) return err.message;
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  return fallback;
};

export default api;