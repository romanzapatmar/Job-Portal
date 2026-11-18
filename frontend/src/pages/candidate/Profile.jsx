import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/applications";
import { errMsg } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { candidate: user } = useAuth();
  const [form, setForm] = useState({ phone: "", skills: "", experience_years: "", education: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    getProfile()
      .then((p) =>
        setForm({
          phone: p.phone ?? "",
          skills: p.skills ?? "",
          experience_years: p.experience_years ?? "",
          education: p.education ?? "",
        })
      )
      .catch((err) => setMessage({ type: "error", text: errMsg(err) }))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await updateProfile({
        phone: form.phone || null,
        skills: form.skills || null,
        experience_years: form.experience_years === "" ? null : Number(form.experience_years),
        education: form.education || null,
      });
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({ type: "error", text: errMsg(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="card mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">My profile</h1>
      <p className="mb-4 text-sm text-slate-500">
        {user.name} · {user.email}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className="input" />
        </div>
        <div>
          <label className="label">Skills (comma separated)</label>
          <input name="skills" value={form.skills} onChange={onChange} placeholder="Python, React, SQL" className="input" />
        </div>
        <div>
          <label className="label">Experience (years)</label>
          <input type="number" min="0" max="60" name="experience_years" value={form.experience_years} onChange={onChange} className="input" />
        </div>
        <div>
          <label className="label">Education</label>
          <textarea name="education" rows={3} value={form.education} onChange={onChange} className="input" />
        </div>

        {message.text && (
          <p className={`rounded-lg p-2 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </p>
        )}
        <button disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}