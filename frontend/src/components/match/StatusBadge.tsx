type Status = "new" | "confirmedByMe" | "confirmedByThem" | "matched" | "rejectedByMe";

type StatusBadgeProps = {
  status?: Status;
};

const statusStyles: Record<Status, string> = {
  new: "bg-blue-500",
  confirmedByMe: "bg-orange-500",
  confirmedByThem: "bg-green-600 animate-pulse",
  matched: "bg-green-700",
  rejectedByMe: "bg-red-700 line-through",
};

const statusText: Record<Status, string> = {
  new: "Ny Match",
  confirmedByMe: "Intresse skickat",
  confirmedByThem: "Intresse bekräftat",
  matched: "Matchat",
  rejectedByMe: "Nekad",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  if (!status) return null;

  return (
    <span
      className={`ml-2 px-2 py-1 rounded text-white text-sm font-semibold shrink-0 ${statusStyles[status]}`}
    >
      {statusText[status]}
    </span>
  );
};

export default StatusBadge;
