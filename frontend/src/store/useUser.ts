import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  email: string;
  password?: string;
  organisation?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  role: string;
}

interface UserStore {
  user: User | null;
  token: string | null;
  login: (userData: User, userToken: string) => void;
  logout: () => void;
}

const useUser = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (userData, userToken) =>
        set(() => ({ user: userData, token: userToken })),
      logout: () => {
        localStorage.removeItem("zustand-user");
        set(() => ({ user: null, token: null }));
      },
    }),
    {
      name: "zustand-user",
      // bara token sparas
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useUser;
