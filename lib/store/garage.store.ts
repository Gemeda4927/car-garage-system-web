import { create } from "zustand";
import { Garage } from "../types/garage.types";
import { garageApi } from "../api/garage.api";

interface GarageState {
  garages: Garage[];
  selectedGarage: Garage | null;
  loading: boolean;
  error: string | null;

  fetchGarages: () => Promise<void>;
  fetchGarageById: (id: string) => Promise<void>;
  clearSelectedGarage: () => void;
}

export const useGarageStore = create<GarageState>(
  (set) => ({
    garages: [],
    selectedGarage: null,
    loading: false,
    error: null,

    fetchGarages: async () => {
      set({ loading: true, error: null });

      try {
        const response =
          await garageApi.getGarages();
        set({
          garages: response.garages,
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

    fetchGarageById: async (id: string) => {
      set({ loading: true, error: null });

      try {
        const response =
          await garageApi.getGarageById(id);
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

    clearSelectedGarage: () =>
      set({ selectedGarage: null }),
  })
);
