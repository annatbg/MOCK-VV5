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
      throw new Error(result.message || "Failed to create demand");
    }
  } catch (error) {
    throw new Error(
      `An error occurred while creating demand: ${(error as Error).message}`
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
        throw new Error("No demands found.");
      }
      throw new Error(`Failed to fetch demands (status: ${response.status})`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length === 0) {
      throw new Error("You have no demands.");
    }

    return data;
  } catch (error) {
    console.error("[fetchMyDemands] Error:", (error as Error).message);
    throw error;
  }
};

const fetchAllDemands = async () => {
  console.log("Fetching from:", `${API_URL}/demands/all`);

  try {
    const response = await fetch(`${API_URL}/demands/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("No demands available.");
      }
      throw new Error(`Failed to fetch demands (status: ${response.status})`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length === 0) {
      throw new Error("There are currently no demands available.");
    }

    return data;
  } catch (error) {
    console.error("[fetchAllDemands] Fetch error:", (error as Error).message);
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
      throw new Error(result.message || "Failed to delete demand");
    }
  } catch (error) {
    throw new Error(
      `An error occurred while deleting demand: ${(error as Error).message}`
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
      "[fetchDemandsByIds] Request URL:",
      `${API_URL}/demand/ids?${queryParam}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch demand(s)");
    }

    const result = await response.json();
    console.log("[fetchDemandsByIds] Response:", result);
    return result;
  } catch (error) {
    throw new Error(
      `An error occurred while fetching demand(s): ${(error as Error).message}`
    );
  }
};

// Match status management functions
export const updateMatchStatus = async (
  demandId: string,
  matchId: string,
  status: string
) => {
  try {
    console.log(
      `[demandApi] Updating match status: ${demandId}, ${matchId}, ${status}`
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
      throw new Error(`Failed to update match status to ${status}`);
    }

    const result = await response.json();
    console.log(`[demandApi] Match status updated: ${status}`, result);
    return result;
  } catch (error) {
    console.error(
      `[demandApi] Error updating match status to ${status}:`,
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
  if (!token) throw new Error("Not authenticated");

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



export {
  createDemand,
  fetchMyDemands,
  fetchAllDemands,
  deleteDemand,
  fetchDemandsByIds,
  fetchAcceptedDemands
};
