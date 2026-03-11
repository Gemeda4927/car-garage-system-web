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
// Response Types
// ================================

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

// Deleted Garages Response
export interface DeletedGaragesResponse {
  garages: PopulatedGarage[];
  stats: DeletedGaragesStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Unverified Garages Response
export interface UnverifiedGaragesResponse {
  garages: PopulatedGarage[];
  stats: UnverifiedGaragesStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Nearby garages
export interface NearbyGaragesResponse {
  count: number;
  radius: number;
  garages: PopulatedGarage[];
}

// Garage Services Response
export interface GarageServicesResponse {
  services: GarageService[];
  categorySummary: CategorySummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Garage Reviews Response
export interface GarageReviewsResponse {
  reviews: GarageReview[];
  summary: ReviewsSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Garage Bookings Response
export interface GarageBookingsResponse {
  bookings: ServiceBooking[];
  stats: BookingsStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Garage Analytics Response
export interface GarageAnalyticsResponse {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  analytics: GarageAnalyticsData;
  summary: {
    current: {
      totalRevenue: number;
      totalBookings: number;
      avgValue: number;
    };
    previous: {
      totalRevenue: number;
      totalBookings: number;
      averageValue: number;
    };
    growth: {
      bookings: number;
      revenue: number;
      averageValue: number;
    };
  };
}

// Upload Files Response
export interface UploadFilesResponse {
  images?: string[];
  documents?: string[];
}

// Verify Garage Response
export interface VerifyGarageResponse {
  garage: {
    id: string;
    name: string;
    status: string;
    isVerified: boolean;
    isActive: boolean;
    verifiedAt: string;
  };
}

// Toggle Active Response
export interface ToggleActiveResponse {
  isActive: boolean;
}

// ================================
// COMPLETE GARAGE DATA RESPONSE - NEW
// ================================

export interface ServiceCollection {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  images?: string[];
  isAvailable: boolean;
  garage: string;
  bookings?: BookingCollection[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingCollection {
  _id: string;
  bookingDate: string;
  timeSlot: {
    start: string;
    end: string;
  };
  status: string;
  carOwner: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    _id: string;
    name: string;
    price: number;
  };
  price?: {
    subtotal: number;
    tax?: number;
    total: number;
  };
  isPaid: boolean;
  createdAt: string;
}

export interface ReviewCollection {
  _id: string;
  rating: number;
  comment: string;
  carOwner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  booking?: {
    _id: string;
    service: {
      _id: string;
      name: string;
      price: number;
    };
    timeSlot: {
      start: string;
      end: string;
    };
    bookingDate: string;
  };
  response?: {
    comment: string;
    respondedAt: string;
    respondedBy: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
  };
  createdAt: string;
}

export interface PaymentCollection {
  _id: string;
  amount: number;
  transactionId: string;
  status: string;
  method: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  garage?: string;
  garageCreation?: {
    garage: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OwnerCollection {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteGaragesData {
  // All garages with full details
  garages: PopulatedGarage[];
  
  // Separate collections for easy access
  collections: {
    services: ServiceCollection[];
    bookings: BookingCollection[];
    reviews: ReviewCollection[];
    payments: PaymentCollection[];
    owners: OwnerCollection[];
  };
  
  // Comprehensive statistics
  stats: {
    totalGarages: number;
    totalVerified: number;
    totalUnverified: number;
    totalActive: number;
    totalInactive: number;
    totalDeleted: number;
    totalPending: number;
    totalApproved: number;
    totalSuspended: number;
    
    services: {
      total: number;
      byCategory: Record<string, number>;
      priceRange: {
        min: number;
        max: number;
        avg: number;
      };
    };
    
    bookings: {
      total: number;
      byStatus: Record<string, number>;
      totalRevenue: number;
      upcoming: number;
    };
    
    reviews: {
      total: number;
      averageRating: number;
      byRating: Record<string, number>;
      withResponse: number;
    };
    
    payments: {
      total: number;
      totalAmount: number;
      byStatus: Record<string, number>;
      byMethod: Record<string, number>;
    };
    
    owners: {
      total: number;
      withGarages: number;
    };
    
    files: {
      totalImages: number;
      totalDocuments: number;
    };
  };
  
  // Groupings
  groups: {
    byCity: Record<string, {
      count: number;
      garages: Array<{
        id: string;
        name: string;
        status: string;
      }>;
    }>;
    byVerificationStatus: {
      verified: Array<{
        id: string;
        name: string;
        verifiedAt?: string;
        verifiedBy?: unknown;
      }>;
      unverified: Array<{
        id: string;
        name: string;
        createdAt: string;
        payment?: unknown;
      }>;
    };
    byDeletionStatus: {
      active: string[];
      deleted: Array<{
        id: string;
        name: string;
        deletedAt: string;
        deletedBy?: unknown;
      }>;
    };
    byStatus: Record<string, Array<{
      id: string;
      name: string;
      isVerified: boolean;
      isActive: boolean;
    }>>;
  };
  
  // Price information
  pricing: {
    global: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
    byGarage: Array<{
      garageId: string;
      garageName: string;
      services: Array<{
        id: string;
        name: string;
        price: number;
        category: string;
        duration: number;
        isAvailable: boolean;
      }>;
    }>;
  };
  
  // Timeline data
  timeline: {
    createdByMonth: Record<string, number>;
    verifiedByMonth: Record<string, number>;
  };
  
  // Raw counts
  counts: {
    garages: number;
    services: number;
    bookings: number;
    reviews: number;
    payments: number;
    owners: number;
  };
  
  // Metadata
  metadata: {
    generatedAt: string;
    totalRecords: {
      garages: number;
      services: number;
      bookings: number;
      reviews: number;
      payments: number;
      owners: number;
    };
    databaseStats: {
      garagesWithCoordinates: number;
      garagesWithImages: number;
      garagesWithDocuments: number;
      garagesWithBusinessHours: number;
      garagesWithServices: number;
      garagesWithReviews: number;
      garagesWithBookings: number;
    };
  };
}

export interface CompleteGaragesResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: CompleteGaragesData;
}

// ================================
// Garage Service
// ================================

export const garageService = {
  // -----------------------------
  // Create Garage
  // POST /garages
  // -----------------------------
  create: (data: CreateGaragePayload) =>
    api.post<ApiResponse<GarageResponse>>(
      "garages",
      data
    ),

  // -----------------------------
  // Get All Garages
  // GET /garages
  // -----------------------------
  getAll: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<GaragesResponse>>(
      "garages",
      params
    ),

  // -----------------------------
  // Get Complete All Garages (NO CONDITIONS, NO AUTH) - NEW
  // GET /garages/all/complete
  // -----------------------------
  getAllComplete: () =>
    api.get<CompleteGaragesResponse>(
      "garages/all/complete"
    ),

  // -----------------------------
  // Get Deleted Garages (Admin)
  // GET /garages/deleted/all
  // -----------------------------
  getDeleted: (
    params?: Record<string, unknown>
  ) =>
    api.get<ApiResponse<DeletedGaragesResponse>>(
      "garages/deleted/all",
      params
    ),

  // -----------------------------
  // Get Unverified Garages (Admin)
  // GET /garages/unverified/all
  // -----------------------------
  getUnverified: (
    params?: Record<string, unknown>
  ) =>
    api.get<
      ApiResponse<UnverifiedGaragesResponse>
    >("garages/unverified/all", params),

  // -----------------------------
  // Get Garage By ID
  // GET /garages/:garageId
  // -----------------------------
  getById: (garageId: string) =>
    api.get<ApiResponse<GarageResponse>>(
      `garages/${garageId}`
    ),

  // -----------------------------
  // Update Garage
  // PATCH /garages/:garageId
  // -----------------------------
  update: (
    garageId: string,
    data: UpdateGaragePayload
  ) =>
    api.patch<ApiResponse<GarageResponse>>(
      `garages/${garageId}`,
      data
    ),

  // -----------------------------
  // Delete Garage (Soft Delete)
  // DELETE /garages/:garageId
  // -----------------------------
  delete: (garageId: string) =>
    api.delete<ApiResponse<null>>(
      `garages/${garageId}`
    ),

  // -----------------------------
  // Restore Garage (Admin)
  // PUT /garages/:garageId/restore
  // -----------------------------
  restore: (garageId: string) =>
    api.put<ApiResponse<GarageResponse>>(
      `garages/${garageId}/restore`
    ),

  // -----------------------------
  // Verify Garage (Admin)
  // PUT /garages/:garageId/verify
  // -----------------------------
  verify: (
    garageId: string,
    data: VerifyGaragePayload
  ) =>
    api.put<ApiResponse<VerifyGarageResponse>>(
      `garages/${garageId}/verify`,
      data
    ),

  // -----------------------------
  // Toggle Active Status
  // PUT /garages/:garageId/toggle-active
  // -----------------------------
  toggleActive: (garageId: string) =>
    api.put<ApiResponse<ToggleActiveResponse>>(
      `garages/${garageId}/toggle-active`
    ),

  // -----------------------------
  // Get Nearby Garages
  // GET /garages/nearby
  // -----------------------------
  getNearby: (params: {
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
  }) =>
    api.get<ApiResponse<NearbyGaragesResponse>>(
      "garages/nearby",
      params
    ),

  // -----------------------------
  // Get Garage Services
  // GET /garages/:garageId/services
  // -----------------------------
  getServices: (
    garageId: string,
    params?: {
      category?: string;
      isAvailable?: boolean;
      page?: number;
      limit?: number;
    }
  ) =>
    api.get<ApiResponse<GarageServicesResponse>>(
      `garages/${garageId}/services`,
      params
    ),

  // -----------------------------
  // Get Garage Reviews
  // GET /garages/:garageId/reviews
  // -----------------------------
  getReviews: (
    garageId: string,
    params?: {
      rating?: number;
      hasResponse?: boolean;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ) =>
    api.get<ApiResponse<GarageReviewsResponse>>(
      `garages/${garageId}/reviews`,
      params
    ),

  // -----------------------------
  // Get Garage Bookings
  // GET /garages/:garageId/bookings
  // -----------------------------
  getBookings: (
    garageId: string,
    params?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ) =>
    api.get<ApiResponse<GarageBookingsResponse>>(
      `garages/${garageId}/bookings`,
      params
    ),

  // -----------------------------
  // Get Garage Analytics
  // GET /garages/:garageId/analytics
  // -----------------------------
  getAnalytics: (
    garageId: string,
    params?: {
      period?:
        | "week"
        | "month"
        | "quarter"
        | "year";
    }
  ) =>
    api.get<ApiResponse<GarageAnalyticsResponse>>(
      `garages/${garageId}/analytics`,
      params
    ),

  // -----------------------------
  // Upload Files
  // POST /garages/:garageId/uploads
  // -----------------------------
  uploadFiles: (
    garageId: string,
    data: FormData
  ) =>
    api.post<ApiResponse<UploadFilesResponse>>(
      `garages/${garageId}/uploads`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    ),

  // -----------------------------
  // Delete File
  // DELETE /garages/:garageId/files/:filename
  // -----------------------------
  deleteFile: (
    garageId: string,
    filename: string,
    params: { type: "images" | "documents" }
  ) =>
    api.delete<ApiResponse<null>>(
      `garages/${garageId}/files/${filename}`,
      params
    ),
};