import { api } from "./api";
import type {
  RegisterRequest,
  RegisterResponse,
} from "../types/register.type";

export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post<
    RegisterResponse,
    RegisterRequest
  >("auth/register", data);
  return response;
};
