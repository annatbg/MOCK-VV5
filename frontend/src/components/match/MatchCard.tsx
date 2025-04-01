import React from "react";
import DemandCard from "../demand/DemandCard";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";
import "./MatchCard.css";

interface MatchData {
  demandId: string;
  title?: string;
  demand?: string;
  category?: string;
  author?: string;
  status: "new" | "confirmedByMe" | "confirmedByThem" | "matched" | "rejectedByMe";
}

interface MatchCardProps {
  matchData: MatchData;
  isStackable?: boolean;
  isOnTop?: boolean;
  onSelect?: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  className?: string;
  initialExpanded?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({
  matchData,
  isStackable = false,
  isOnTop = false,
  onSelect = () => {},
  onConfirm,
  onReject,
  onCancel,
  className = "",
  initialExpanded = false,
}) => {
  const { title, demand, category, author, status, demandId } = matchData;

  const matchClasses = [
    className,
    status === "confirmedByMe" ? "confirmed-by-me-match" : "",
    status === "confirmedByThem" ? "confirmed-by-them-match" : "",
    status === "matched" ? "matched-match" : "",
    status === "rejectedByMe" ? "rejected-match" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DemandCard
      title={title || "Unknown title"}
      demand={demand || "No details available"}
      category={category || "Other"}
      author={author || "Unknown"}
      className={matchClasses}
      isStackable={isStackable}
      isOnTop={isOnTop}
      onSelect={onSelect}
      headerExtras={<StatusBadge status={status} />}
      belowHeader={
        <ActionButtons
          status={status}
          onConfirm={status === "matched" ? undefined : onConfirm}
          onReject={status === "matched" ? undefined : onReject}
          onCancel={status === "matched" ? undefined : onCancel}
        />
      }
      initialExpanded={initialExpanded}
    />
  );
};

export default MatchCard;