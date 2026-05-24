const statusClasses = {
  Pending: "bg-amber-400/15 text-amber-300 border-amber-300/30",
  Accepted: "bg-blue-400/15 text-blue-300 border-blue-300/30",
  Cooking: "bg-orange-400/15 text-orange-300 border-orange-300/30",
  Ready: "bg-indigo-400/15 text-indigo-300 border-indigo-300/30",
  Served: "bg-green-400/15 text-green-300 border-green-300/30",
  Paid: "bg-emerald-400/15 text-emerald-300 border-emerald-300/30",
  Completed: "bg-green-400/15 text-green-300 border-green-300/30",
  Cancelled: "bg-red-400/15 text-red-300 border-red-300/30"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[status] || statusClasses.Pending}`}>
      {status}
    </span>
  );
}
