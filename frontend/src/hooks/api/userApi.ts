import useUser from "../../store/useUser";

const API_URL: string = import.meta.env.VITE_API_URL;

type UserDataResponse = {
  user: {
    email: string;
    role: string;
    [key: string]: any;
  };
  token?: string;
  message?: string; // ✅ Fixat
};

type UpdateUserData = {
  name?: string;
  email?: string;
  password?: string;
  [key: string]: any;
};

const fetchUserData = async (): Promise<UserDataResponse> => {
  try {
    const token = useUser.getState().token;

    const response = await fetch(`${API_URL}/user/fetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

const updateUser = async (
  updateData: UpdateUserData
): Promise<UserDataResponse> => {
  try {
    const token = useUser.getState().token;

    const response = await fetch(`${API_URL}/user/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    const result: UserDataResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Update failed");
    }

    return result;
  } catch (error) {
    console.error("updateUser: Error:", error);
    throw new Error(
      `An error occurred while updating profile: ${(error as Error).message}`
    );
  }
};

export { fetchUserData, updateUser };
