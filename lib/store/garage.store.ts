import { create } from "zustand";
import {
  Garage,
  Service,
} from "../types/garage.types";
import { garageApi } from "../api/garage.api";

interface GarageState {
  // State
  garages: Garage[];
  selectedGarage: Garage | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;

  // Actions
  fetchGarages: (params?: {
    city?: string;
    isVerified?: boolean;
    minRating?: number;
    page?: number;
    limit?: number;
  }) => Promise<void>;

  fetchGarageById: (id: string) => Promise<void>;
  clearSelectedGarage: () => void;

  // Getters
  getActiveServices: (
    garageId?: string
  ) => Service[];
  getGarageBookings: (
    garageId: string
  ) => unknown[];
  getGarageReviews: (
    garageId: string
  ) => unknown[];

  // Search
  searchNearbyGarages: (
    lat: number,
    lng: number,
    radius?: number
  ) => Promise<void>;
}

export const useGarageStore = create<GarageState>(
  (set, get) => ({
    // Initial state
    garages: [],
    selectedGarage: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,

    // Fetch all garages with filters
    fetchGarages: async (params = {}) => {
      set({ loading: true, error: null });

      try {
        const response =
          await garageApi.getGarages(params);

        set({
          garages: response.garages,
          totalPages: response.pages || 1,
          currentPage: response.page || 1,
          loading: false,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch garages";

        set({
          error: message,
          loading: false,
        });
      }
    },

    // Fetch single garage by ID
    fetchGarageById: async (id: string) => {
      set({ loading: true, error: null });

      try {
        const response =
          await garageApi.getGarageById(id);

        // Log for debugging
        console.log(
          "Store - Garage fetched:",
          response.garage
        );
        console.log(
          "Store - Services:",
          response.garage.services
        );

        set({
          selectedGarage: response.garage,
          loading: false,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch garage";

        set({
          error: message,
          loading: false,
        });
      }
    },

    // Clear selected garage
    clearSelectedGarage: () =>
      set({ selectedGarage: null }),

    // Get active services from selected garage or by ID
    getActiveServices: (garageId?: string) => {
      const { selectedGarage, garages } = get();

      let targetGarage = selectedGarage;

      if (garageId) {
        targetGarage =
          garages.find(
            (g) => g._id === garageId
          ) || null;
      }

      if (!targetGarage?.services) return [];

      return targetGarage.services.filter(
        (s) => s.isActive !== false
      );
    },

    // Get bookings from selected garage or by ID
    getGarageBookings: (garageId: string) => {
      const { selectedGarage, garages } = get();

      let targetGarage = selectedGarage;

      if (
        garageId &&
        (!selectedGarage ||
          selectedGarage._id !== garageId)
      ) {
        targetGarage =
          garages.find(
            (g) => g._id === garageId
          ) || null;
      }

      return targetGarage?.bookings || [];
    },

    // Get reviews from selected garage or by ID
    getGarageReviews: (garageId: string) => {
      const { selectedGarage, garages } = get();

      let targetGarage = selectedGarage;

      if (
        garageId &&
        (!selectedGarage ||
          selectedGarage._id !== garageId)
      ) {
        targetGarage =
          garages.find(
            (g) => g._id === garageId
          ) || null;
      }

      return targetGarage?.reviews || [];
    },

    // Search nearby garages
    searchNearbyGarages: async (
      lat: number,
      lng: number,
      radius: number = 10
    ) => {
      set({ loading: true, error: null });

      try {
        const response =
          await garageApi.searchGaragesByLocation(
            { lat, lng, radius }
          );

        set({
          garages: response.garages,
          loading: false,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to search garages";

        set({
          error: message,
          loading: false,
        });
      }
    },
  })
);
