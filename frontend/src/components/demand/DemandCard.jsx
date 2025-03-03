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
  headerExtras, // New prop for additional header content (like status badges)
  belowHeader // New prop for content below header (like action buttons)
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
        <div className="title-category-wrapper">
          <h3>{title}</h3>
          <span className="category">{category}</span>
        </div>
        
        {/* Render any additional header content */}
        {headerExtras}
      </div>
      
      {/* Render any content below header */}
      {belowHeader}
      
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
  headerExtras: PropTypes.node,
  belowHeader: PropTypes.node
};

export default DemandCard;