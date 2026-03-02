import { useState } from "react";
import axios from "axios";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth.store";
import type {
  LoginRequest,
  LoginApiResponse,
  UseAuthReturn,
} from "../types/auth.types";

export const useAuth = (): UseAuthReturn => {
  const {
    setUser,
    logout: storeLogout,
    user,
    token,
    isAuthenticated,
  } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response: LoginApiResponse =
        await authApi.login(data);
      setUser(
        response.data.user,
        response.data.token
      );
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.data?.message
      ) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => storeLogout();

  return {
    login,
    logout,
    user,
    token,
    isAuthenticated,
    loading,
    error,
  };
};
