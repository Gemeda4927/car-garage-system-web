import { create } from "zustand";
import {
  User,
  UsersResponse,
  Pagination,
  UserStats,
} from "../types/user.types";
import * as userApi from "../api/user.api";

interface UserStoreState {
  users: User[];
  deletedUsers: User[];
  selectedUser: User | null;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  stats: UserStats | null;

  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchDeletedUsers: () => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  fetchUserStats: () => Promise<void>;
  updateUser: (userId: string, payload: Partial<Pick<User, "name" | "phone">>) => Promise<void>;
  softDeleteUser: (userId: string) => Promise<void>;
  restoreUser: (userId: string) => Promise<void>;
  hardDeleteUser: (userId: string) => Promise<void>;
  grantGarageCreation: (userId: string) => Promise<void>;
  revokeGarageCreation: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  users: [],
  deletedUsers: [],
  selectedUser: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,

  fetchUsers: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const data: UsersResponse = await userApi.fetchUsers(page, limit);
      set({
        users: data.users || [],
        pagination: data.pagination || { page, limit, total: 0, pages: 0 },
        loading: false,
      });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch users",
        loading: false,
        users: [],
      });
    }
  },

  fetchDeletedUsers: async () => {
    set({ loading: true, error: null });
    try {
      const deletedUsers: User[] = await userApi.fetchDeletedUsers();
      set({ 
        deletedUsers: Array.isArray(deletedUsers) ? deletedUsers : [], 
        loading: false 
      });
    } catch (err: unknown) {
      console.error("Error fetching deleted users:", err);
      set({ 
        deletedUsers: [], 
        loading: false, 
        error: null // Don't show error for deleted users
      });
    }
  },

  fetchUserById: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const user: User = await userApi.fetchUserById(userId);
      set({ selectedUser: user, loading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch user",
        loading: false,
        selectedUser: null,
      });
    }
  },

  fetchUserStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats: UserStats = await userApi.fetchUserStats();
      set({ stats, loading: false });
    } catch (err: unknown) {
      console.error("Error fetching stats:", err);
      set({ 
        stats: null, 
        loading: false,
        error: null // Don't show error for stats
      });
    }
  },

  updateUser: async (userId, payload) => {
    set({ loading: true, error: null });
    try {
      const updatedUser: User = await userApi.updateUser(userId, payload);
      set((state) => ({
        users: (state.users || []).map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        ),
        selectedUser: state.selectedUser?._id === updatedUser._id ? updatedUser : state.selectedUser,
        loading: false,
      }));
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to update user",
        loading: false,
      });
    }
  },

  softDeleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const result = await userApi.softDeleteUser(userId);
      const userToDelete = get().users.find(u => u._id === userId);
      
      set((state) => ({
        users: (state.users || []).filter((u) => u._id !== userId),
        deletedUsers: userToDelete ? [
          ...(state.deletedUsers || []),
          { ...userToDelete, isDeleted: true, deletedAt: result.deletedAt }
        ] : (state.deletedUsers || []),
        loading: false,
      }));
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete user",
        loading: false,
      });
    }
  },

  restoreUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const restoredUser: User = await userApi.restoreUser(userId);
      set((state) => ({
        users: [restoredUser, ...(state.users || [])],
        deletedUsers: (state.deletedUsers || []).filter((u) => u._id !== userId),
        loading: false,
      }));
    } catch (err: unknown) {
      // Fallback to local update if API fails
      const userToRestore = get().deletedUsers.find(u => u._id === userId);
      if (userToRestore) {
        set((state) => ({
          users: [{ ...userToRestore, isDeleted: false }, ...(state.users || [])],
          deletedUsers: (state.deletedUsers || []).filter((u) => u._id !== userId),
          loading: false,
          error: null,
        }));
      } else {
        set({
          error: err instanceof Error ? err.message : "Failed to restore user",
          loading: false,
        });
      }
    }
  },

  hardDeleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await userApi.hardDeleteUser(userId);
      set((state) => ({
        deletedUsers: (state.deletedUsers || []).filter((u) => u._id !== userId),
        loading: false,
      }));
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to permanently delete user",
        loading: false,
      });
    }
  },

  grantGarageCreation: async (userId) => {
    set({ loading: true, error: null });
    try {
      const updatedUser: User = await userApi.grantGarageCreation(userId);
      set((state) => ({
        users: (state.users || []).map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        ),
        selectedUser: state.selectedUser?._id === updatedUser._id ? updatedUser : state.selectedUser,
        loading: false,
      }));
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to grant permission",
        loading: false,
      });
    }
  },

  revokeGarageCreation: async (userId) => {
    set({ loading: true, error: null });
    try {
      const updatedUser: User = await userApi.revokeGarageCreation(userId);
      set((state) => ({
        users: (state.users || []).map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        ),
        selectedUser: state.selectedUser?._id === updatedUser._id ? updatedUser : state.selectedUser,
        loading: false,
      }));
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to revoke permission",
        loading: false,
      });
    }
  },
}));