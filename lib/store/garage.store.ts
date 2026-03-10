import { create } from "zustand";
import { garageService } from "../api/garage.api";
import {
  CreateGaragePayload,
  UpdateGaragePayload,
  PopulatedGarage,
} from "../types/garage.types";

/* ============================ */
/* Error type */
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

/* ============================ */
/* Store type */
interface GarageState {
  garage: PopulatedGarage | null;
  garages: PopulatedGarage[];
  loading: boolean;
  error: string | null;

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

  fetchGarages: (params?: Record<string, unknown>) => Promise<void>;
  fetchGarage: (id: string) => Promise<void>;
  fetchMyGarage: (userId?: string) => Promise<void>;

  createGarage: (
    data: CreateGaragePayload
  ) => Promise<PopulatedGarage | null>;

  updateGarage: (
    id: string,
    data: UpdateGaragePayload
  ) => Promise<PopulatedGarage | null>;

  deleteGarage: (id: string) => Promise<void>;

  /* NEW METHODS */
  restoreGarage: (id: string) => Promise<void>;
  hardDeleteGarage: (id: string) => Promise<void>;
  searchGarages: (query: string) => Promise<void>;
  fetchDeletedGarages: () => Promise<void>;

  clearError: () => void;
  resetGarage: () => void;
}

/* ============================ */
/* Store */
export const useGarageStore = create<GarageState>((set, get) => ({
  garage: null,
  garages: [],
  loading: false,
  error: null,
  pagination: null,
  priceRange: null,

  /* ============================ */
  /* Fetch All Garages */
  fetchGarages: async (params) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getAll(params);

      if (response.success && response.data) {
        set({
          garages: response.data.garages,
          pagination: response.data.pagination,
          priceRange: response.data.priceRange,
          loading: false,
        });
      }
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch garages",
        loading: false,
      });
    }
  },

  /* ============================ */
  /* Fetch Single Garage */
  fetchGarage: async (id) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getById(id);

      if (response.success && response.data) {
        set({
          garage: response.data.garage,
          loading: false,
        });
      }
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch garage",
        loading: false,
      });
    }
  },

  /* ============================ */
  /* Fetch User Garage */
  fetchMyGarage: async (userId) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getAll();

      if (response.success && response.data) {
        const myGarage =
          response.data.garages.find((garage) => {
            if (typeof garage.owner === "object") {
              return garage.owner._id === userId;
            }
            return garage.owner === userId;
          }) || null;

        set({
          garage: myGarage,
          garages: response.data.garages,
          pagination: response.data.pagination,
          priceRange: response.data.priceRange,
          loading: false,
        });
      }
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch your garage",
        loading: false,
      });
    }
  },

  /* ============================ */
  /* Create Garage */
  createGarage: async (payload) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.create(payload);

      if (response.success && response.data) {
        const newGarage = response.data.garage;

        set((state) => ({
          garage: newGarage,
          garages: [...state.garages, newGarage],
          loading: false,
        }));

        return newGarage;
      }

      return null;
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create garage",
        loading: false,
      });

      throw err;
    }
  },

  /* ============================ */
  /* Update Garage */
  updateGarage: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.update(id, payload);

      if (response.success && response.data) {
        const updatedGarage = response.data.garage;

        set((state) => ({
          garage: updatedGarage,
          garages: state.garages.map((g) =>
            g._id === id ? updatedGarage : g
          ),
          loading: false,
        }));

        return updatedGarage;
      }

      return null;
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update garage",
        loading: false,
      });

      throw err;
    }
  },

  /* ============================ */
  /* Soft Delete */
  deleteGarage: async (id) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.delete(id);

      if (response.success) {
        set((state) => ({
          garage: null,
          garages: state.garages.filter((g) => g._id !== id),
          loading: false,
        }));
      }
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete garage",
        loading: false,
      });

      throw err;
    }
  },

  /* ============================ */
  /* Restore Deleted Garage */
  restoreGarage: async (id) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.restore(id);

      if (response.success && response.data) {
        const restoredGarage = response.data.garage;

        set((state) => ({
          garages: [...state.garages, restoredGarage],
          loading: false,
        }));
      }
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to restore garage",
        loading: false,
      });
    }
  },

  /* ============================ */
  /* Hard Delete */
  hardDeleteGarage: async (id) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.hardDelete(id);

      if (response.success) {
        set((state) => ({
          garages: state.garages.filter((g) => g._id !== id),
          loading: false,
        }));
      }
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to permanently delete garage",
        loading: false,
      });
    }
  },

  /* ============================ */
  /* Search Garages */
  searchGarages: async (query) => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.search(query);

      if (response.success && response.data) {
        set({
          garages: response.data.garages,
          pagination: response.data.pagination,
          priceRange: response.data.priceRange,
          loading: false,
        });
      }
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Search failed",
        loading: false,
      });
    }
  },

  /* ============================ */
  /* Fetch Deleted Garages */
  fetchDeletedGarages: async () => {
    try {
      set({ loading: true, error: null });

      const response = await garageService.getDeleted();

      if (response.success && response.data) {
        set({
          garages: response.data.garages,
          pagination: response.data.pagination,
          priceRange: response.data.priceRange,
          loading: false,
        });
      }
    } catch (err) {
      const error = err as ApiError;

      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch deleted garages",
        loading: false,
      });
    }
  },

  /* ============================ */
  clearError: () => set({ error: null }),

  resetGarage: () =>
    set({
      garage: null,
      error: null,
    }),
}));