import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myApplications } from "../../api/applications";
import { errMsg } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/format";

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    myApplications()
      .then(setApps)
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">My applications</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {apps.length === 0 ? (
        <p className="text-slate-500">
          You haven't applied to any jobs yet.{" "}
          <Link to="/jobs" className="font-medium text-indigo-600 hover:underline">
            Browse jobs
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link to={`/jobs/${app.job_id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                    {app.job_title}
                  </Link>
                  <p className="text-xs text-slate-500">Applied on {formatDate(app.applied_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <button
                    onClick={() => setOpenId(openId === app.id ? null : app.id)}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    {openId === app.id ? "Hide timeline" : "View timeline"}
                  </button>
                </div>
              </div>

              {openId === app.id && (
                <ol className="mt-4 space-y-2 border-l-2 border-indigo-200 pl-4">
                  {(app.history || []).map((h, i) => (
                    <li key={i} className="text-sm">
                      <StatusBadge status={h.status} />
                      <span className="ml-2 text-xs text-slate-500">{formatDateTime(h.changed_at)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
