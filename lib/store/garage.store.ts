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
  createGarage: (data: CreateGaragePayload) => Promise<PopulatedGarage | null>;
  updateGarage: (id: string, data: UpdateGaragePayload) => Promise<PopulatedGarage | null>;
  deleteGarage: (id: string) => Promise<void>;
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

  fetchGarages: async (params) => {
    try {
      set({ loading: true, error: null });
      console.log('Store: Fetching garages with params:', params);
      
      const response = await garageService.getAll(params);
      console.log('Store: Fetch garages response:', response);

      if (response.success && response.data) {
        set({
          garages: response.data.garages,
          pagination: response.data.pagination,
          priceRange: response.data.priceRange,
          loading: false,
        });
        console.log('Store: Garages fetched successfully:', response.data.garages.length);
      }
    } catch (err) {
      const error = err as ApiError;
      console.error('Store: Error fetching garages:', error);
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch garages",
        loading: false,
      });
    }
  },

  fetchGarage: async (id) => {
    try {
      set({ loading: true, error: null });
      console.log('Store: Fetching garage with ID:', id);
      
      const response = await garageService.getById(id);
      console.log('Store: Fetch garage response:', response);

      if (response.success && response.data) {
        set({
          garage: response.data.garage,
          loading: false,
        });
        console.log('Store: Garage fetched successfully:', response.data.garage.name);
      }
    } catch (err) {
      const error = err as ApiError;
      console.error('Store: Error fetching garage:', error);
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch garage",
        loading: false,
      });
    }
  },

  fetchMyGarage: async (userId) => {
    try {
      set({ loading: true, error: null });
      console.log('Store: Fetching garage for user:', userId);

      const response = await garageService.getAll();
      console.log('Store: Fetch all garages response:', response);

      if (response.success && response.data) {
        const myGarage = response.data.garages.find(
          (garage) => {
            if (typeof garage.owner === "object" && garage.owner !== null) {
              return garage.owner._id === userId;
            }
            return garage.owner === userId;
          }
        ) || null;

        console.log('Store: Found user garage:', myGarage ? myGarage.name : 'No garage found');

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
      console.error('Store: Error fetching user garage:', error);
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch your garage",
        loading: false,
      });
    }
  },

  createGarage: async (payload) => {
    try {
      set({ loading: true, error: null });
      console.log('Store: Creating garage with payload:', payload);
      
      const response = await garageService.create(payload);
      console.log('Store: Create garage response:', response);

      if (response.success && response.data) {
        const newGarage = response.data.garage;
        console.log('Store: Garage created successfully:', newGarage);
        
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
      console.error('Store: Error creating garage:', error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create garage";
      
      set({
        error: errorMessage,
        loading: false,
      });
      
      throw err;
    }
  },

  updateGarage: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      console.log('Store: Updating garage:', { id, payload });
      
      // Validate garage ID
      if (!id) {
        throw new Error('Garage ID is required for update');
      }
      
      // Get current garage to check for changes
      const currentGarage = get().garage;
      console.log('Store: Current garage:', currentGarage);
      
      // Filter out unchanged fields to minimize payload
      const changedFields: UpdateGaragePayload = {};
      
      if (currentGarage) {
        // Check each field for changes
        if (payload.name && payload.name !== currentGarage.name) {
          changedFields.name = payload.name;
        }
        if (payload.description && payload.description !== currentGarage.description) {
          changedFields.description = payload.description;
        }
        if (payload.coordinates && 
            JSON.stringify(payload.coordinates) !== JSON.stringify(currentGarage.coordinates.coordinates)) {
          changedFields.coordinates = payload.coordinates;
        }
        if (payload.address && 
            JSON.stringify(payload.address) !== JSON.stringify(currentGarage.address)) {
          changedFields.address = payload.address;
        }
        if (payload.contactInfo && 
            JSON.stringify(payload.contactInfo) !== JSON.stringify(currentGarage.contactInfo)) {
          changedFields.contactInfo = payload.contactInfo;
        }
        if (payload.businessHours && 
            JSON.stringify(payload.businessHours) !== JSON.stringify(currentGarage.businessHours)) {
          changedFields.businessHours = payload.businessHours;
        }
      } else {
        // If no current garage, send the whole payload
        Object.assign(changedFields, payload);
      }
      
      console.log('Store: Changed fields to update:', changedFields);
      
      // If no changes, return current garage
      if (Object.keys(changedFields).length === 0) {
        console.log('Store: No changes detected');
        set({ loading: false });
        return currentGarage;
      }
      
      const response = await garageService.update(id, changedFields);
      console.log('Store: Update garage response:', response);

      if (response.success && response.data) {
        const updatedGarage = response.data.garage;
        console.log('Store: Garage updated successfully:', updatedGarage);
        
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
      console.error('Store: Error updating garage:', error);
      
      // Log additional error details if available
      if (error.response?.status) {
        console.error('Store: Error status:', error.response.status);
        console.error('Store: Error data:', error.response.data);
      }
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to update garage";
      
      set({
        error: errorMessage,
        loading: false,
      });
      
      throw err;
    }
  },

  deleteGarage: async (id) => {
    try {
      set({ loading: true, error: null });
      console.log('Store: Deleting garage:', id);
      
      const response = await garageService.delete(id);
      console.log('Store: Delete garage response:', response);

      if (response.success) {
        console.log('Store: Garage deleted successfully');
        
        set((state) => ({
          garage: null,
          garages: state.garages.filter((g) => g._id !== id),
          loading: false,
        }));
      }
    } catch (err) {
      const error = err as ApiError;
      console.error('Store: Error deleting garage:', error);
      
      set({
        error: error.response?.data?.message || error.message || "Failed to delete garage",
        loading: false,
      });
      
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  
  resetGarage: () => {
    console.log('Store: Resetting garage state');
    set({ 
      garage: null, 
      error: null 
    });
  },
}));