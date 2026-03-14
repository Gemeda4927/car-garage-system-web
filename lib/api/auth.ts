// lib/api/auth.ts
import type { LoginRequest, LoginApiResponse } from "../types/auth.types";
import { api } from "./api";

export const authApi = {
  login: (data: LoginRequest): Promise<LoginApiResponse> =>
    api.post<LoginApiResponse>("auth/login", data),
};