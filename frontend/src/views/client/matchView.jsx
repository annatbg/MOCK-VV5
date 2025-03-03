import React, { useState, useCallback } from "react";
import { 
  fetchMyDemands, 
  fetchDemandsByIds,
  confirmMatch,
  rejectMatch,
  undoRejection
} from "../../hooks/api/demandApi";
import ListComponent from "../../components/list/ListComponent";
import DemandCard from "../../components/demand/DemandCard";
import "./styles/MatchView.css";

const MatchView = () => {
  const [activeCards, setActiveCards] = useState({});
  const [activeConfirmedCards, setActiveConfirmedCards] = useState({});
  const [updatedMatches, setUpdatedMatches] = useState({});

  const fetchMatchData = useCallback(async () => {
    console.log("[MatchView] Start fetching my demands");
    try {
      const myDemandsResponse = await fetchMyDemands();
      if (!myDemandsResponse || !myDemandsResponse.data) {
        return { data: [] };
      }
      
      const myDemands = myDemandsResponse.data || [];
      const items = [];
      
      for (const demand of myDemands) {
        try {
          if (!demand || !demand.matches || demand.matches.length === 0) {
            continue;
          }
          
          // Extract match IDs and statuses
          const matchIdsToFetch = [];
          const matchStatusMap = {};
          
          demand.matches.forEach(match => {
            const matchId = typeof match === 'object' ? match.id : match;
            const status = typeof match === 'object' ? match.status : 'new';
            
            matchIdsToFetch.push(matchId);
            matchStatusMap[matchId] = status;
          });
          
          if (matchIdsToFetch.length === 0) {
            continue;
          }
          
          console.log(`[MatchView] Fetching matches for demand ${demand.demandId}`);
          
          const matchesResponse = await fetchDemandsByIds(matchIdsToFetch)
            .catch(err => {
              console.error(`[MatchView] Error fetching matches for demand ${demand.demandId}:`, err);
              return null;
            });
          
          if (!matchesResponse || !matchesResponse.data) {
            continue;
          }
          
          const matches = Array.isArray(matchesResponse.data) 
            ? matchesResponse.data 
            : [matchesResponse.data];
          
          // Attach status to each match object
          const matchesWithStatus = matches
            .filter(match => match && match.demandId)
            .map(match => ({
              ...match,
              status: matchStatusMap[match.demandId] || 'new'
            }));
          
          if (matchesWithStatus.length > 0) {
            items.push({ 
              demand, 
              matches: matchesWithStatus,
              // Apply any local state updates we've made
              ...(updatedMatches[demand.demandId] || {})
            });
          }
        } catch (err) {
          console.error(`[MatchView] Error processing demand:`, err);
        }
      }
      
      return { data: items };
      
    } catch (err) {
      console.error("[MatchView] Error:", err);
      return { data: [] };
    }
  }, [updatedMatches]);

  const handleConfirm = async (demandId, matchId) => {
    try {
      await confirmMatch(demandId, matchId);
      // Optimistically update UI
      setUpdatedMatches(prev => {
        const updatedState = { ...prev };
        if (!updatedState[demandId]) {
          updatedState[demandId] = { matches: [] };
        }
        // Find and update the match status
        const matchIndex = updatedState[demandId].matches?.findIndex?.(m => m.demandId === matchId);
        if (matchIndex >= 0) {
          updatedState[demandId].matches[matchIndex].status = 'confirmedByMe';
        }
        return updatedState;
      });
    } catch (error) {
      console.error("Failed to confirm match:", error);
      // Could add error state handling here
    }
  };

  const handleReject = async (demandId, matchId) => {
    try {
      await rejectMatch(demandId, matchId);
      // Optimistically update UI
      setUpdatedMatches(prev => {
        const updatedState = { ...prev };
        if (!updatedState[demandId]) {
          updatedState[demandId] = { matches: [] };
        }
        // Find and update the match status
        const matchIndex = updatedState[demandId].matches?.findIndex?.(m => m.demandId === matchId);
        if (matchIndex >= 0) {
          updatedState[demandId].matches[matchIndex].status = 'rejectedByMe';
        }
        return updatedState;
      });
    } catch (error) {
      console.error("Failed to reject match:", error);
    }
  };

  const handleCancel = async (demandId, matchId, currentStatus) => {
    try {
      await undoRejection(demandId, matchId);
      // Optimistically update UI
      setUpdatedMatches(prev => {
        const updatedState = { ...prev };
        if (!updatedState[demandId]) {
          updatedState[demandId] = { matches: [] };
        }
        // Find and update the match status
        const matchIndex = updatedState[demandId].matches?.findIndex?.(m => m.demandId === matchId);
        if (matchIndex >= 0) {
          updatedState[demandId].matches[matchIndex].status = 'new';
        }
        return updatedState;
      });
    } catch (error) {
      console.error("Failed to cancel match action:", error);
    }
  };

  const renderMatchItem = (item) => {
    const demandGroupId = item.demand.demandId || Math.random().toString();
    
    // Separate confirmed and unconfirmed matches
    const confirmedMatches = item.matches.filter(match => match.status === 'matched');
    const otherMatches = item.matches.filter(match => match.status !== 'matched');
    
    return (
      <div className="match-group">
        <div className="primary-section">
          <DemandCard
            title={item.demand.title}
            demand={item.demand.demand}
            category={item.demand.category}
            author={item.demand.author}
            className="primary-demand"
          />
          
          {/* Confirmed matches displayed horizontally next to primary demand */}
          {confirmedMatches.length > 0 && (
            <div className="confirmed-matches">
              <h4>Active Collaborations:</h4>
              <div className="confirmed-card-stack">
                {confirmedMatches.map((match, index) => (
                  <DemandCard
                    key={`confirmed-${match.demandId}`}
                    title={match.title || "Unknown title"}
                    demand={match.demand || "No details available"}
                    category={match.category || "Other"}
                    author={match.author || "Unknown"}
                    className="confirmed-match-item"
                    isStackable={true}
                    isOnTop={activeConfirmedCards[demandGroupId] === index}
                    onSelect={() => {
                      setActiveConfirmedCards(prev => ({
                        ...prev,
                        [demandGroupId]: index
                      }));
                    }}
                    matchActions={{
                      status: match.status,
                      // No action buttons needed for confirmed matches
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Other matches displayed below as before */}
        {otherMatches.length > 0 && (
          <div className="matches">
            <h4>Potential Matches:</h4>
            <div className="card-stack">
              {otherMatches.map((match, index) => (
                <DemandCard
                  key={`other-${match.demandId}`}
                  title={match.title || "Unknown title"}
                  demand={match.demand || "No details available"}
                  category={match.category || "Other"}
                  author={match.author || "Unknown"}
                  className="match-item"
                  isStackable={true}
                  isOnTop={activeCards[demandGroupId] === index}
                  onSelect={() => {
                    setActiveCards(prev => ({
                      ...prev,
                      [demandGroupId]: index
                    }));
                  }}
                  matchActions={{
                    status: match.status,
                    onConfirm: () => handleConfirm(item.demand.demandId, match.demandId),
                    onReject: () => handleReject(item.demand.demandId, match.demandId),
                    onCancel: () => handleCancel(item.demand.demandId, match.demandId, match.status)
                  }}
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

  return (
    <div className="match-view">
      <ListComponent
        fetchFunction={fetchMatchData}
        title="Matchade behov"
        renderItem={renderMatchItem}
        refreshOnMount={true} // Always refresh when component mounts
      />
    </div>
  );
};

export default MatchView;
