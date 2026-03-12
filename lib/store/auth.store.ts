import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types/auth.types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
        console.log(
          `Auth store updated: user ${user.email} logged in (role: ${user.role}, token redacted)`
        );
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        console.log("Auth store cleared: user logged out");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);