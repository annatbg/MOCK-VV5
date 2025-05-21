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
      throw new Error(`HTTP-fel! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fel vid hämtning av användardata:", error);
    throw new Error(`Ett fel inträffade vid hämtning av användardata: ${(error as Error).message}`);
  }
};

// Update user
const updateUser = async (updateData: UpdateUserData): Promise<UserDataResponse> => {
  try {
    const token = useUser.getState().token;
    console.log("updateUser: Token:", token);
    console.log("updateUser: Uppdateringsdata:", updateData);

    const response = await fetch(`${API_URL}/user/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    console.log("updateUser: Svarstatus:", response.status);

    const result: UserDataResponse = await response.json();
    console.log("updateUser: Svarresultat:", result);

    if (!response.ok) {
      throw new Error(result.message || "Uppdatering misslyckades.");
    }
    return result;
  } catch (error) {
    console.error("updateUser: Fel:", error);
    throw new Error(
      `Ett fel inträffade vid uppdatering av profilen: ${(error as Error).message}`
    );
  }
};

export { fetchUserData, updateUser };
