import { create } from "zustand";
import type {
  RegisterRequest,
  RegisterResponse,
} from "../types/register.type";
import { registerUser } from "../api/register.api";
import type { AxiosError } from "axios";

interface RegisterState {
  loading: boolean;
  error: string | null;
  data: RegisterResponse | null;
  register: (
    payload: RegisterRequest
  ) => Promise<void>;
  clear: () => void;
}

export const useRegisterStore =
  create<RegisterState>((set) => ({
    loading: false,
    error: null,
    data: null,

    register: async (payload) => {
      set({ loading: true, error: null });
      try {
        const res = await registerUser(payload);
        set({ data: res, loading: false });
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{
          message: string;
        }>;
        set({
          error:
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Registration failed",
          loading: false,
        });
      }
    },

    clear: () =>
      set({
        data: null,
        error: null,
        loading: false,
      }),
  }));
