export const COMPANY_NAME = "X Company"; // change to your company name

export const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export const STATUSES = [
  { value: "applied", label: "Applied", color: "bg-slate-100 text-slate-700" },
  { value: "under_review", label: "Under Review", color: "bg-blue-100 text-blue-700" },
  { value: "shortlisted", label: "Shortlisted", color: "bg-indigo-100 text-indigo-700" },
  { value: "interview_scheduled", label: "Interview Scheduled", color: "bg-amber-100 text-amber-700" },
  { value: "offered", label: "Offered", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
];

export const jobTypeLabel = (v) => JOB_TYPES.find((t) => t.value === v)?.label ?? v;
