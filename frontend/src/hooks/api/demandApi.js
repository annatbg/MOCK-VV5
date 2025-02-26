import useUser from "../../store/useUser";
const API_URL = import.meta.env.VITE_API_URL;

const createDemand = async (formData) => {
  try {
    const token = useUser.getState().token;
    // const user = useUser.getState().user;

    // console.log("data", formData.formData);
    // console.log("token", token);

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
      `An error occurred while creating demand: ${error.message}`
    );
  }
};

const fetchMyDemands = async () => {
  // const user = useUser.getState().user;
  const token = useUser.getState().token;

  const response = await fetch(`${API_URL}/demand`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch demands");
  }

  return response.json();
};

const fetchAllDemands = async () => {
  console.log("Fetching from:", `${API_URL}/demands/all`); // Logga URL

  try {
    const response = await fetch(`${API_URL}/demands/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Logga status

    if (!response.ok) {
      throw new Error("Failed to fetch demands");
    }

    return response.json();
  } catch (error) {
    console.error("Fetch error:", error.message);
    throw error;
  }
};

const fetchDemandsByIds = async (ids) => {
  try {
    const token = useUser.getState().token;
    // Använd "ids" query-param om det är en array
    const queryParam = Array.isArray(ids)
      ? `ids=${ids.join(",")}`
      : `id=${ids}`;
    // Viktigt: anropa endpointen /demand/ids
    const response = await fetch(`${API_URL}/demand/ids?${queryParam}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("[fetchDemandsByIds] Request URL:", `${API_URL}/demand/ids?${queryParam}`);
    if (!response.ok) {
      throw new Error("Failed to fetch demand(s)");
    }
    const result = await response.json();
    console.log("[fetchDemandsByIds] Response:", result);
    return result;
  } catch (error) {
    throw new Error(`An error occurred while fetching demand(s): ${error.message}`);
  }
};

export { createDemand, fetchMyDemands, fetchAllDemands, fetchDemandsByIds };