import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { errMsg } from "../../api/client";
import { createJob, getJob, updateJob } from "../../api/jobs";
import { JOB_TYPES } from "../../utils/constants";

const EMPTY = {
  title: "",
  description: "",
  location: "",
  job_type: "full_time",
  salary_range: "",
  status: "open",
};

export default function JobForm() {
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getJob(id)
      .then((job) =>
        setForm({
          title: job.title,
          description: job.description,
          location: job.location,
          job_type: job.job_type,
          salary_range: job.salary_range ?? "",
          status: job.status,
        })
      )
      .catch((err) => setError(errMsg(err, "Could not load job")))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = { ...form, salary_range: form.salary_range.trim() || null };
    try {
      if (isEdit) await updateJob(id, payload);
      else await createJob(payload);
      navigate("/admin/jobs");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="card mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">{isEdit ? "Edit job" : "Post a new job"}</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Job title</label>
          <input name="title" value={form.title} onChange={onChange} required className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Location</label>
            <input name="location" value={form.location} onChange={onChange} required className="input" />
          </div>
          <div>
            <label className="label">Job type</label>
            <select name="job_type" value={form.job_type} onChange={onChange} className="input">
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Salary range (optional)</label>
            <input name="salary_range" value={form.salary_range} onChange={onChange} placeholder="e.g. 6-9 LPA" className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={onChange} className="input">
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            rows={10}
            value={form.description}
            onChange={onChange}
            required
            placeholder="Responsibilities, requirements, benefits..."
            className="input"
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        <div className="flex gap-2">
          <button disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : isEdit ? "Save changes" : "Publish job"}
          </button>
          <Link to="/admin/jobs" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
