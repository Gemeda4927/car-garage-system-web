import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CategorySummary,
  CreateServicePayload,
  PopulatedService,
  ServiceAnalytics,
  ServiceBooking,
  ServiceFilters,
} from "../types/service.types";
import { serviceApi } from "../api/service.api";

interface ServiceState {
  // State
  services: PopulatedService[];
  currentService: PopulatedService | null;
  bookings: ServiceBooking[];
  analytics: ServiceAnalytics | null;
  categories: CategorySummary[];
  filters: ServiceFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  createService: (
    payload: CreateServicePayload
  ) => Promise<PopulatedService>;
  fetchServices: (
    filters?: ServiceFilters
  ) => Promise<void>;
  fetchServiceById: (
    serviceId: string
  ) => Promise<PopulatedService>;
  updateService: (
    serviceId: string,
    payload: UpdateServicePayload
  ) => Promise<PopulatedService>;
  toggleAvailability: (
    serviceId: string
  ) => Promise<PopulatedService>;
  deleteService: (
    serviceId: string
  ) => Promise<void>;
  restoreService: (
    serviceId: string
  ) => Promise<PopulatedService>;
  hardDeleteService: (
    serviceId: string
  ) => Promise<void>;
  fetchServiceBookings: (
    serviceId: string,
    filters?: any
  ) => Promise<ServiceBooking[]>;
  fetchServiceAnalytics: (
    serviceId: string
  ) => Promise<ServiceAnalytics>;
  fetchCategories: (
    garageId?: string
  ) => Promise<CategorySummary[]>;
  fetchServicesByGarage: (
    garageId: string,
    filters?: Omit<ServiceFilters, "garageId">
  ) => Promise<void>;
  setFilters: (
    filters: Partial<ServiceFilters>
  ) => void;
  resetFilters: () => void;
  clearError: () => void;
  clearCurrentService: () => void;
  invalidateCache: () => void;
}

const DEFAULT_FILTERS: ServiceFilters = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useServiceStore =
  create<ServiceState>()(
    persist(
      (set, get) => ({
        // Initial state
        services: [],
        currentService: null,
        bookings: [],
        analytics: null,
        categories: [],
        filters: DEFAULT_FILTERS,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
        loading: false,
        error: null,
        lastFetched: null,

        // Check if cache is valid
        isCacheValid: () => {
          const { lastFetched } = get();
          if (!lastFetched) return false;
          return (
            Date.now() - lastFetched <
            CACHE_DURATION
          );
        },

        // Create service
        createService: async (
          payload: CreateServicePayload
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.createService(
                payload
              );
            const newService =
              response.data.service;

            set((state) => ({
              services: [
                newService,
                ...state.services,
              ],
              loading: false,
              lastFetched: Date.now(),
            }));

            return newService;
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Fetch all services
        fetchServices: async (
          filters?: ServiceFilters
        ) => {
          set({ loading: true, error: null });
          try {
            const currentFilters = {
              ...get().filters,
              ...filters,
            };
            const response =
              await serviceApi.getAllServices(
                currentFilters
              );

            set({
              services: response.data.services,
              pagination:
                response.data.pagination,
              filters: currentFilters,
              loading: false,
              lastFetched: Date.now(),
            });
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Fetch service by ID
        fetchServiceById: async (
          serviceId: string
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.getServiceById(
                serviceId
              );
            const service = response.data.service;

            set({
              currentService: service,
              loading: false,
            });

            return service;
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Update service
        updateService: async (
          serviceId: string,
          payload: UpdateServicePayload
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.updateService(
                serviceId,
                payload
              );
            const updatedService =
              response.data.service;

            set((state) => ({
              services: state.services.map((s) =>
                s._id === serviceId
                  ? updatedService
                  : s
              ),
              currentService: updatedService,
              loading: false,
              lastFetched: Date.now(),
            }));

            return updatedService;
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Toggle availability
        toggleAvailability: async (
          serviceId: string
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.toggleAvailability(
                serviceId
              );
            const updatedService =
              response.data.service;

            set((state) => ({
              services: state.services.map((s) =>
                s._id === serviceId
                  ? updatedService
                  : s
              ),
              currentService: updatedService,
              loading: false,
              lastFetched: Date.now(),
            }));

            return updatedService;
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Soft delete service
        deleteService: async (
          serviceId: string
        ) => {
          set({ loading: true, error: null });
          try {
            await serviceApi.softDeleteService(
              serviceId
            );

            set((state) => ({
              services: state.services.filter(
                (s) => s._id !== serviceId
              ),
              currentService: null,
              loading: false,
              lastFetched: Date.now(),
            }));
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Restore service
        restoreService: async (
          serviceId: string
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.restoreService(
                serviceId
              );
            const restoredService =
              response.data.service;

            set((state) => ({
              services: [
                restoredService,
                ...state.services,
              ],
              loading: false,
              lastFetched: Date.now(),
            }));

            return restoredService;
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Hard delete service
        hardDeleteService: async (
          serviceId: string
        ) => {
          set({ loading: true, error: null });
          try {
            await serviceApi.hardDeleteService(
              serviceId
            );

            set((state) => ({
              services: state.services.filter(
                (s) => s._id !== serviceId
              ),
              currentService: null,
              loading: false,
              lastFetched: Date.now(),
            }));
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Fetch service bookings
        fetchServiceBookings: async (
          serviceId: string,
          filters?: any
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.getServiceBookings(
                serviceId,
                filters
              );

            set({
              bookings: response.data.bookings,
              loading: false,
            });

            return response.data.bookings;
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Fetch service analytics
        fetchServiceAnalytics: async (
          serviceId: string
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.getServiceAnalytics(
                serviceId
              );

            set({
              analytics: response.data,
              loading: false,
            });

            return response.data;
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Fetch categories
        fetchCategories: async (
          garageId?: string
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.getCategories(
                garageId
              );

            set({
              categories:
                response.data.categories,
              loading: false,
            });

            return response.data.categories;
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Fetch services by garage
        fetchServicesByGarage: async (
          garageId: string,
          filters?: Omit<
            ServiceFilters,
            "garageId"
          >
        ) => {
          set({ loading: true, error: null });
          try {
            const response =
              await serviceApi.getServicesByGarage(
                garageId,
                filters
              );

            set({
              services: response.data.services,
              pagination:
                response.data.pagination,
              filters: {
                ...get().filters,
                ...filters,
                garageId,
              },
              loading: false,
              lastFetched: Date.now(),
            });
          } catch (error: any) {
            set({
              error: error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Set filters
        setFilters: (
          filters: Partial<ServiceFilters>
        ) => {
          set((state) => ({
            filters: {
              ...state.filters,
              ...filters,
            },
          }));
          // Auto-fetch with new filters
          get().fetchServices();
        },

        // Reset filters
        resetFilters: () => {
          set({ filters: DEFAULT_FILTERS });
          get().fetchServices();
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Clear current service
        clearCurrentService: () =>
          set({ currentService: null }),

        // Invalidate cache
        invalidateCache: () =>
          set({ lastFetched: null }),
      }),
      {
        name: "service-storage",
        partialize: (state) => ({
          // Only persist these fields
          filters: state.filters,
          categories: state.categories,
        }),
      }
    )
  );
