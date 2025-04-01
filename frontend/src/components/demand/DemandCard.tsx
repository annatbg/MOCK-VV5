import React, { useState } from "react";
import "./DemandCard.css";
import useUser from "../../store/useUser";
import DemandActionButtons from "./DemandActionButtons";

interface DemandCardProps {
  title: string;
  demand: string;
  category: string;
  author: string;
  demandId?: string;
  className?: string;
  isStackable?: boolean;
  isOnTop?: boolean;
  onSelect?: () => void;
  headerExtras?: React.ReactNode;
  belowHeader?: React.ReactNode; // We'll rename this to actionButtons for clarity
  initialExpanded?: boolean;
  onEdit?: () => void;
  onDelete?: (demandId?: string) => void;
}

const DemandCard: React.FC<DemandCardProps> = ({ 
  title, 
  demand, 
  category, 
  author,
  demandId,
  className, 
  isStackable = false,
  isOnTop = false,
  onSelect = () => {},
  headerExtras,
  belowHeader,
  initialExpanded = false,
  onEdit = () => {},
  onDelete = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  // Get current user and check if this card belongs to them
  const { user } = useUser();
  const isMine = user?.email === author;

  const handleClick = (): void => {
    if (isStackable) {
      onSelect();
    }
  };
  
  const toggleExpand = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onDelete(demandId);
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
                onEdit={() => onEdit()}
                onDelete={() => onDelete(demandId)}
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

export default DemandCard;