import React from "react";
import PropTypes from "prop-types";

const Button = ({ onClick, label, variant = "primary", disabled = false }) => {
  const buttonStyles = {
    primary: "bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600",
    danger: "bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600",
    success: "bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600",
    secondary: "bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600",
  };

  return (
    <button
      className={`${buttonStyles[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["primary", "danger", "success", "secondary"]),
  disabled: PropTypes.bool,
};

export default Button;
