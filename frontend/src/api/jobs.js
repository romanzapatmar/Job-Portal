import api from "./client";

// Public
export const listJobs = (params) => api.get("/api/jobs", { params }).then((r) => r.data);
export const getJob = (id) => api.get(`/api/jobs/${id}`).then((r) => r.data);

// Admin
export const adminStats = () => api.get("/api/admin/stats").then((r) => r.data);
export const adminListJobs = () => api.get("/api/admin/jobs").then((r) => r.data);
export const createJob = (data) => api.post("/api/admin/jobs", data).then((r) => r.data);
export const updateJob = (id, data) => api.put(`/api/admin/jobs/${id}`, data).then((r) => r.data);
export const deleteJob = (id) => api.delete(`/api/admin/jobs/${id}`);
