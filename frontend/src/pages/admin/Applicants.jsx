import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { downloadResume, jobApplicants, updateApplicationStatus } from "../../api/applications";
import { errMsg } from "../../api/client";
import { getJob } from "../../api/jobs";
import StatusBadge from "../../components/StatusBadge";
import { STATUSES } from "../../utils/constants";
import { formatDate } from "../../utils/format";

export default function Applicants() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getJob(id), jobApplicants(id)])
      .then(([j, a]) => {
        setJob(j);
        setApps(a);
      })
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const onStatusChange = async (app, status) => {
    setError("");
    try {
      await updateApplicationStatus(app.id, status);
      setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const onDownload = async (app) => {
    setError("");
    try {
      await downloadResume(app.id, app.candidate_name);
    } catch (err) {
      setError("Could not download resume.");
    }
  };

  const visible = filter ? apps.filter((a) => a.status === filter) : apps;

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <Link to="/admin/jobs" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to jobs
      </Link>
      <div className="mb-4 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Applicants</h1>
          {job && <p className="text-slate-500">{job.title}</p>}
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input !w-auto">
          <option value="">All statuses ({apps.length})</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label} ({apps.filter((a) => a.status === s.value).length})
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {visible.length === 0 ? (
        <p className="text-slate-500">No applications to show.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((app) => (
            <div key={app.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{app.candidate_name}</p>
                  <p className="text-sm text-slate-600">
                    {app.candidate_email}
                    {app.candidate_phone ? ` · ${app.candidate_phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Applied {formatDate(app.applied_at)}
                    {app.experience_years != null ? ` · ${app.experience_years} yrs experience` : ""}
                  </p>
                  {app.skills && <p className="mt-1 text-xs text-slate-500">Skills: {app.skills}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={app.status} />
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app, e.target.value)}
                    className="input !w-auto !py-1"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => onDownload(app)} className="btn btn-outline !py-1">
                    Resume
                  </button>
                  {app.cover_note && (
                    <button
                      onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                      className="btn btn-outline !py-1"
                    >
                      Cover note
                    </button>
                  )}
                </div>
              </div>

              {expanded === app.id && (
                <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {app.cover_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
