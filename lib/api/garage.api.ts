import {
  CreateGaragePayload,
  UpdateGaragePayload,
  PopulatedGarage,
} from "../types/garage.types";
import { api } from "./api";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface GaragesResponse {
  garages: PopulatedGarage[];
  priceRange: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GarageResponse {
  garage: PopulatedGarage;
}

export const garageService = {
  // Create Garage
  create: (data: CreateGaragePayload) =>
    api.post<ApiResponse<GarageResponse>>(
      "garages",
      data
    ),

  // Get All Garages
  getAll: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<GaragesResponse>>(
      "garages",
      { params }
    ),

  // Get Garage By ID
  getById: (garageId: string) =>
    api.get<ApiResponse<GarageResponse>>(
      `garages/${garageId}`
    ),

  // Update Garage
  update: (
    garageId: string,
    data: UpdateGaragePayload
  ) =>
    api.patch<ApiResponse<GarageResponse>>(
      `garages/${garageId}`,
      data
    ),

  // Soft Delete Garage
  delete: (garageId: string) =>
    api.delete<ApiResponse<null>>(
      `/garages/${garageId}`
    ),

  // =============================
  // Additional APIs (Added)
  // =============================

  // Restore Soft Deleted Garage
  restore: (garageId: string) =>
    api.patch<ApiResponse<GarageResponse>>(
      `/garages/${garageId}/restore`
    ),

  // Hard Delete Garage
  hardDelete: (garageId: string) =>
    api.delete<ApiResponse<null>>(
      `/garages/${garageId}/force`
    ),

  // Get Deleted Garages
  getDeleted: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<GaragesResponse>>(
      "/garages/deleted",
      { params }
    ),

  // Search Garages
  search: (query: string) =>
    api.get<ApiResponse<GaragesResponse>>(
      "/garages/search",
      { params: { q: query } }
    ),

  // Get Garages By Owner
  getByOwner: (ownerId: string) =>
    api.get<ApiResponse<GaragesResponse>>(
      `/garages/owner/${ownerId}`
    ),

  // Toggle Garage Active Status
  toggleActive: (garageId: string) =>
    api.patch<ApiResponse<GarageResponse>>(
      `/garages/${garageId}/toggle-active`
    ),
};