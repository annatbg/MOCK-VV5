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
import Pagination from "../../components/pagination/Pagination";

interface Match {
  id?: string; 
  demandId: string;
  status: string;
}

interface Demand {
  demandId: string;
  matches: (Match | string)[];
  category?: string; 
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
  const [formData, setFormData] = useState({ category: "" }); // Added state for category
  const [loading, setLoading] = useState(false);
  const { showModal, hideModal } = useModal();
  const [currentPage, setCurrentPage] = useState(0); 
  const itemsPerPage = 3; 


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

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

    // Loopa igenom efterfrågningar
    for (const demand of myDemands) {
      try {
        if (!demand || !demand.matches || demand.matches.length === 0) {
          continue; 
        }

        // Filtrera baserat på kategori
        if (formData.category && demand.category !== formData.category) {
          continue; 
        }

        const matchIdsToFetch: string[] = [];
        const matchStatusMap: Record<string, string> = {};
        let hasValidMatches = false;

        demand.matches.forEach(match => {
          const matchId = typeof match === 'object' ? match.id || "" : match;
          const status = typeof match === 'object' ? match.status : 'new';
          if (!matchId) return;
          matchIdsToFetch.push(matchId);
          matchStatusMap[matchId] = status;

          // Kontrollera om det finns giltiga matchningar
          if (status !== 'matched' && status !== 'rejectedByMe') {
            hasValidMatches = true;
          }
        });

        if (!hasValidMatches || matchIdsToFetch.length === 0) {
          continue; 
        }

        demandsWithMatches++;

        console.log(`[MatchView] Fetching matches for demand ${demand.demandId}`);

        const matchesResponse = await fetchDemandsByIds(matchIdsToFetch).catch(err => {
          console.error(`[MatchView] Error gick ej att hämta matchningar för demand ${demand.demandId}:`, err);
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
        console.error(`[MatchView] Error bearbetar demand:`, err);
      }
    }

    setMatchStats({
      total: demandsWithMatches, 
      withConfirmed: demandsWithConfirmed
    });

    const paginatedItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    return { data: paginatedItems };
  } catch (err) {
    console.error("[MatchView] Error:", err);
    return { data: [] };
  }
}, [updatedMatches, formData.category, currentPage]);



  const handleConfirm = async (demandId: string, matchId: string) => {
    showModal(
      "Är du säker på att du vill bekräfta denna match? ",
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
          console.error("Misslyckad att bekräfta match:", error);
          hideModal();
        }
      },
      () => { console.log("Confirmation canceled."); } 
    );
  };

  const handleReject = async (demandId: string, matchId: string) => {
    showModal(
      "Är du säker på att du vill avboka denna match?",
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
          console.error("Misslyckad att neka match:", error);
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
      modalMessage = "är du säker på att du vill avbryta denna match?";
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
          console.error("Misslyckad att avbryta intresse:", error);
          hideModal();
        }
      };
    } else if (status === "rejectedByMe") {
      modalMessage = "Är du säker på att du vill ångra denna match?";
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
          console.error("Misslyckad att ångra intresse:", error);
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
        "är du säker på att du vill radera denna demand?", 
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
      console.error("Misslyckad att ta bort demand:", error);
      hideModal();
    }
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
    {/* Dropdown för kategori */}
    <div className="mb-4 w-full max-w-md">
      <label htmlFor="category" className="block font-semibold text-gray-800 mb-1"></label>
      <select
        id="category"
        value={formData.category}
        onChange={handleChange}
        className="w-full p-3 border rounded-xl text-base bg-white focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-100"
        disabled={loading}
      >
        <option value="">Välj en kategori</option>
        <option value="Health">Hälsa</option>
        <option value="Technology">Teknologi</option>
        <option value="Finance">Ekonomi</option>
        <option value="Environment">Miljö</option>
        <option value="Education">Utbildning</option>
      </select>
    </div>

    {/* List of items */}
    <ListComponent
        fetchFunction={fetchMatchData}
        renderItem={renderMatchGroup} title={""}    
        />

    {/* Pagination Component */}
    <Pagination
    currentPage={currentPage}
    totalItems={matchStats.total}
    onPageChange={(page: number) => setCurrentPage(page)}
    itemsPerPage={itemsPerPage} 
  />
  </div>
);

};

export default MatchView;
