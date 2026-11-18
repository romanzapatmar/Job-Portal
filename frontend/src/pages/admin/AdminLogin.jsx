import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { errMsg } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginAdmin(form.email, form.password);
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold">Admin login</h1>
      <p className="mb-4 text-sm text-slate-500">For HR and admin staff only.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} required className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" name="password" value={form.password} onChange={onChange} required className="input" />
        </div>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="btn btn-primary w-full">
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Candidate?{" "}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Go to candidate login
        </Link>
      </p>
    </div>
  );
}