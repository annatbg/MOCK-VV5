import React, { useState, useCallback } from "react";
import { 
  fetchMyDemands, 
  fetchDemandsByIds,
  confirmMatch,
  rejectMatch,
  undoRejection,
  deleteDemand // Import this function if it exists
} from "../../hooks/api/demandApi";
import ListComponent from "../../components/list/ListComponent";
import MatchGroup from "../../components/match/MatchGroup";
import "./styles/MatchView.css";

const MatchView = () => {
  const [updatedMatches, setUpdatedMatches] = useState({});
  const [matchStats, setMatchStats] = useState({ total: 0, withConfirmed: 0 });

  const fetchMatchData = useCallback(async () => {
    console.log("[MatchView] Start fetching my demands");
    try {
      const myDemandsResponse = await fetchMyDemands();
      if (!myDemandsResponse || !myDemandsResponse.data) {
        return { data: [] };
      }
      
      const myDemands = myDemandsResponse.data || [];
      const items = [];
      let demandsWithMatches = 0;
      let demandsWithConfirmed = 0;
      
      for (const demand of myDemands) {
        try {
          if (!demand || !demand.matches || demand.matches.length === 0) {
            continue;
          }
          
          // Extract match IDs and statuses
          const matchIdsToFetch = [];
          const matchStatusMap = {};
          let hasMatchedStatus = false;
          
          demand.matches.forEach(match => {
            const matchId = typeof match === 'object' ? match.id : match;
            const status = typeof match === 'object' ? match.status : 'new';
            
            matchIdsToFetch.push(matchId);
            matchStatusMap[matchId] = status;
            
            if (status === 'matched') {
              hasMatchedStatus = true;
            }
          });
          
          if (matchIdsToFetch.length === 0) {
            continue;
          }
          
          demandsWithMatches++;
          if (hasMatchedStatus) {
            demandsWithConfirmed++;
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
      
      // Update stats for the title
      setMatchStats({
        total: demandsWithMatches,
        withConfirmed: demandsWithConfirmed
      });
      
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
        const matchIndex = updatedState[demandId]?.matches?.findIndex?.(m => m.demandId === matchId);
        if (matchIndex >= 0) {
          updatedState[demandId].matches[matchIndex].status = 'confirmedByMe';
        }
        return updatedState;
      });
    } catch (error) {
      console.error("Failed to confirm match:", error);
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
        const matchIndex = updatedState[demandId]?.matches?.findIndex?.(m => m.demandId === matchId);
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
        const matchIndex = updatedState[demandId]?.matches?.findIndex?.(m => m.demandId === matchId);
        if (matchIndex >= 0) {
          updatedState[demandId].matches[matchIndex].status = 'new';
        }
        return updatedState;
      });
    } catch (error) {
      console.error("Failed to cancel match action:", error);
    }
  };

  const handleDeleteDemand = async (demandId) => {
    try {
      // Call your API to delete the demand
      await deleteDemand(demandId);
      
      // Optimistically update the UI - remove this demand from state
      setUpdatedMatches(prev => {
        const newState = { ...prev };
        delete newState[demandId];
        return newState;
      });
      
      // Force refresh the list to reflect changes
      // If your ListComponent has a refresh method exposed via ref, you could call it here
      // Otherwise, use some other state to trigger a refetch
      
    } catch (error) {
      console.error("Failed to delete demand:", error);
    }
  };

  // Create a dynamic title based on match stats
  const getDynamicTitle = () => {
    if (matchStats.total === 0) {
      return "You have no demands with possible matches";
    }
    
    if (matchStats.withConfirmed === 0) {
      return `You have ${matchStats.total} demand${matchStats.total > 1 ? 's' : ''} with possible matches`;
    }
    
    if (matchStats.withConfirmed === matchStats.total) {
      return `You have ${matchStats.total} demand${matchStats.total > 1 ? 's' : ''} with active collaborations`;
    }
    
    return `You have ${matchStats.total} demand${matchStats.total > 1 ? 's' : ''} with possible matches and ${matchStats.withConfirmed} with active collaborations`;
  };

  const renderMatchGroup = (item) => {
    return (
      <MatchGroup
        demand={item.demand}
        matches={item.matches}
        onConfirmMatch={handleConfirm}
        onRejectMatch={handleReject}
        onCancelAction={handleCancel}
        onDeleteDemand={handleDeleteDemand} // Pass the delete handler
      />
    );
  };

  return (
    <div className="match-view">
      <ListComponent
        fetchFunction={fetchMatchData}
        title={getDynamicTitle()}
        renderItem={renderMatchGroup}
        refreshOnMount={true}
      />
    </div>
  );
};

export default MatchView;
