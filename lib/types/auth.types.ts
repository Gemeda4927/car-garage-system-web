export interface User {
  profileImage: unknown;
  garageName: boolean;
  id: string;
  name: string;
  email: string;
  role: "car_owner" | "garage_owner" | "admin";
  phone?: string;
  avatar?: string | null;
  canCreateGarage: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: LoginResponse;
}

// lib/types/auth.types.ts
export interface UseAuthReturn {
  login: (
    data: LoginRequest
  ) => Promise<User | void>;
  logout: () => void;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
