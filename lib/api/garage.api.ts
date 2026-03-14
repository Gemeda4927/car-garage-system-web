import {
  CreateGaragePayload,
  UpdateGaragePayload,
  VerifyGaragePayload,
  PopulatedGarage,
  GarageService,
  GarageReview,
  ServiceBooking,
  GarageAnalyticsData,
  DeletedGaragesStats,
  UnverifiedGaragesStats,
  CategorySummary,
  ReviewsSummary,
  BookingsStats,
} from "../types/garage.types";

import { api } from "./api";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ================================
// Complete Garages Data Type
// ================================
export interface CompleteGaragesData {
  garages: PopulatedGarage[];
  stats: {
    totalGarages: number;
    totalActive: number;
    totalInactive?: number;
    totalDeleted: number;
    totalVerified: number;
    totalUnverified?: number;
    totalPending: number;
    totalApproved?: number;
    totalSuspended: number;
    services: {
      total: number;
      priceRange: {
        min: number;
        max: number;
        avg: number;
      };
      byCategory?: Record<string, number>;
    };
    bookings: {
      total: number;
      totalRevenue: number;
      byStatus: Record<string, number>;
      upcoming?: number;
    };
    reviews: {
      total: number;
      averageRating: number;
      byRating: Record<number, number>;
      withResponse?: number;
    };
    payments: {
      total: number;
      totalAmount?: number;
      byMethod: Record<string, number>;
      byStatus?: Record<string, number>;
    };
    owners: {
      total: number;
    };
    files: {
      totalImages: number;
      totalDocuments: number;
    };
  };
  collections: {
    services: GarageService[];
    bookings: ServiceBooking[];
    reviews: GarageReview[];
    payments: unknown[];
    owners: unknown[];
  };
  pricing: {
    global: {
      minPrice: number;
      maxPrice: number;
      avgPrice: number;
    };
    byGarage: Array<{
      garageId: string;
      garageName: string;
      services: Array<{
        serviceId: string;
        name: string;
        price: number;
        category: string;
      }>;
    }>;
  };
  groups: {
    byCity: Record<string, PopulatedGarage[]>;
    byVerificationStatus: {
      verified: PopulatedGarage[];
      unverified: PopulatedGarage[];
    };
    byDeletionStatus: {
      active: string[];
      deleted: PopulatedGarage[];
    };
    byStatus: Record<string, PopulatedGarage[]>;
  };
  timeline: {
    createdByMonth: Record<string, number>;
    verifiedByMonth: Record<string, number>;
  };
  metadata: {
    lastUpdated: string;
    version: string;
    generatedAt?: string;
    databaseStats: {
      [x: string]: number;
      collections: Record<string, number>;
      totalSize: number;
      garagesWithCoordinates?: number;
      garagesWithImages?: number;
      garagesWithDocuments?: number;
      garagesWithServices?: number;
    };
  };
}

// ================================
// Garage Service API
// ================================
export const garageService = {
  // -----------------------------
  // Create Garage
  // POST /garages
  // -----------------------------
  create: (data: CreateGaragePayload) =>
    api.post<ApiResponse<{ garage: PopulatedGarage }>>("garages", data),

  // -----------------------------
  // Get All Garages
  // GET /garages
  // -----------------------------
  getAll: () =>
    api.get<ApiResponse<{ garages: PopulatedGarage[] }>>("garages"),

  // -----------------------------
  // Get Complete All Garages (No Auth)
  // GET /garages/all/complete
  // -----------------------------
  getAllComplete: () =>
    api.get<ApiResponse<CompleteGaragesData>>("garages/all/complete"),

  // -----------------------------
  // Get Deleted Garages (Admin)
  // GET /garages/deleted/all
  // -----------------------------
  getDeleted: () =>
    api.get<ApiResponse<DeletedGaragesStats>>("garages/deleted/all"),

  // -----------------------------
  // Get Unverified Garages (Admin)
  // GET /garages/unverified/all
  // -----------------------------
  getUnverified: () =>
    api.get<ApiResponse<UnverifiedGaragesStats>>("garages/unverified/all"),

  // -----------------------------
  // Get Garage By ID
  // GET /garages/:garageId
  // -----------------------------
  getById: (garageId: string) =>
    api.get<ApiResponse<{ garage: PopulatedGarage }>>(`garages/${garageId}`),

  // -----------------------------
  // Update Garage
  // PATCH /garages/:garageId
  // -----------------------------
  update: (garageId: string, data: UpdateGaragePayload) =>
    api.patch<ApiResponse<{ garage: PopulatedGarage }>>(`garages/${garageId}`, data),

  // -----------------------------
  // Delete Garage (Soft Delete)
  // DELETE /garages/:garageId
  // -----------------------------
  delete: (garageId: string) =>
    api.delete<ApiResponse<null>>(`garages/${garageId}`),

  // -----------------------------
  // Restore Garage (Admin)
  // PUT /garages/:garageId/restore
  // -----------------------------
  restore: (garageId: string) =>
    api.put<ApiResponse<{ garage: PopulatedGarage }>>(`garages/${garageId}/restore`),

  // -----------------------------
  // Verify Garage (Admin)
  // PUT /garages/:garageId/verify
  // -----------------------------
  verify: (garageId: string, data: VerifyGaragePayload) =>
    api.put<ApiResponse<{ garage: PopulatedGarage }>>(`garages/${garageId}/verify`, data),

  // -----------------------------
  // Toggle Active Status
  // PUT /garages/:garageId/toggle-active
  // -----------------------------
  toggleActive: (garageId: string) =>
    api.put<ApiResponse<{ isActive: boolean }>>(`garages/${garageId}/toggle-active`),

  // -----------------------------
  // Get Nearby Garages
  // GET /garages/nearby
  // -----------------------------
  getNearby: (params: { lat: number; lng: number; radius?: number; limit?: number }) =>
    api.get<ApiResponse<{ garages: PopulatedGarage[] }>>("garages/nearby", { params }),

  // -----------------------------
  // Get Garage Services
  // GET /garages/:garageId/services
  // -----------------------------
  getServices: (garageId: string) =>
    api.get<ApiResponse<{ services: GarageService[] }>>(`garages/${garageId}/services`),

  // -----------------------------
  // Get Garage Reviews
  // GET /garages/:garageId/reviews
  // -----------------------------
  getReviews: (garageId: string) =>
    api.get<ApiResponse<{ reviews: GarageReview[] }>>(`garages/${garageId}/reviews`),

  // -----------------------------
  // Get Garage Bookings
  // GET /garages/:garageId/bookings
  // -----------------------------
  getBookings: (garageId: string) =>
    api.get<ApiResponse<{ bookings: ServiceBooking[] }>>(`garages/${garageId}/bookings`),

  // -----------------------------
  // Get Garage Analytics
  // GET /garages/:garageId/analytics
  // -----------------------------
  getAnalytics: (garageId: string, params?: { period?: "week" | "month" | "quarter" | "year" }) =>
    api.get<ApiResponse<{ analytics: GarageAnalyticsData }>>(`garages/${garageId}/analytics`, { params }),

  // -----------------------------
  // Upload Files
  // POST /garages/:garageId/uploads
  // -----------------------------
  uploadFiles: (garageId: string, data: FormData) =>
    api.post<ApiResponse<{ images?: string[]; documents?: string[] }>>(
      `garages/${garageId}/uploads`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    ),

  // -----------------------------
  // Delete File
  // DELETE /garages/:garageId/files/:filename
  // -----------------------------
  deleteFile: (garageId: string, filename: string, params: { type: "images" | "documents" }) =>
    api.delete<ApiResponse<null>>(`garages/${garageId}/files/${filename}`, { params }),
};