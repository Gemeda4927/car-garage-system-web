
export type UserRole =
  | "user"
  | "admin"
  | "garage_owner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthData {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Exclude<UserRole, "admin">;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Generic response type
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}
