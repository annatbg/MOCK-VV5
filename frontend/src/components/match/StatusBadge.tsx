import React from "react";

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

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) return null;

  const getStatusText = (): string => {
    switch (status) {
      case "new":
        return "New Match";
      case "confirmedByMe":
        return "Interest Sent";
      case "confirmedByThem":
        return "Company Interested";
      case "matched":
        return "Matched";
      case "rejectedByMe":
        return "Rejected";
      default:
        return "";
    }
  };

  return (
    <span
      className={`ml-2 px-2 py-1 rounded text-white text-sm font-semibold shrink-0 ${statusStyles[status]}`}
    >
      {getStatusText()}
    </span>
  );
};

export default StatusBadge;
