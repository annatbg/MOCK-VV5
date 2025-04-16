import React, { useState, useCallback } from "react";
import { 
  fetchMyDemands, 
  fetchDemandsByIds,
  confirmMatch,
  rejectMatch,
  undoRejection,
  deleteDemand 
} from "../../hooks/api/demandApi";
import ListComponent from "../../components/list/ListComponent";
import MatchGroup from "../../components/match/MatchGroup";
import { useModal } from "../../components/modal/ModalContext";  

interface Match {
  id?: string; 
  demandId: string;
  status: string;
}

interface Demand {
  demandId: string;
  matches: (Match | string)[];
}

interface UpdatedMatches {
  [demandId: string]: {
    matches: Match[];
  };
}

interface MatchStats {
  total: number;
  withConfirmed: number;
}

interface FetchResponse {
  data: any[];
}

const MatchView: React.FC = () => {
  const [updatedMatches, setUpdatedMatches] = useState<UpdatedMatches>({});
  const [matchStats, setMatchStats] = useState<MatchStats>({ total: 0, withConfirmed: 0 });
  const { showModal, hideModal } = useModal();  

  const fetchMatchData = useCallback(async (): Promise<FetchResponse> => {
    console.log("[MatchView] Start fetching my demands");
    try {
      const myDemandsResponse = await fetchMyDemands();
      if (!myDemandsResponse || !myDemandsResponse.data) {
        return { data: [] };
      }

      const myDemands: Demand[] = myDemandsResponse.data || [];
      const items: any[] = [];
      let demandsWithMatches = 0;
      let demandsWithConfirmed = 0;

      for (const demand of myDemands) {
        try {
          if (!demand || !demand.matches || demand.matches.length === 0) {
            continue;
          }

          const matchIdsToFetch: string[] = [];
          const matchStatusMap: Record<string, string> = {};
          let hasMatchedStatus = false;

          demand.matches.forEach(match => {
            const matchId = typeof match === 'object' ? match.id || "" : match;
            const status = typeof match === 'object' ? match.status : 'new';
            if (!matchId) return;
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

          const matchesWithStatus = matches
            .filter((match: any) => match && match.demandId)
            .map((match: any) => ({
              ...match,
              status: matchStatusMap[match.demandId] || 'new'
            }));

          if (matchesWithStatus.length > 0) {
            items.push({ 
              demand,
              ...(updatedMatches[demand.demandId] || {}),
              matches: matchesWithStatus
            });
          }
        } catch (err) {
          console.error(`[MatchView] Error processing demand:`, err);
        }
      }

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

  const handleConfirm = async (demandId: string, matchId: string) => {
    showModal(
      "Are you sure you want to confirm this match?",
      "confirm",
      async () => {
        try {
          await confirmMatch(demandId, matchId);
  
          setUpdatedMatches(prev => {
            const updatedState = { ...prev };
            if (!updatedState[demandId]) {
              updatedState[demandId] = { matches: [] };
            }
  
            const matchIndex = updatedState[demandId]?.matches?.findIndex?.(m => m.demandId === matchId);
            if (matchIndex !== undefined && matchIndex >= 0) {
              updatedState[demandId].matches[matchIndex].status = 'confirmedByMe';
            }
            return updatedState;
          });
          hideModal(); 
        } catch (error) {
          console.error("Failed to confirm match:", error);
          hideModal();
        }
      },
      () => { console.log("Confirmation canceled."); } 
    );
  };
  
  const handleReject = async (demandId: string, matchId: string) => {
    showModal(
      "Are you sure you want to reject this match?",
      "confirm",
      async () => {
        try {
          await rejectMatch(demandId, matchId);
  
          setUpdatedMatches(prev => {
            const updatedState = { ...prev };
            if (!updatedState[demandId]) {
              updatedState[demandId] = { matches: [] };
            }
  
            const matchIndex = updatedState[demandId]?.matches?.findIndex?.(m => m.demandId === matchId);
            if (matchIndex !== undefined && matchIndex >= 0) {
              updatedState[demandId].matches[matchIndex].status = 'rejectedByMe';
            }
            return updatedState;
          });
          hideModal(); 
        } catch (error) {
          console.error("Failed to reject match:", error);
          hideModal();
        }
      },
      () => { console.log("Rejection canceled."); } 
    );
  };
  

  const handleCancel = async (demandId: string, matchId: string, status: string) => {
    let modalMessage = "";
    let onConfirmAction: () => Promise<void>;
  
    if (status === "confirmedByMe") {
      modalMessage = "Are you sure you want to cancel your interest in this match?";
      onConfirmAction = async () => {
        try {
          await undoRejection(demandId, matchId); 
          setUpdatedMatches(prev => {
            const updatedState = { ...prev };
            if (!updatedState[demandId]) {
              updatedState[demandId] = { matches: [] };
            }
            const matchIndex = updatedState[demandId]?.matches?.findIndex?.(m => m.demandId === matchId);
            if (matchIndex !== undefined && matchIndex >= 0) {
              updatedState[demandId].matches[matchIndex].status = 'new';  
            }
            return updatedState;
          });
          hideModal();
        } catch (error) {
          console.error("Failed to cancel interest:", error);
          hideModal();
        }
      };
    } else if (status === "rejectedByMe") {
      modalMessage = "Are you sure you want to reconsider your rejection of this match?";
      onConfirmAction = async () => {
        try {
          await undoRejection(demandId, matchId); 
          setUpdatedMatches(prev => {
            const updatedState = { ...prev };
            if (!updatedState[demandId]) {
              updatedState[demandId] = { matches: [] };
            }
            const matchIndex = updatedState[demandId]?.matches?.findIndex?.(m => m.demandId === matchId);
            if (matchIndex !== undefined && matchIndex >= 0) {
              updatedState[demandId].matches[matchIndex].status = 'new';  
            }
            return updatedState;
          });
          hideModal();
        } catch (error) {
          console.error("Failed to reconsider rejection:", error);
          hideModal();
        }
      };
    } else {
      return;
    }
  
    showModal(modalMessage, "confirm", onConfirmAction, () => {
      console.log("Action canceled.");
    });
  };
  
   

  const getDeleteHandler = (demandId: string) => {
    return () => {
      showModal(
        "Are you sure you want to delete this demand?", 
        "confirm", 
        async () => {
          await handleDeleteDemand(demandId);  
        },
        () => { console.log("Deletion canceled."); } 
      );
    };
  };

  const handleDeleteDemand = async (demandId: string) => {
    try {
      await deleteDemand(demandId);

      setUpdatedMatches(prev => {
        const newState = { ...prev };
        delete newState[demandId];
        return newState;
      });

      hideModal();  
    } catch (error) {
      console.error("Failed to delete demand:", error);
      hideModal();
    }
  };

  const getDynamicTitle = (): string => {
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

  const renderMatchGroup = (item: any) => {
    return (
      <MatchGroup
        demand={item.demand}
        matches={item.matches}
        onConfirmMatch={handleConfirm}
        onRejectMatch={handleReject}
        onCancelAction={handleCancel}
        onDeleteDemand={getDeleteHandler(item.demand.demandId)}
      />
    );
  };

  return (
    <div className="flex flex-col items-center w-full overflow-y-auto p-6">
      <ListComponent
        fetchFunction={fetchMatchData}
        title={getDynamicTitle()}
        renderItem={renderMatchGroup}
      />
    </div>
  );
};

export default MatchView;
