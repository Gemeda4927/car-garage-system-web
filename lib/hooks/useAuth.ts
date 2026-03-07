// lib/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth.store";
import { setTokenGetter } from "../api/api";
import type {
  LoginRequest,
  LoginApiResponse,
  UseAuthReturn,
} from "../types/auth.types";

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
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

  // Set token getter whenever auth state changes
  useEffect(() => {
    if (token) {
      console.log(
        "Setting token getter with token:",
        token.substring(0, 10) + "..."
      );
      setTokenGetter(() => token);
    } else {
      setTokenGetter(() => null);
    }
  }, [token]);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response: LoginApiResponse =
        await authApi.login(data);

      if (response.success && response.data) {
        setUser(
          response.data.user,
          response.data.token
        );

        // Redirect based on role
        if (
          response.data.user.role ===
          "garage_owner"
        ) {
          router.push("/owner/dashboard");
        } else if (
          response.data.user.role === "admin"
        ) {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } else {
        setError(
          response.message || "Login failed"
        );
      }
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

  const logout = () => {
    storeLogout();
    setTokenGetter(() => null);
    router.push("/login");
  };

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
