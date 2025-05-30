/// <reference types="vite/client" />

const API_URL: string = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  email: string;
  name?: string;
  organisation?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface SignupData {
  email: string;
  password: string;
  organisation?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  name?: string; // 
}

const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result: AuthResponse = await response.json();
    if (response.ok) {
      return result;
    } else {
      throw new Error(result.user?.id || "Inloggning misslyckades");
    }
  } catch (error) {
    throw new Error("Ett fel uppstod vid inloggning: " + (error as Error).message);
  }
};

const signupUser = async (formData: SignupData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result: AuthResponse = await response.json();
    if (response.ok) {
      return result;
    } else {
      throw new Error(result.user?.id || "Registrering misslyckades");
    }
  } catch (error) {
    throw new Error("Ett fel uppstod vid registrering: " + (error as Error).message);
  }
};

export { loginUser, signupUser };
