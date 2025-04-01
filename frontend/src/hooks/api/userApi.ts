import useUser from "../../store/useUser";

const API_URL: string = import.meta.env.VITE_API_URL;

// Define types
type User = {
  email: string;
};

type UserDataResponse = {
  id: string;
  email: string;
  name?: string;
  [key: string]: any; // Allows additional user fields
};

type UpdateUserData = {
  name?: string;
  email?: string;
  password?: string;
  [key: string]: any;
};

// Fetch user data
const fetchUserData = async (user: User, endpoint: string): Promise<UserDataResponse> => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Update user
const updateUser = async (updateData: UpdateUserData): Promise<UserDataResponse> => {
  try {
    const token = useUser.getState().token;
    console.log("updateUser: Token:", token);
    console.log("updateUser: Update data:", updateData);

    const response = await fetch(`${API_URL}/user/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    console.log("updateUser: Response status:", response.status);

    const result: UserDataResponse = await response.json();
    console.log("updateUser: Response result:", result);

    if (!response.ok) {
      throw new Error(result.message || "Update failed");
    }
    return result;
  } catch (error) {
    console.error("updateUser: Error:", error);
    throw new Error(`An error occurred while updating profile: ${(error as Error).message}`);
  }
};

export { fetchUserData, updateUser };
