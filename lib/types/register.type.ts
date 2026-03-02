export type Role =
  | "car_owner"
  | "garage_owner"
  | "admin";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  avatar: string | null;
  canCreateGarage: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: UserData;
    token: string;
  };
}
