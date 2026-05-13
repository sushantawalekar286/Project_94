const statusClasses = {
  Pending: "bg-yellow-400/15 text-yellow-300 border-yellow-300/30",
  Preparing: "bg-blue-400/15 text-blue-300 border-blue-300/30",
  Completed: "bg-green-400/15 text-green-300 border-green-300/30"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[status] || statusClasses.Pending}`}>
      {status}
    </span>
  );
}
