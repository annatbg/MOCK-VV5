import React from 'react';

type DemandActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

const DemandActionButtons = ({ onEdit, onDelete }: DemandActionButtonsProps) => {
  return (
    <div className="flex gap-2 mr-2 transition-opacity duration-200 ease-in-out">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit demand"
        title="Edit demand"
        className="px-3 py-1.5 rounded font-semibold text-sm cursor-pointer text-white bg-blue-900 shadow hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all duration-200 ease-in-out"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete demand"
        title="Delete demand"
        className="px-3 py-1.5 rounded font-semibold text-sm cursor-pointer text-white bg-red-800 shadow hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all duration-200 ease-in-out"
      >
        Delete
      </button>
    </div>
  );
};

export default DemandActionButtons;
