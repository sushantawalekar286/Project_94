const statusClasses = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Accepted: "bg-blue-50 text-blue-700 border-blue-200",
  Cooking: "bg-orange-50 text-orange-700 border-orange-200",
  Preparing: "bg-orange-50 text-orange-700 border-orange-200",
  Ready: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Served: "bg-green-50 text-green-700 border-green-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[status] || statusClasses.Pending}`}>
      {status}
    </span>
  );
}
