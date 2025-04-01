import React, { useState } from 'react';
import DemandCard from '../demand/DemandCard';
import MatchCard from './MatchCard';
import './MatchGroup.css';

interface MatchData {
  demandId: string;
  title?: string;
  demand?: string;
  category?: string;
  author?: string;
  status: 'new' | 'confirmedByMe' | 'confirmedByThem' | 'matched' | 'rejectedByMe';
}

interface Demand {
  demandId: string;
  title: string;
  demand: string;
  category: string;
  author: string;
}

interface MatchGroupProps {
  demand: Demand;
  matches: MatchData[];
  onConfirmMatch: (demandId: string, matchId: string) => void;
  onRejectMatch: (demandId: string, matchId: string) => void;
  onCancelAction: (demandId: string, matchId: string, status: string) => void;
  onDeleteDemand?: () => void;
}

const MatchGroup: React.FC<MatchGroupProps> = ({ 
  demand, 
  matches, 
  onConfirmMatch, 
  onRejectMatch, 
  onCancelAction,
  onDeleteDemand
}) => {
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(-1);
  const [activeConfirmedIndex, setActiveConfirmedIndex] = useState<number>(-1);
  const demandId = demand.demandId;

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
          demandId={demand.demandId}
          onDelete={onDeleteDemand}
          className="primary-demand"
          initialExpanded={true}
        />
        
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
                  initialExpanded={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
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
                initialExpanded={false}
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

export default MatchGroup;