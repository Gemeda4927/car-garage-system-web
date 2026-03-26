// lib/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth.store";
import { setTokenGetter, clearTokenCache, updateToken } from "../api/api";
import type { LoginRequest, LoginApiResponse, UseAuthReturn } from "../types/auth.types";

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const { setUser, logout: storeLogout, user, token, isAuthenticated, isLoading: storeLoading } = useAuthStore();
  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set token getter IMMEDIATELY when token changes
  useEffect(() => {
    if (token) {
      // Set the getter to return the current token synchronously
      setTokenGetter(() => token);
      // Also update the token cache directly
      updateToken(token);
    } else {
      setTokenGetter(() => null);
      clearTokenCache();
    }
  }, [token]);

  const login = async (data: LoginRequest) => {
    setLoadingState(true);
    setError(null);

    try {
      if (isDev) console.time('login-total');
      
      const response: LoginApiResponse = await authApi.login(data);

      if (response.success && response.data) {
        // Update store - this will trigger token update via useEffect
        setUser(response.data.user, response.data.token);
        
        if (isDev) {
          console.timeEnd('login-total');
          console.log(`✅ Login successful: ${response.data.user.email} (role: ${response.data.user.role})`);
        }
        
        return response.data.user;
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: unknown) {
      if (isDev) console.error("Login error:", err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoadingState(false);
    }
  };

  const logout = () => {
    storeLogout();
    clearTokenCache(); // Clear the token cache
    setTokenGetter(() => null);
    if (isDev) console.log("🔐 User logged out, all tokens cleared");
    router.push("/login");
  };

  return { 
    login, 
    logout, 
    user, 
    token, 
    isAuthenticated, 
    loading: loading || storeLoading,
    error 
  };
};

// Add this for TypeScript
const isDev = process.env.NODE_ENV === 'development';