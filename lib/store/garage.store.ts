import { create } from "zustand";
import {
  CompleteGaragesData,
  garageService,
} from "../api/garage.api";
import {
  CreateGaragePayload,
  UpdateGaragePayload,
  VerifyGaragePayload,
  PopulatedGarage,
  NearbyGarage,
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

/* ============================ */
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/* ============================ */
interface GarageState {
  // State
  garage: PopulatedGarage | null;
  garages: PopulatedGarage[];
  nearbyGarages: NearbyGarage[];
  deletedGarages: PopulatedGarage[];
  unverifiedGarages: PopulatedGarage[];
  garageServices: GarageService[];
  garageReviews: GarageReview[];
  garageBookings: ServiceBooking[];
  garageAnalytics: GarageAnalyticsData | null;

  // Complete data state
  completeData: CompleteGaragesData | null;

  // Loading states
  loading: boolean;
  error: string | null;
  actionLoading: Record<string, boolean>;

  // Pagination & Stats
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  priceRange: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  } | null;

  deletedGaragesStats: DeletedGaragesStats | null;
  unverifiedGaragesStats: UnverifiedGaragesStats[] | null;

  servicesPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  reviewsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  bookingsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  reviewsSummary: ReviewsSummary | null;
  bookingsStats: BookingsStats | null;
  categorySummary: CategorySummary[] | null;

  // Actions
  fetchGarages: () => Promise<void>;
  fetchGarage: (id: string) => Promise<void>;
  fetchNearbyGarages: (
    lat: number,
    lng: number,
    radius?: number,
    limit?: number
  ) => Promise<void>;
  fetchDeletedGarages: () => Promise<void>;
  fetchUnverifiedGarages: () => Promise<void>;

  // Fetch complete data action
  fetchCompleteData: () => Promise<CompleteGaragesData | null>;

  fetchGarageServices: (garageId: string) => Promise<void>;
  fetchGarageReviews: (garageId: string) => Promise<void>;
  fetchGarageBookings: (garageId: string) => Promise<void>;
  fetchGarageAnalytics: (
    garageId: string,
    period?: "week" | "month" | "quarter" | "year"
  ) => Promise<void>;

  createGarage: (data: CreateGaragePayload) => Promise<PopulatedGarage | null>;
  updateGarage: (id: string, data: UpdateGaragePayload) => Promise<PopulatedGarage | null>;
  deleteGarage: (id: string) => Promise<void>;
  restoreGarage: (id: string) => Promise<void>;

  verifyGarage: (id: string, data: VerifyGaragePayload) => Promise<void>;
  toggleActiveGarage: (id: string) => Promise<void>;

  uploadFiles: (garageId: string, data: FormData) => Promise<any>;
  deleteFile: (
    garageId: string,
    filename: string,
    type: "images" | "documents"
  ) => Promise<void>;

  clearError: () => void;
  resetGarage: () => void;
  resetGarageServices: () => void;
  resetGarageReviews: () => void;
  resetGarageBookings: () => void;
}

/* ============================ */

export const useGarageStore = create<GarageState>((set, get) => ({
  // Initial state
  garage: null,
  garages: [],
  nearbyGarages: [],
  deletedGarages: [],
  unverifiedGarages: [],
  garageServices: [],
  garageReviews: [],
  garageBookings: [],
  garageAnalytics: null,

  // Complete data initial state
  completeData: null,

  loading: false,
  error: null,
  actionLoading: {},

  pagination: null,
  priceRange: null,
  deletedGaragesStats: null,
  unverifiedGaragesStats: null,
  servicesPagination: null,
  reviewsPagination: null,
  bookingsPagination: null,
  reviewsSummary: null,
  bookingsStats: null,
  categorySummary: null,

  /* ============================ */
  fetchGarages: async () => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getAll();

      if (response.success) {
        set({
          garages: response.data.garages,
          pagination: response.data.pagination,
          priceRange: response.data.priceRange,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch garages",
        loading: false,
      });
    }
  },

  /* ============================ */
  fetchGarage: async (id) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getById(id);

      if (response.success) {
        set({
          garage: response.data.garage,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch garage",
        loading: false,
      });
    }
  },

  /* ============================ */
  fetchNearbyGarages: async (lat: number, lng: number, radius: number = 10, limit: number = 20) => {
    try {
      set({ loading: true, error: null });

      console.log("Store calling getNearby with:", { lat, lng, radius, limit });

      const response = await garageService.getNearby(lat, lng, radius, limit);

      if (response.success) {
        set({
          nearbyGarages: response.data.garages,
          loading: false,
        });
        console.log("Nearby garages fetched:", response.data);
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      console.error("Error in fetchNearbyGarages:", error);
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch nearby garages",
        loading: false,
      });
    }
  },

  /* ============================ */
  fetchDeletedGarages: async () => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getDeleted();

      if (response.success) {
        set({
          deletedGarages: response.data.garages,
          pagination: response.data.pagination,
          deletedGaragesStats: response.data.stats,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch deleted garages",
        loading: false,
      });
    }
  },

  /* ============================ */
  fetchUnverifiedGarages: async () => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getUnverified();

      if (response.success) {
        set({
          unverifiedGarages: response.data.garages,
          pagination: response.data.pagination,
          unverifiedGaragesStats: response.data.stats,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch unverified garages",
        loading: false,
      });
    }
  },

  /* ============================ */
  fetchCompleteData: async () => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getAllComplete();

      if (response.success) {
        set({
          completeData: response.data,
          // Also update individual collections for backward compatibility
          garages: response.data.garages,
          loading: false,
        });
        return response.data;
      }
      set({ loading: false });
      return null;
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch complete garage data",
        loading: false,
      });
      return null;
    }
  },

  /* ============================ */
  fetchGarageServices: async (garageId) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getServices(garageId);

      if (response.success) {
        set({
          garageServices: response.data.services,
          servicesPagination: response.data.pagination,
          categorySummary: response.data.categorySummary,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch garage services",
        loading: false,
      });
    }
  },

  /* ============================ */
  fetchGarageReviews: async (garageId) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getReviews(garageId);

      if (response.success) {
        set({
          garageReviews: response.data.reviews,
          reviewsPagination: response.data.pagination,
          reviewsSummary: response.data.summary,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch garage reviews",
        loading: false,
      });
    }
  },

  /* ============================ */
  fetchGarageBookings: async (garageId) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getBookings(garageId);

      if (response.success) {
        set({
          garageBookings: response.data.bookings,
          bookingsPagination: response.data.pagination,
          bookingsStats: response.data.stats,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch garage bookings",
        loading: false,
      });
    }
  },

  /* ============================ */
  fetchGarageAnalytics: async (garageId, period = "month") => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getAnalytics(garageId, { period });

      if (response.success) {
        set({
          garageAnalytics: response.data,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch garage analytics",
        loading: false,
      });
    }
  },

  /* ============================ */
  createGarage: async (payload) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.create(payload);

      if (response.success) {
        const newGarage = response.data.garage;

        set((state) => ({
          garage: newGarage,
          garages: [...state.garages, newGarage],
          loading: false,
        }));

        return newGarage;
      }

      set({ loading: false });
      return null;
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to create garage",
        loading: false,
      });
      throw err;
    }
  },

  /* ============================ */
  updateGarage: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.update(id, payload);

      if (response.success) {
        const updatedGarage = response.data.garage;

        set((state) => ({
          garage: updatedGarage,
          garages: state.garages.map((g) => (g._id === id ? updatedGarage : g)),
          deletedGarages: state.deletedGarages.filter((g) => g._id !== id),
          unverifiedGarages: state.unverifiedGarages.filter((g) => g._id !== id),
          loading: false,
        }));

        return updatedGarage;
      }

      set({ loading: false });
      return null;
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to update garage",
        loading: false,
      });
      throw err;
    }
  },

  /* ============================ */
  deleteGarage: async (id) => {
    try {
      set({
        loading: true,
        error: null,
        actionLoading: { ...get().actionLoading, [id]: true },
      });

      const response = await garageService.delete(id);

      if (response.success) {
        set((state) => ({
          garages: state.garages.filter((g) => g._id !== id),
          garage: state.garage?._id === id ? null : state.garage,
          loading: false,
          actionLoading: { ...state.actionLoading, [id]: false },
        }));
      } else {
        set((state) => ({
          loading: false,
          actionLoading: { ...state.actionLoading, [id]: false },
        }));
      }
    } catch (err) {
      const error = err as ApiError;
      set((state) => ({
        error: error.response?.data?.message || error.message || "Failed to delete garage",
        loading: false,
        actionLoading: { ...state.actionLoading, [id]: false },
      }));
      throw err;
    }
  },

  /* ============================ */
  restoreGarage: async (id) => {
    try {
      set({
        loading: true,
        error: null,
        actionLoading: { ...get().actionLoading, [id]: true },
      });

      const response = await garageService.restore(id);

      if (response.success) {
        const restoredGarage = response.data.garage;

        set((state) => ({
          garages: [...state.garages, restoredGarage],
          deletedGarages: state.deletedGarages.filter((g) => g._id !== id),
          loading: false,
          actionLoading: { ...state.actionLoading, [id]: false },
        }));
      } else {
        set((state) => ({
          loading: false,
          actionLoading: { ...state.actionLoading, [id]: false },
        }));
      }
    } catch (err) {
      const error = err as ApiError;
      set((state) => ({
        error: error.response?.data?.message || error.message || "Failed to restore garage",
        loading: false,
        actionLoading: { ...state.actionLoading, [id]: false },
      }));
    }
  },

  /* ============================ */
  verifyGarage: async (id, data) => {
    try {
      set({
        loading: true,
        error: null,
        actionLoading: { ...get().actionLoading, [id]: true },
      });

      const response = await garageService.verify(id, data);

      if (response.success) {
        // Update the garage in all relevant lists
        set((state) => {
          const updateGarage = (g: PopulatedGarage) => {
            if (g._id === id) {
              return {
                ...g,
                isVerified: response.data.garage.isVerified,
                isActive: response.data.garage.isActive,
                status: response.data.garage.status,
                verifiedAt: response.data.garage.verifiedAt,
              };
            }
            return g;
          };

          return {
            garages: state.garages.map(updateGarage),
            garage: state.garage?._id === id ? updateGarage(state.garage) : state.garage,
            unverifiedGarages: state.unverifiedGarages.filter((g) => g._id !== id),
            loading: false,
            actionLoading: { ...state.actionLoading, [id]: false },
          };
        });
      } else {
        set((state) => ({
          loading: false,
          actionLoading: { ...state.actionLoading, [id]: false },
        }));
      }
    } catch (err) {
      const error = err as ApiError;
      set((state) => ({
        error: error.response?.data?.message || error.message || "Failed to verify garage",
        loading: false,
        actionLoading: { ...state.actionLoading, [id]: false },
      }));
    }
  },

  /* ============================ */
  toggleActiveGarage: async (id) => {
    try {
      set({
        loading: true,
        error: null,
        actionLoading: { ...get().actionLoading, [id]: true },
      });

      const response = await garageService.toggleActive(id);

      if (response.success) {
        set((state) => {
          const updateGarage = (g: PopulatedGarage) => {
            if (g._id === id) {
              return { ...g, isActive: response.data.isActive };
            }
            return g;
          };

          return {
            garages: state.garages.map(updateGarage),
            garage: state.garage?._id === id ? updateGarage(state.garage) : state.garage,
            loading: false,
            actionLoading: { ...state.actionLoading, [id]: false },
          };
        });
      } else {
        set((state) => ({
          loading: false,
          actionLoading: { ...state.actionLoading, [id]: false },
        }));
      }
    } catch (err) {
      const error = err as ApiError;
      set((state) => ({
        error: error.response?.data?.message || error.message || "Failed to toggle garage",
        loading: false,
        actionLoading: { ...state.actionLoading, [id]: false },
      }));
    }
  },

  /* ============================ */
  uploadFiles: async (garageId, data) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.uploadFiles(garageId, data);

      if (response.success) {
        // Update garage with new file URLs
        set((state) => {
          if (!state.garage || state.garage._id !== garageId) return { loading: false };

          const updatedGarage = { ...state.garage };
          if (response.data.images) {
            updatedGarage.images = [...(state.garage.images || []), ...response.data.images];
          }
          if (response.data.documents) {
            updatedGarage.documents = [...(state.garage.documents || []), ...response.data.documents];
          }

          return {
            garage: updatedGarage,
            garages: state.garages.map((g) => (g._id === garageId ? updatedGarage : g)),
            loading: false,
          };
        });

        return response.data;
      }

      set({ loading: false });
      return null;
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to upload files",
        loading: false,
      });
      throw err;
    }
  },

  /* ============================ */
  deleteFile: async (garageId, filename, type) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.deleteFile(garageId, filename, { type });

      if (response.success) {
        // Remove file from garage
        set((state) => {
          if (!state.garage || state.garage._id !== garageId) return { loading: false };

          const updatedGarage = { ...state.garage };
          if (type === "images") {
            updatedGarage.images = (state.garage.images || []).filter(
              (img) => !img.toString().includes(filename)
            );
          } else {
            updatedGarage.documents = (state.garage.documents || []).filter(
              (doc) => !doc.toString().includes(filename)
            );
          }

          return {
            garage: updatedGarage,
            garages: state.garages.map((g) => (g._id === garageId ? updatedGarage : g)),
            loading: false,
          };
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || error.message || "Failed to delete file",
        loading: false,
      });
      throw err;
    }
  },

  /* ============================ */
  clearError: () => set({ error: null }),

  resetGarage: () =>
    set({
      garage: null,
      error: null,
    }),

  resetGarageServices: () =>
    set({
      garageServices: [],
      servicesPagination: null,
      categorySummary: null,
    }),

  resetGarageReviews: () =>
    set({
      garageReviews: [],
      reviewsPagination: null,
      reviewsSummary: null,
    }),

  resetGarageBookings: () =>
    set({
      garageBookings: [],
      bookingsPagination: null,
      bookingsStats: null,
    }),
}));