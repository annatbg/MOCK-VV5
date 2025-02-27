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
    console.log("updateUser: Token:", token);
    console.log("updateUser: Update data:", updateData);

    const response = await fetch(API_URL + "/user/edit", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    console.log("updateUser: Response status:", response.status);

    const result = await response.json();
    console.log("updateUser: Response result:", result);

    if (!response.ok) {
      throw new Error(result.message || "Update failed");
    }
    return result;
  } catch (error) {
    console.error("updateUser: Error:", error);
    throw new Error("An error occurred while updating profile: " + error.message);
  }
};

export { fetchUserData, updateUser };
