import { Link } from "react-router-dom";
import { formatDate } from "../utils/format";
import { jobTypeLabel } from "../utils/constants";

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card block transition hover:border-indigo-300 hover:shadow-md">
      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {job.location} · {jobTypeLabel(job.job_type)}
      </p>
      {job.salary_range && <p className="mt-2 text-sm font-medium text-slate-700">{job.salary_range}</p>}
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>
      <p className="mt-3 text-xs text-slate-400">Posted {formatDate(job.created_at)}</p>
    </Link>
  );
}
