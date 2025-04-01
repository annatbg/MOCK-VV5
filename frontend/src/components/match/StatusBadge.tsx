import React from "react";
import "./MatchStyles.css";

type StatusBadgeProps = {
  status?: "new" | "confirmedByMe" | "confirmedByThem" | "matched" | "rejectedByMe";
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

  return <span className={`status-badge ${status}-badge`}>{getStatusText()}</span>;
};

export default StatusBadge;
