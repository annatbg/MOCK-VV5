import React, { createContext, useState, useContext, ReactNode } from "react";

type ModalContextType = {
  isVisible: boolean;
  message: string;
  type: "success" | "error" | "confirm";  
  onConfirm?: () => void;  
  onCancel?: () => void;  
  showModal: (message: string, type: "success" | "error" | "confirm", onConfirm?: () => void, onCancel?: () => void) => void;
  hideModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "confirm">("success");
  const [onConfirm, setOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [onCancel, setOnCancel] = useState<(() => void) | undefined>(undefined);

  const showModal = (message: string, type: "success" | "error" | "confirm", onConfirm?: () => void, onCancel?: () => void) => {
    setMessage(message);
    setType(type);
    setIsVisible(true);
    setOnConfirm(() => onConfirm);  
    setOnCancel(() => onCancel);   
  };

  const hideModal = () => {
    setIsVisible(false);
    setMessage("");
    setType("success");
    setOnConfirm(undefined);
    setOnCancel(undefined);
  };

  return (
    <ModalContext.Provider value={{ isVisible, message, type, onConfirm, onCancel, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
