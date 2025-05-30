import useUser from "../../store/useUser";

const API_URL = import.meta.env.VITE_API_URL;

const createDemand = async (formData: { formData: any }) => {
  try {
    const token = useUser.getState().token;

    const response = await fetch(`${API_URL}/demand`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData.formData),
    });

    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      throw new Error(result.message || "Kunde inte skapa förfrågan.");
    }
  } catch (error) {
    throw new Error(
      `Ett fel inträffade vid skapandet av förfrågan: ${(error as Error).message}`
    );
  }
};

const fetchMyDemands = async () => {
  const token = useUser.getState().token;

  try {
    const response = await fetch(`${API_URL}/demand`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Inga förfrågningar hittades.");
      }
      throw new Error(`Kunde inte hämta förfrågningar (status: ${response.status}).`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length === 0) {
      throw new Error("Du har inga förfrågningar.");
    }

    return data;
  } catch (error) {
    console.error("[fetchMyDemands] Fel:", (error as Error).message);
    throw error;
  }
};

const fetchAllDemands = async () => {
  console.log("Hämtar från:", `${API_URL}/demands/all`);

  try {
    const response = await fetch(`${API_URL}/demands/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Svar status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Inga förfrågningar finns tillgängliga.");
      }
      throw new Error(`Kunde inte hämta förfrågningar (status: ${response.status}).`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length === 0) {
      throw new Error("Det finns inga förfrågningar tillgängliga för tillfället.");
    }

    return data;
  } catch (error) {
    console.error("[fetchAllDemands] Fel vid hämtning:", (error as Error).message);
    throw error;
  }
};

const deleteDemand = async (demandId: string) => {
  try {
    const token = useUser.getState().token;

    const response = await fetch(`${API_URL}/demand/${demandId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      throw new Error(result.message || "Kunde inte ta bort förfrågan.");
    }
  } catch (error) {
    throw new Error(
      `Ett fel inträffade vid borttagningen av förfrågan: ${(error as Error).message}`
    );
  }
};

const fetchDemandsByIds = async (ids: string | string[]) => {
  try {
    const token = useUser.getState().token;
    const queryParam = Array.isArray(ids)
      ? `ids=${ids.join(",")}`
      : `ids=${ids}`;

    const response = await fetch(`${API_URL}/demand/ids?${queryParam}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      "[fetchDemandsByIds] Begär URL:",
      `${API_URL}/demand/ids?${queryParam}`
    );

    if (!response.ok) {
      throw new Error("Kunde inte hämta förfrågan/förfrågningar.");
    }

    const result = await response.json();

    return result;
  } catch (error) {
    throw new Error(
      `Ett fel inträffade vid hämtning av förfrågan/förfrågningar: ${(error as Error).message}`
    );
  }
};

// Hantering av matchningsstatus
export const updateMatchStatus = async (
  demandId: string,
  matchId: string,
  status: string
) => {
  try {
    console.log(
      `[demandApi] Uppdaterar matchstatus: ${demandId}, ${matchId}, ${status}`
    );
    const token = useUser.getState().token;

    const response = await fetch(`${API_URL}/demand/matches/${demandId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ matchId, status }),
    });

    if (!response.ok) {
      throw new Error(`Kunde inte uppdatera matchstatus till ${status}.`);
    }

    const result = await response.json();
    console.log(`[demandApi] Matchstatus uppdaterad: ${status}`, result);
    return result;
  } catch (error) {
    console.error(
      `[demandApi] Fel vid uppdatering av matchstatus till ${status}:`,
      error
    );
    throw error;
  }
};

export const confirmMatch = async (demandId: string, matchId: string) => {
  return updateMatchStatus(demandId, matchId, "confirmedByMe");
};

export const rejectMatch = async (demandId: string, matchId: string) => {
  return updateMatchStatus(demandId, matchId, "rejectedByMe");
};

export const undoRejection = async (demandId: string, matchId: string) => {
  return updateMatchStatus(demandId, matchId, "new");
};

const fetchAcceptedDemands = async (): Promise<any[]> => {
  const token = useUser.getState().token;
  if (!token) throw new Error("Inte autentiserad.");

  const response = await fetch(`${API_URL}/demand/accepted`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const { message, data } = await response.json();

  if (!response.ok) {

    throw new Error(message || "Failed to fetch accepted demands");

  }

  return data;
};


// anropas när användaren klickar på en notis
const markMatchAsSeen = async (demandId: string, matchId: string) => {
  
  console.log("Markera som läst:", demandId, matchId);

  try {
    const token = useUser.getState().token;

    const response = await fetch(`${API_URL}/demand/mark-match-as-seen`, {
      method: "POST",
=======
const editDemand = async (
  demandId: string, 
  updatedData: { title: string; demand: string; category: string }
) => {
  try {
    console.log(`[demandApi] Editing demand: ${demandId}`, updatedData);
    const token = useUser.getState().token;

    // Input validation
    if (!demandId) {
      throw new Error("Demand ID is required");
    }
    
    if (!updatedData.title || !updatedData.demand || !updatedData.category) {
      throw new Error("All fields (title, demand, category) are required");
    }

    const response = await fetch(`${API_URL}/demand/${demandId}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({ demandId, matchId }),
    });

    

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to mark match as seen");
    }

      body: JSON.stringify(updatedData),
    });

    const result = await response.json();
    console.log(`[demandApi] Edit demand response:`, result);
    
    if (response.ok) {
      return result.data; // Return the updated demand data
    } else {
      throw new Error(result.message || "Failed to update demand");
    }
  } catch (error) {
    console.error("[demandApi] Error editing demand:", error);
    throw new Error(
      `An error occurred while updating demand: ${(error as Error).message}`
    );
  }
};


    const result = await response.json();
    return result;
  } catch (error) {
    console.error("[markMatchAsSeen] Error:", (error as Error).message);
    throw error;
  }
};

export {
  createDemand,
  fetchMyDemands,
  fetchAllDemands,
  deleteDemand,
  fetchDemandsByIds,
  fetchAcceptedDemands,
  markMatchAsSeen,
  editDemand
};
