import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listJobs } from "../../api/jobs";
import JobCard from "../../components/JobCard";
import { COMPANY_NAME } from "../../utils/constants";

export default function Home() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    listJobs({ limit: 6 })
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      <section className="rounded-2xl bg-indigo-600 px-6 py-14 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Build your career at {COMPANY_NAME}</h1>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">
          Browse open positions, apply in minutes, and track your application status in one place.
        </p>
        <form onSubmit={onSearch} className="mx-auto mt-6 flex max-w-lg gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or skill"
            className="input text-slate-800"
          />
          <button className="btn bg-white text-indigo-700 hover:bg-indigo-50">Search</button>
        </form>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest openings</h2>
          <Link to="/jobs" className="text-sm font-medium text-indigo-600 hover:underline">
            View all jobs
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-slate-500">No open positions right now. Please check back soon.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
