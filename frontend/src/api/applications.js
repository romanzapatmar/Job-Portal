import api from "./client";

// Candidate
export const applyToJob = (jobId, coverNote, resumeFile) => {
  const form = new FormData();
  form.append("job_id", jobId);
  form.append("cover_note", coverNote || "");
  form.append("resume", resumeFile);
  return api.post("/api/applications", form).then((r) => r.data);
};

export const myApplications = () => api.get("/api/applications/me").then((r) => r.data);
export const getProfile = () => api.get("/api/candidate/profile").then((r) => r.data);
export const updateProfile = (data) => api.put("/api/candidate/profile", data).then((r) => r.data);

// Admin
export const jobApplicants = (jobId) =>
  api.get(`/api/admin/jobs/${jobId}/applications`).then((r) => r.data);

export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/api/admin/applications/${applicationId}/status`, { status }).then((r) => r.data);

export const downloadResume = async (applicationId, candidateName) => {
  const res = await api.get(`/api/admin/applications/${applicationId}/resume`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${candidateName.replace(/\s+/g, "_")}_resume.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
