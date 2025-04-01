import React from 'react';
import PropTypes from 'prop-types';
import './DemandActionButtons.css';

type DemandActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
};


const DemandActionButtons = ({ onEdit, onDelete }: DemandActionButtonsProps)  => {
  return (
    <div className="demand-action-buttons">
      <button 
        className="demand-action-button edit-button"
        onClick={onEdit}
        aria-label="Edit demand"
        title="Edit demand"
      >
        Edit
      </button>
      <button 
        className="demand-action-button delete-button"
        onClick={onDelete}
        aria-label="Delete demand"
        title="Delete demand"
      >
        Delete
      </button>
    </div>
  );
};

DemandActionButtons.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default DemandActionButtons;
