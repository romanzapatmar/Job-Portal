import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { applyToJob } from "../../api/applications";
import { errMsg } from "../../api/client";
import { getJob } from "../../api/jobs";
import { useAuth } from "../../context/AuthContext";
import { jobTypeLabel } from "../../utils/constants";
import { formatDate } from "../../utils/format";

const MAX_FILE_MB = 5;

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    getJob(id)
      .then(setJob)
      .catch((err) => setError(errMsg(err, "Job not found")))
      .finally(() => setLoading(false));
  }, [id]);

  const onFileChange = (e) => {
    const f = e.target.files[0];
    setApplyError("");
    if (f && f.type !== "application/pdf") {
      setApplyError("Resume must be a PDF file.");
      setFile(null);
      return;
    }
    if (f && f.size > MAX_FILE_MB * 1024 * 1024) {
      setApplyError(`Resume must be under ${MAX_FILE_MB} MB.`);
      setFile(null);
      return;
    }
    setFile(f || null);
  };

  const onApply = async (e) => {
    e.preventDefault();
    if (!file) {
      setApplyError("Please upload your resume (PDF).");
      return;
    }
    setSubmitting(true);
    setApplyError("");
    try {
      await applyToJob(job.id, coverNote, file);
      navigate("/my-applications");
    } catch (err) {
      setApplyError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <Link to="/jobs" className="text-sm text-indigo-600 hover:underline">
          &larr; All jobs
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{job.title}</h1>
        <p className="mt-1 text-slate-500">
          {job.location} · {jobTypeLabel(job.job_type)}
          {job.salary_range ? ` · ${job.salary_range}` : ""}
        </p>
        <p className="mt-1 text-xs text-slate-400">Posted {formatDate(job.created_at)}</p>
        <h2 className="mb-2 mt-6 font-semibold">About the role</h2>
        <p className="whitespace-pre-line text-slate-700">{job.description}</p>
      </div>

      <div className="card h-fit">
        <h2 className="mb-3 font-semibold">Apply for this job</h2>

        {job.status !== "open" ? (
          <p className="text-sm text-slate-500">This position is closed and no longer accepting applications.</p>
        ) : !user ? (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">Please log in or register to apply.</p>
            <div className="flex gap-2">
              <Link to="/login" state={{ from: `/jobs/${job.id}` }} className="btn btn-primary flex-1">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline flex-1">
                Register
              </Link>
            </div>
          </div>
        ) : user.role === "admin" ? (
          <p className="text-sm text-slate-500">Admins can't apply for jobs.</p>
        ) : (
          <form onSubmit={onApply} className="space-y-4">
            <div>
              <label className="label">Resume (PDF, max {MAX_FILE_MB} MB)</label>
              <input type="file" accept="application/pdf" onChange={onFileChange} className="input" />
            </div>
            <div>
              <label className="label">Cover note (optional)</label>
              <textarea
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="input"
                placeholder="Tell us why you're a great fit"
              />
            </div>
            {applyError && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{applyError}</p>}
            <button disabled={submitting} className="btn btn-primary w-full">
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
