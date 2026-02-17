
import { api, ApiError } from "./api";
import {
  User,
  AuthData,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ApiResponse,
} from "../types/auth.types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user";

export const tokenManager = {
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  setUser: (user: User): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );
    }
  },

  getUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr =
        localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  clearAuth: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem(TOKEN_KEY);
    }
    return false;
  },
};

// Type guard to check if response has data
export function hasData<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } {
  return (
    response.success &&
    response.data !== undefined
  );
}

// Type guard to check if error is ApiError
export function isApiError(
  error: unknown
): error is ApiError {
  return error instanceof ApiError;
}

// API Functions
export const authApi = {
  register: async (
    data: RegisterData
  ): Promise<ApiResponse<AuthData>> => {
    return api.post<
      ApiResponse<AuthData>,
      RegisterData
    >("/auth/register", data);
  },

  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthData>> => {
    return api.post<
      ApiResponse<AuthData>,
      LoginCredentials
    >("/auth/login", credentials);
  },

  forgotPassword: async (
    data: ForgotPasswordData
  ): Promise<ApiResponse<null>> => {
    return api.post<
      ApiResponse<null>,
      ForgotPasswordData
    >("/auth/forgot-password", data);
  },

  resetPassword: async (
    data: ResetPasswordData
  ): Promise<ApiResponse<null>> => {
    return api.post<
      ApiResponse<null>,
      ResetPasswordData
    >("/auth/reset-password", data);
  },

  logout: async (): Promise<
    ApiResponse<null>
  > => {
    return api.post<ApiResponse<null>>(
      "/auth/logout"
    );
  },
};
