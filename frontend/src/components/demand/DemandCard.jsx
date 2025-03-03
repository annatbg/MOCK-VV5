import React from "react";
import PropTypes from "prop-types";
import "./DemandCard.css";

const DemandCard = ({ 
  title, 
  demand, 
  category, 
  author, 
  className, 
  isStackable = false,
  isOnTop = false,
  onSelect = () => {},
  matchActions // New prop for match actions
}) => {
  const handleClick = () => {
    if (isStackable) {
      onSelect();
    }
  };

  const cardClasses = [
    "demand-card",
    className || "",
    isStackable ? "stackable-card" : "",
    isOnTop ? "card-on-top" : "",
    // Add classes based on match status
    matchActions?.status === "confirmedByMe" ? "confirmed-by-me-card" : "",
    matchActions?.status === "confirmedByThem" ? "confirmed-by-them-card" : "",
    matchActions?.status === "matched" ? "matched-card" : "",
    matchActions?.status === "rejectedByMe" ? "rejected-card" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="demand-card-header">
        <h3>{title}</h3>
        
        {/* Match action buttons */}
        {matchActions && (
          <div className="match-actions">
            {/* Confirm/Reject buttons for new matches or confirmedByThem */}
            {(matchActions.status === "new" || matchActions.status === "confirmedByThem") && (
              <>
                <button 
                  className="match-action-button confirm-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    matchActions.onConfirm();
                  }}
                  title="Accept this match"
                >
                  Accept
                </button>
                <button 
                  className="match-action-button reject-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    matchActions.onReject();
                  }}
                  title="Reject this match"
                >
                  Reject
                </button>
              </>
            )}
            
            {/* Cancel button for confirmedByMe */}
            {matchActions.status === "confirmedByMe" && (
              <button
                className="match-action-button cancel-button"
                onClick={(e) => {
                  e.stopPropagation();
                  matchActions.onCancel();
                }}
                title="Cancel your confirmation"
              >
                Cancel Interest
              </button>
            )}
            
            {/* Cancel button for rejected matches */}
            {matchActions.status === "rejectedByMe" && (
              <button
                className="match-action-button undo-button"
                onClick={(e) => {
                  e.stopPropagation();
                  matchActions.onCancel();
                }}
                title="Undo rejection"
              >
                Reconsider
              </button>
            )}
            
            {/* Status indicator badge */}
            {matchActions.status && (
              <span className={`status-badge ${matchActions.status}-badge`}>
                {matchActions.status === "new" ? "New Match" : 
                 matchActions.status === "confirmedByMe" ? "Interest Sent" :
                 matchActions.status === "confirmedByThem" ? "Company Interested" :
                 matchActions.status === "matched" ? "Matched" :
                 matchActions.status === "rejectedByMe" ? "Rejected" : ""}
              </span>
            )}
          </div>
        )}
        
        <span className="category">{category}</span>
      </div>
      <div className="descriptionContainer">
        <p className="description">{demand}</p>
      </div>
      <div className="demand-card-footer">
        <p className="author">Skapad av: {author}</p>
      </div>
    </div>
  );
};

DemandCard.propTypes = {
  title: PropTypes.string.isRequired,
  demand: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  className: PropTypes.string,
  isStackable: PropTypes.bool,
  isOnTop: PropTypes.bool,
  onSelect: PropTypes.func,
  matchActions: PropTypes.shape({
    status: PropTypes.oneOf(['new', 'confirmedByMe', 'confirmedByThem', 'matched', 'rejectedByMe']),
    onConfirm: PropTypes.func,
    onReject: PropTypes.func,
    onCancel: PropTypes.func
  })
};

export default DemandCard;