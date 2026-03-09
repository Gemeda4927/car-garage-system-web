import {
  APIResponse,
  User,
  UsersResponse,
  UserStats,
} from "../types/user.types";
import { api } from "./api";

export const fetchUsers = async (
  page = 1,
  limit = 10
): Promise<UsersResponse> => {
  try {
    const res = await api.get<APIResponse<UsersResponse>>(
      "users", 
      { params: { page, limit } }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const fetchUserById = async (
  userId: string
): Promise<User> => {
  try {
    const res = await api.get<APIResponse<User>>(
      `users/${userId}`
    );
    return res.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  payload: Partial<Pick<User, "name" | "phone">>
): Promise<User> => {
  try {
    const res = await api.patch<APIResponse<User>>(
      `users/${userId}`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

export const softDeleteUser = async (
  userId: string
): Promise<{ deletedAt: string }> => {
  try {
    const res = await api.delete<APIResponse<{ deletedAt: string }>>(
      `users/${userId}`
    );
    return res.data;
  } catch (error) {
    console.error(`Error soft deleting user ${userId}:`, error);
    throw error;
  }
};

export const restoreUser = async (
  userId: string
): Promise<User> => {
  try {
    const res = await api.put<APIResponse<User>>(
      `users/${userId}/restore`
    );
    return res.data;
  } catch (error) {
    console.error(`Error restoring user ${userId}:`, error);
    throw error;
  }
};

export const hardDeleteUser = async (
  userId: string
): Promise<void> => {
  try {
    await api.delete(`users/${userId}/hard`);
  } catch (error) {
    console.error(`Error hard deleting user ${userId}:`, error);
    throw error;
  }
};

export const grantGarageCreation = async (
  userId: string
): Promise<User> => {
  try {
    const res = await api.put<APIResponse<User>>(
      `users/${userId}/grant-garage-creation`
    );
    return res.data;
  } catch (error) {
    console.error(`Error granting garage creation to ${userId}:`, error);
    throw error;
  }
};

export const revokeGarageCreation = async (
  userId: string
): Promise<User> => {
  try {
    const res = await api.put<APIResponse<User>>(
      `users/${userId}/revoke-garage-creation`
    );
    return res.data;
  } catch (error) {
    console.error(`Error revoking garage creation from ${userId}:`, error);
    throw error;
  }
};



export const fetchDeletedUsers = async (): Promise<User[]> => {
  try {
    const res = await api.get<APIResponse<{ users: User[] }>>(`users/deleted/all`);
    return res.data.users; // ✅ Access the nested users array
  } catch (error) {
    console.error("Error fetching deleted users:", error);
    throw error;
  }
};

export const fetchUserStats = async (): Promise<UserStats> => {
  try {
    const res = await api.get<APIResponse<UserStats>>(`users/stats/summary`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};

export const updateUserRole = async (
  userId: string,
  role: "admin" | "car_owner" | "garage_owner"
): Promise<User> => {
  try {
    const res = await api.put<APIResponse<User>>(
      `users/${userId}/role`,
      { role }
    );
    return res.data;
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    throw error;
  }
};