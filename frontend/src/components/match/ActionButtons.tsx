//MOVE TO ACCUAL BUTTON COMPONENT OR REMOVE 

type ActionButtonsProps = {
  status?: "new" | "confirmedByMe" | "confirmedByThem" | "matched" | "rejectedByMe";
  onConfirm?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
};

const ActionButtons = ({ status, onConfirm, onReject, onCancel }: ActionButtonsProps) => {
  if (!status) return null;

  const stop = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  return (
    <div className="match-actions-container">
      <div className="match-actions flex space-x-2">
        {(status === "new" || status === "confirmedByThem") && onConfirm && onReject && (
          <>
            <button
              className="match-action-button bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md "
              onClick={stop(onConfirm)}
              title="Accept this match"
            >
              Accept
            </button>
            <button
              className="match-action-button bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md "
              onClick={stop(onReject)}
              title="Reject this match"
            >
              Reject
            </button>
          </>
        )}

        {status === "confirmedByMe" && onCancel && (
          <button
            className="match-action-button bg-red-500 text-white py-2 px-4 rounded-md "
            onClick={stop(onCancel)} 
            title="Cancel your confirmation"
          >
            Cancel Interest
          </button>
        )}

        {status === "rejectedByMe" && onCancel && (
          <button
            className="match-action-button bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={stop(onCancel)}
            title="Undo rejection"
          >
            Reconsider
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
