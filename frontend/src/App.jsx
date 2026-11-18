import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/public/Home";
import JobList from "./pages/public/JobList";
import JobDetail from "./pages/public/JobDetail";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

import Profile from "./pages/candidate/Profile";
import MyApplications from "./pages/candidate/MyApplications";

import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import JobForm from "./pages/admin/JobForm";
import Applicants from "./pages/admin/Applicants";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Candidate */}
          <Route element={<ProtectedRoute role="candidate" />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-applications" element={<MyApplications />} />
          </Route>

          {/* Admin login (public) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin (protected) */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/jobs" element={<ManageJobs />} />
            <Route path="/admin/jobs/new" element={<JobForm />} />
            <Route path="/admin/jobs/:id/edit" element={<JobForm />} />
            <Route path="/admin/jobs/:id/applicants" element={<Applicants />} />
          </Route>

          <Route path="*" element={<p className="text-center text-slate-500">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}