import DemandCard from "../demand/DemandCard";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

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

const MatchCard = ({
  matchData,
  isStackable = false,
  isOnTop = false,
  onSelect,
  onConfirm,
  onReject,
  onCancel,
  className = "",
  initialExpanded = false,
}: MatchCardProps) => {
  const { title, demand, category, author, status } = matchData;

  const matchClasses = [
    className,
    status === "confirmedByMe" && "border-l-4 border-green-600",
    status === "confirmedByThem" && "border-l-4 border-blue-600",
    status === "matched" && "border-l-4 border-purple-600",
    status === "rejectedByMe" && "border-l-4 border-red-600",
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
      initialExpanded={initialExpanded}
      headerExtras={<StatusBadge status={status} />}
      belowHeader={
        <ActionButtons
          status={status}
          onConfirm={onConfirm}
          onReject={onReject}
          onCancel={onCancel}
        />
      }
    />
  );
};

export default MatchCard;
