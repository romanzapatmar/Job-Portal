import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { errMsg } from "../../api/client";
import { listJobs } from "../../api/jobs";
import JobCard from "../../components/JobCard";
import { JOB_TYPES } from "../../utils/constants";

export default function JobList() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({
    search: params.get("search") || "",
    location: "",
    job_type: "",
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (f) => {
    setLoading(true);
    setError("");
    const query = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
    listJobs(query)
      .then(setJobs)
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    load(filters);
  };

  const onReset = () => {
    const empty = { search: "", location: "", job_type: "" };
    setFilters(empty);
    load(empty);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Open positions</h1>

      <form onSubmit={onSubmit} className="card mb-6 grid gap-3 sm:grid-cols-4">
        <input name="search" value={filters.search} onChange={onChange} placeholder="Title or skill" className="input" />
        <input name="location" value={filters.location} onChange={onChange} placeholder="Location" className="input" />
        <select name="job_type" value={filters.job_type} onChange={onChange} className="input">
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1">Search</button>
          <button type="button" onClick={onReset} className="btn btn-outline">
            Reset
          </button>
        </div>
      </form>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-slate-500">No jobs match your search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
