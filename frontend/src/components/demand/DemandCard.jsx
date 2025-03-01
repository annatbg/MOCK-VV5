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
  onSelect = () => {}
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
    isOnTop ? "card-on-top" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="demand-card-header">
        <h3>{title}</h3>
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
  onSelect: PropTypes.func
};

export default DemandCard;