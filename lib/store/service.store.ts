// store/service.store.ts
import { create } from "zustand";
import { serviceApi } from "@/lib/api/service.api";
import { CategoryStat, CreateServiceData, Pagination, Service, ServiceFilters, UpdateServiceData } from "../types/service.types";

interface ServiceState {
  // State
  services: Service[];
  categoryStats: CategoryStat[];
  pagination: Pagination | null;
  selectedService: Service | null;
  isLoading: boolean;
  error: string | null;
  filters: ServiceFilters;

  // Actions
  fetchServices: (filters?: ServiceFilters) => Promise<void>;
  fetchServiceById: (id: string) => Promise<void>;
  createService: (data: CreateServiceData) => Promise<void>;
  updateService: (id: string, data: UpdateServiceData) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  clearSelectedService: () => void;
  setFilters: (filters: ServiceFilters) => void;
  resetFilters: () => void;
  clearError: () => void;
}

const initialFilters: ServiceFilters = {
  page: 1,
  limit: 20,
};

export const useServiceStore = create<ServiceState>((set, get) => ({
  // Initial state
  services: [],
  categoryStats: [],
  pagination: null,
  selectedService: null,
  isLoading: false,
  error: null,
  filters: initialFilters,

  // Fetch all services with filters
  fetchServices: async (filters?: ServiceFilters) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentFilters = { ...get().filters, ...filters };
      const response = await serviceApi.getAllServices(currentFilters);
      
      if (response.success) {
        set({
          services: response.data.services,
          categoryStats: response.data.categoryStats,
          pagination: response.data.pagination,
          filters: currentFilters,
          isLoading: false,
        });
      } else {
        set({ error: "Failed to fetch services", isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to fetch services", isLoading: false });
    }
  },

  // Fetch single service by ID
  fetchServiceById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceApi.getServiceById(id);
      
      if (response.success) {
        set({ selectedService: response.data.service, isLoading: false });
      } else {
        set({ error: "Failed to fetch service", isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to fetch service", isLoading: false });
    }
  },

  // Create new service
  createService: async (data: CreateServiceData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceApi.createService(data);
      
      if (response.success) {
        // Refresh the services list
        await get().fetchServices();
        set({ isLoading: false });
      } else {
        set({ error: "Failed to create service", isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to create service", isLoading: false });
    }
  },

  // Update service
  updateService: async (id: string, data: UpdateServiceData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceApi.updateService(id, data);
      
      if (response.success) {
        // Update in the services list
        const services = get().services.map(s => 
          s._id === id ? response.data.service : s
        );
        set({ 
          services, 
          selectedService: response.data.service,
          isLoading: false 
        });
      } else {
        set({ error: "Failed to update service", isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to update service", isLoading: false });
    }
  },

  // Delete service
  deleteService: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceApi.deleteService(id);
      
      if (response.success) {
        // Remove from list
        set({ 
          services: get().services.filter(s => s._id !== id), 
          isLoading: false 
        });
        // Refresh to get updated stats
        await get().fetchServices();
      } else {
        set({ error: "Failed to delete service", isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to delete service", isLoading: false });
    }
  },

  // Toggle availability
  toggleAvailability: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceApi.toggleServiceAvailability(id);
      
      if (response.success) {
        // Update in the list
        const services = get().services.map(s => 
          s._id === id ? response.data.service : s
        );
        set({ services, isLoading: false });
      } else {
        set({ error: "Failed to toggle availability", isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to toggle availability", isLoading: false });
    }
  },

  // Clear selected service
  clearSelectedService: () => set({ selectedService: null }),

  // Set filters
  setFilters: (filters: ServiceFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  // Reset filters
  resetFilters: () => set({ filters: initialFilters }),

  // Clear error
  clearError: () => set({ error: null }),
}));