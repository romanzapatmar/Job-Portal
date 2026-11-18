import api from "./client";

export const registerUser = (data) => api.post("/api/auth/register", data).then((r) => r.data);

export const loginUser = (email, password) => {
  // FastAPI's OAuth2 login expects form data with the email in "username".
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return api.post("/api/auth/login", form).then((r) => r.data);
};

// Takes the token explicitly, so it can check either session.
export const getMe = (token) =>
  api.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data);