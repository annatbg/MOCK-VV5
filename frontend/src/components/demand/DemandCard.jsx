import React, { useState } from "react";
import PropTypes from "prop-types";
import "./DemandCard.css";
import useUser from "../../store/useUser";
import DemandActionButtons from "./DemandActionButtons";

const DemandCard = ({ 
  title, 
  demand, 
  category, 
  author, 
  className, 
  isStackable = false,
  isOnTop = false,
  onSelect = () => {},
  headerExtras,
  belowHeader, // We'll rename this to actionButtons for clarity
  initialExpanded = false,
  onEdit = () => {},
  onDelete = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  // Get current user and check if this card belongs to them
  const { user } = useUser();
  const isMine = user?.email === author;

  const handleClick = () => {
    if (isStackable) {
      onSelect();
    }
  };
  
  const toggleExpand = (e) => {
    e.stopPropagation(); // Prevent firing the card's onClick handler
    setIsExpanded(!isExpanded);
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // Prevent card click
    onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    onDelete();
  };

  const cardClasses = [
    "demand-card",
    className || "",
    isStackable ? "stackable-card" : "",
    isOnTop ? "card-on-top" : "",
    isMine ? "my-demand" : "other-demand",
    isExpanded ? "expanded" : "collapsed"
  ].filter(Boolean).join(" ");

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Chevron toggle button at top */}
      <button 
        className="expand-toggle-button" 
        onClick={toggleExpand}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        title={isExpanded ? "Collapse" : "Expand"}
      >
        <div className="chevron-icon"></div>
      </button>
      
      <div className="demand-card-header">
        <div className="title-category-wrapper">
          <h3>{title}</h3>
          <span className="category">{category}</span>
        </div>
        
        {headerExtras}
      </div>
      
      {/* Only show these parts when expanded */}
      {isExpanded && (
        <>
          <div className="descriptionContainer">
            <p className="description">{demand}</p>
          </div>
          
          {/* Action buttons container that shows either passed buttons or own-demand buttons */}
          <div className="action-buttons-container">
            {isMine ? (
              <DemandActionButtons 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : belowHeader}
          </div>
          
          <div className="demand-card-footer">
            <p className="author">Skapad av: {author}</p>
          </div>
        </>
      )}
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
  belowHeader: PropTypes.node,
  initialExpanded: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default DemandCard;