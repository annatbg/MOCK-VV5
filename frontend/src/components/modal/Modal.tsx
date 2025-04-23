import { useModal } from "../modal/ModalContext";

const Modal: React.FC = () => {
  const { isVisible, message, type, hideModal, onConfirm, onCancel } = useModal();

  if (!isVisible) return null; 

  const handleConfirm = () => {
    if (onConfirm && typeof onConfirm === "function") {
      onConfirm(); 
    }
    hideModal(); 
  };

  const handleCancel = () => {
    if (onCancel && typeof onCancel === "function") {
      onCancel(); 
    }
    hideModal(); 
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-6 rounded-lg shadow-lg w-1/3 text-center bg-lightText">
        <h2 className="text-xl font-semibold mb-4">
          {type === "success" ? "Success!" : type === "error" ? "Error!" : "Bekräfta"}
        </h2>
        <p className="text-lg">{message}</p>

        {type === "confirm" && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-lightGreen text-lightText rounded-md hover:bg-darkGreen transition"
            >
              Bekräfta
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2 bg-red-500 text-lightText rounded-md hover:bg-red-700 transition"
            >
              Avbryt
            </button>
          </div>
        )}

        {(type === "success" || type === "error") && (
          <button
            onClick={hideModal}
            className="mt-4 px-5 py-2 bg-lightGreen text-lightText rounded-md hover:bg-darkGreen transition"
          >
            Stäng
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
