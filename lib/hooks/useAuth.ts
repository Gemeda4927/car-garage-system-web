// hooks/useAuth.ts
import {
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

import {
  User,
  AuthData,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  UserRole,
} from "@/lib/types/auth.types";
import { useAuthStore } from "../store/auth.store";
import {
  authApi,
  hasData,
  isApiError,
  tokenManager,
} from "../api/auth";

// Types for the hook return
interface UseAuthReturn {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (
    credentials: LoginCredentials
  ) => Promise<LoginResult>;
  register: (
    data: RegisterData
  ) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  forgotPassword: (
    data: ForgotPasswordData
  ) => Promise<ForgotPasswordResult>;
  resetPassword: (
    data: ResetPasswordData
  ) => Promise<ResetPasswordResult>;

  // State management
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

interface LoginResult {
  success: boolean;
  message?: string;
  data?: AuthData;
}

interface RegisterResult {
  success: boolean;
  message?: string;
  data?: AuthData;
}

interface ForgotPasswordResult {
  success: boolean;
  message: string;
}

interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [isLoading, setIsLoading] =
    useState(false);
  const [error, setErrorState] = useState<
    string | null
  >(null);

  // Get state and actions from store
  const {
    user,
    token,
    isAuthenticated,
    setAuth,
    setUser,
    setToken,
    logout: storeLogout,
    setError: setStoreError,
  } = useAuthStore();

  // Sync error state with store
  const setError = useCallback(
    (error: string | null) => {
      setErrorState(error);
      setStoreError(error);
    },
    [setStoreError]
  );

  const clearError = useCallback(() => {
    setErrorState(null);
    setStoreError(null);
  }, [setStoreError]);

  // Handle successful authentication
  const handleAuthSuccess = useCallback(
    (authData: AuthData) => {
      const user: User = {
        id: authData.id,
        name: authData.name,
        email: authData.email,
        role: authData.role as UserRole,
      };

      // Update store
      setAuth(user, authData.token);

      // Update localStorage
      tokenManager.setToken(authData.token);
      tokenManager.setUser(user);

      return user;
    },
    [setAuth]
  );

  // Login
  const login = useCallback(
    async (
      credentials: LoginCredentials
    ): Promise<LoginResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await authApi.login(credentials);

        if (hasData(response)) {
          handleAuthSuccess(response.data);

          return {
            success: true,
            message: response.message,
            data: response.data,
          };
        } else {
          setError(response.message);
          return {
            success: false,
            message: response.message,
          };
        }
      } catch (err: unknown) {
        let message = "Login failed";
        if (isApiError(err)) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess, setError]
  );

  // Register
  const register = useCallback(
    async (
      data: RegisterData
    ): Promise<RegisterResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await authApi.register(data);

        if (hasData(response)) {
          handleAuthSuccess(response.data);

          return {
            success: true,
            message: response.message,
            data: response.data,
          };
        } else {
          setError(response.message);
          return {
            success: false,
            message: response.message,
          };
        }
      } catch (err: unknown) {
        let message = "Registration failed";
        if (isApiError(err)) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess, setError]
  );

  // Logout
  const logout =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);

      try {
        await authApi.logout();
      } catch (err: unknown) {
        // Ignore errors on logout
      } finally {
        // Clear store
        storeLogout();

        // Clear localStorage
        tokenManager.clearAuth();

        setIsLoading(false);

        // Redirect to home
        router.push("/");
      }
    }, [router, storeLogout]);

  // Forgot Password
  const forgotPassword = useCallback(
    async (
      data: ForgotPasswordData
    ): Promise<ForgotPasswordResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await authApi.forgotPassword(data);

        if (response.success) {
          return {
            success: true,
            message: response.message,
          };
        } else {
          setError(response.message);
          return {
            success: false,
            message: response.message,
          };
        }
      } catch (err: unknown) {
        let message =
          "Failed to send reset email";
        if (isApiError(err)) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [setError]
  );

  // Reset Password
  const resetPassword = useCallback(
    async (
      data: ResetPasswordData
    ): Promise<ResetPasswordResult> => {
      setIsLoading(true);
      setError(null);

      // Validate passwords match
      if (
        data.password !== data.confirmPassword
      ) {
        const message = "Passwords do not match";
        setError(message);
        setIsLoading(false);
        return {
          success: false,
          message,
        };
      }

      try {
        const response =
          await authApi.resetPassword(data);

        if (response.success) {
          return {
            success: true,
            message: response.message,
          };
        } else {
          setError(response.message);
          return {
            success: false,
            message: response.message,
          };
        }
      } catch (err: unknown) {
        let message = "Failed to reset password";
        if (isApiError(err)) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [setError]
  );

  // Refresh user data (optional - if you have a /me endpoint)
  const refreshUser =
    useCallback(async (): Promise<void> => {
      if (!isAuthenticated) return;

      setIsLoading(true);

      try {
        // You can add this endpoint to your authApi if needed
        // const response = await authApi.getCurrentUser();
        // if (hasData(response)) {
        //   setUser({
        //     id: response.data.id,
        //     name: response.data.name,
        //     email: response.data.email,
        //     role: response.data.role as UserRole,
        //   });
        // }
      } catch (err: unknown) {
        // If token is invalid, logout
        if (
          isApiError(err) &&
          err.status === 401
        ) {
          storeLogout();
          tokenManager.clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    }, [isAuthenticated, storeLogout]);

  // Auto-redirect based on role after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      // You can handle redirects here if needed
      // This is optional - you might want to redirect from components instead
    }
  }, [isAuthenticated, user]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Auth actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,

    // State management
    setError,
    clearError,
    refreshUser,
  };
};
