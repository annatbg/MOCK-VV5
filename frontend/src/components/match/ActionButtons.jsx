import React from "react";
import PropTypes from "prop-types";
import "./MatchStyles.css";

const ActionButtons = ({ status, onConfirm, onReject, onCancel }) => {
  if (!status) return null;

  return (
    <div className="match-actions-container">
      <div className="match-actions">
        {/* Confirm/Reject buttons for new matches or confirmedByThem */}
        {(status === "new" || status === "confirmedByThem") && onConfirm && onReject && (
          <>
            <button 
              className="match-action-button confirm-button"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              title="Accept this match"
            >
              Accept
            </button>
            <button 
              className="match-action-button reject-button"
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
              title="Reject this match"
            >
              Reject
            </button>
          </>
        )}
        
        {/* Cancel button for confirmedByMe */}
        {status === "confirmedByMe" && onCancel && (
          <button
            className="match-action-button cancel-button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            title="Cancel your confirmation"
          >
            Cancel Interest
          </button>
        )}
        
        {/* Cancel button for rejected matches */}
        {status === "rejectedByMe" && onCancel && (
          <button
            className="match-action-button undo-button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            title="Undo rejection"
          >
            Reconsider
          </button>
        )}
      </div>
    </div>
  );
};

ActionButtons.propTypes = {
  status: PropTypes.oneOf(['new', 'confirmedByMe', 'confirmedByThem', 'matched', 'rejectedByMe']),
  onConfirm: PropTypes.func,
  onReject: PropTypes.func,
  onCancel: PropTypes.func
};

export default ActionButtons;
