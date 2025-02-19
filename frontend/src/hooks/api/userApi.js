import useUser from "../../store/useUser";
const API_URL = import.meta.env.VITE_API_URL;

const fetchUserData = async (user, endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

const updateUser = async (updateData) => {
  try {
    const token = useUser.getState().token;
    const response = await fetch(API_URL + "/user/edit", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Update failed");
    }
    return result;
  } catch (error) {
    throw new Error("An error occurred while updating profile: " + error.message);
  }
};

export { fetchUserData, updateUser };
