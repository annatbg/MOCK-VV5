import React from "react";
import PropTypes from "prop-types";
import "./MatchStyles.css";

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const getStatusText = () => {
    switch(status) {
      case "new": return "New Match";
      case "confirmedByMe": return "Interest Sent";
      case "confirmedByThem": return "Company Interested";
      case "matched": return "Matched";
      case "rejectedByMe": return "Rejected";
      default: return "";
    }
  };

  return (
    <span className={`status-badge ${status}-badge`}>
      {getStatusText()}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['new', 'confirmedByMe', 'confirmedByThem', 'matched', 'rejectedByMe'])
};

export default StatusBadge;
