import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DemandCard from '../demand/DemandCard';
import MatchCard from './MatchCard';
import './MatchGroup.css';

const MatchGroup = ({ 
  demand, 
  matches, 
  onConfirmMatch, 
  onRejectMatch, 
  onCancelAction,
  onDeleteDemand // Add this prop
}) => {
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);
  const [activeConfirmedIndex, setActiveConfirmedIndex] = useState(-1);
  const demandId = demand.demandId;

  // Separate confirmed and other matches
  const confirmedMatches = matches.filter(match => match.status === 'matched');
  const otherMatches = matches.filter(match => match.status !== 'matched');

  return (
    <div className="match-group">
      <div className="primary-section">
        <DemandCard
          title={demand.title}
          demand={demand.demand}
          category={demand.category}
          author={demand.author}
          demandId={demand.demandId} // Pass demandId
          onDelete={onDeleteDemand} // Pass the delete handler
          className="primary-demand"
          initialExpanded={true} // Primary demand is expanded by default
        />
        
        {/* Confirmed matches displayed horizontally next to primary demand */}
        {confirmedMatches.length > 0 && (
          <div className="confirmed-matches">
            <h4>Active Collaborations:</h4>
            <div className="confirmed-card-stack">
              {confirmedMatches.map((match, index) => (
                <MatchCard
                  key={`confirmed-${match.demandId}`}
                  matchData={match}
                  className="confirmed-match-item"
                  isStackable={true}
                  isOnTop={activeConfirmedIndex === index}
                  onSelect={() => setActiveConfirmedIndex(index)}
                  initialExpanded={false} // Collapsed by default
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Other matches displayed below */}
      {otherMatches.length > 0 && (
        <div className="matches">
          <h4>Potential Matches:</h4>
          <div className="card-stack">
            {otherMatches.map((match, index) => (
              <MatchCard
                key={`other-${match.demandId}`}
                matchData={match}
                className="match-item"
                isStackable={true}
                isOnTop={activeMatchIndex === index}
                onSelect={() => setActiveMatchIndex(index)}
                onConfirm={() => onConfirmMatch(demandId, match.demandId)}
                onReject={() => onRejectMatch(demandId, match.demandId)}
                onCancel={() => onCancelAction(demandId, match.demandId, match.status)}
                initialExpanded={false} // Collapsed by default
              />
            ))}
          </div>
        </div>
      )}

      {otherMatches.length === 0 && confirmedMatches.length === 0 && (
        <p className="no-matches-message">No matches found for this demand.</p>
      )}
    </div>
  );
};

MatchGroup.propTypes = {
  demand: PropTypes.shape({
    demandId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    demand: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
  }).isRequired,
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      demandId: PropTypes.string.isRequired,
      title: PropTypes.string,
      demand: PropTypes.string,
      category: PropTypes.string,
      author: PropTypes.string,
      status: PropTypes.string.isRequired
    })
  ).isRequired,
  onConfirmMatch: PropTypes.func.isRequired,
  onRejectMatch: PropTypes.func.isRequired,
  onCancelAction: PropTypes.func.isRequired,
  onDeleteDemand: PropTypes.func // Add this to propTypes
};

export default MatchGroup;
