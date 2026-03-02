import { useCallback } from "react";
import { useRegisterStore } from "../store/register.store";
import type {
  RegisterRequest,
  RegisterResponse,
} from "../types/register.type";

interface UseRegisterReturn {
  register: (
    payload: RegisterRequest
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: RegisterResponse | null;
  clear: () => void;
}

export const useRegister =
  (): UseRegisterReturn => {
    const {
      register: storeRegister,
      loading,
      error,
      data,
      clear,
    } = useRegisterStore();

    const register = useCallback(
      async (payload: RegisterRequest) => {
        await storeRegister(payload);
      },
      [storeRegister]
    );

    return {
      register,
      loading,
      error,
      data,
      clear,
    };
  };
