import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errMsg } from "../../api/client";
import { adminListJobs, deleteJob, updateJob } from "../../api/jobs";
import { jobTypeLabel } from "../../utils/constants";
import { formatDate } from "../../utils/format";

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    adminListJobs()
      .then(setJobs)
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (job) => {
    setError("");
    try {
      await updateJob(job.id, {
        title: job.title,
        description: job.description,
        location: job.location,
        job_type: job.job_type,
        salary_range: job.salary_range,
        status: job.status === "open" ? "closed" : "open",
      });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const onDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? All its applications will be deleted too.`)) return;
    setError("");
    try {
      await deleteJob(job.id);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage jobs</h1>
        <Link to="/admin/jobs/new" className="btn btn-primary">
          + Post a job
        </Link>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {jobs.length === 0 ? (
        <p className="text-slate-500">No jobs posted yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applicants</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.location}</p>
                  </td>
                  <td className="px-4 py-3">{jobTypeLabel(job.job_type)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        job.status === "open" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {job.status === "open" ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/jobs/${job.id}/applicants`} className="font-medium text-indigo-600 hover:underline">
                      {job.applications_count ?? 0}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{formatDate(job.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/admin/jobs/${job.id}/applicants`} className="btn btn-outline !px-2 !py-1">
                        Applicants
                      </Link>
                      <Link to={`/admin/jobs/${job.id}/edit`} className="btn btn-outline !px-2 !py-1">
                        Edit
                      </Link>
                      <button onClick={() => toggleStatus(job)} className="btn btn-outline !px-2 !py-1">
                        {job.status === "open" ? "Close" : "Reopen"}
                      </button>
                      <button onClick={() => onDelete(job)} className="btn btn-danger !px-2 !py-1">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
