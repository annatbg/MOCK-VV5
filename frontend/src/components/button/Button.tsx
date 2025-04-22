import PropTypes from "prop-types";

type ButtonProps = {
  onClick?: () => void;  // Make onClick optional
  label: string;
  variant?: "primary" | "danger" | "success" | "secondary";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";  // Add 'type' prop for form buttons
};

const Button = ({
  onClick,
  label,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",  // Default is "button", can be overridden
}: ButtonProps) => {
  const buttonStyles = {
    primary: "bg-lightGreen text-white hover:bg-lightGreenHover",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
  };

  return (
    <button
      className={`${buttonStyles[variant]} ${className} rounded-md ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
      type={type}  // This allows setting the type of the button (submit, reset, etc.)
    >
      {label}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["primary", "danger", "success", "secondary"]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),  // Ensure type prop is validated
};

export default Button;


/*

import { FC } from "react";

type ButtonProps = {
  onClick: () => void;
  label: string;
  variant?: "primary" | "danger" | "success" | "secondary";
  disabled?: boolean;
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-blue-500 hover:bg-blue-600",
  danger: "bg-red-500 hover:bg-red-600",
  success: "bg-green-500 hover:bg-green-600",
  secondary: "bg-gray-500 hover:bg-gray-600",
};

const Button: FC<ButtonProps> = ({
  onClick,
  label,
  variant = "primary",
  disabled = false,
}) => {
  const baseClasses = "text-white px-4 py-2 rounded-md transition";
  const disabledClasses = disabled ? " opacity-50 cursor-not-allowed" : "";
  const finalClass = `${baseClasses} ${variantClasses[variant]}${disabledClasses}`;

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={finalClass}>
      {label}
    </button>
  );
};

export default Button;


*/ 