import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth.store";
import { setTokenGetter } from "../api/api";
import type { LoginRequest, LoginApiResponse, UseAuthReturn } from "../types/auth.types";

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const { setUser, logout: storeLogout, user, token, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep token getter updated whenever token changes
  useEffect(() => {
    if (token) {
      console.log("Token getter updated:", token.substring(0, 10) + "…(redacted)");
      setTokenGetter(() => token);
    } else {
      setTokenGetter(() => null);
    }
  }, [token]);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response: LoginApiResponse = await authApi.login(data);

      if (response.success && response.data) {
        // Set user & token in store
        setUser(response.data.user, response.data.token);
        console.log(
          `Login successful for user: ${response.data.user.email} (role: ${response.data.user.role})`
        );
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
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
    console.log("User logged out, token cleared");
    router.push("/login");
  };

  return { login, logout, user, token, isAuthenticated, loading, error };
};