import React from "react";
import PropTypes from "prop-types";
import DemandCard from "../demand/DemandCard";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";
import "./MatchCard.css";

const MatchCard = ({
  matchData,
  isStackable = false,
  isOnTop = false,
  onSelect = () => {},
  onConfirm,
  onReject,
  onCancel,
  className = ""
}) => {
  // Extract all relevant demand data
  const { title, demand, category, author, status, demandId } = matchData;

  // Classes specific to match status
  const matchClasses = [
    className,
    status === "confirmedByMe" ? "confirmed-by-me-match" : "",
    status === "confirmedByThem" ? "confirmed-by-them-match" : "",
    status === "matched" ? "matched-match" : "",
    status === "rejectedByMe" ? "rejected-match" : ""
  ].filter(Boolean).join(" ");

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
    />
  );
};

MatchCard.propTypes = {
  matchData: PropTypes.shape({
    demandId: PropTypes.string.isRequired,
    title: PropTypes.string,
    demand: PropTypes.string,
    category: PropTypes.string,
    author: PropTypes.string,
    status: PropTypes.oneOf(['new', 'confirmedByMe', 'confirmedByThem', 'matched', 'rejectedByMe']).isRequired
  }).isRequired,
  isStackable: PropTypes.bool,
  isOnTop: PropTypes.bool,
  onSelect: PropTypes.func,
  onConfirm: PropTypes.func,
  onReject: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string
};

export default MatchCard;
