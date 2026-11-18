import { STATUSES } from "../utils/constants";

export default function StatusBadge({ status }) {
  const s = STATUSES.find((x) => x.value === status);
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s?.color ?? "bg-slate-100 text-slate-700"}`}>
      {s?.label ?? status}
    </span>
  );
}
