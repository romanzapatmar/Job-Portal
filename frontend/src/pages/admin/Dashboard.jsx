import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errMsg } from "../../api/client";
import { adminStats } from "../../api/jobs";

const CARDS = [
  { key: "open_jobs", label: "Open jobs" },
  { key: "total_applications", label: "Total applications" },
  { key: "new_applications", label: "New (Applied)" },
  { key: "shortlisted", label: "Shortlisted" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminStats()
      .then(setStats)
      .catch((err) => setError(errMsg(err)));
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/jobs/new" className="btn btn-primary">
            + Post a job
          </Link>
          <Link to="/admin/jobs" className="btn btn-outline">
            Manage jobs
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.key} className="card">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{stats ? stats[c.key] : "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
