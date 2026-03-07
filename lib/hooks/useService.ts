import {
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  CreateServicePayload,
  PopulatedService,
  ServiceAnalytics,
  ServiceBooking,
  ServiceFilters,
  UpdateServicePayload,
} from "../types/service.types";
import { useServiceStore } from "../store/service.store";

interface UseServiceOptions {
  autoFetch?: boolean;
  garageId?: string;
  filters?: ServiceFilters;
}

interface UseServiceReturn {
  // State
  services: PopulatedService[];
  currentService: PopulatedService | null;
  bookings: ServiceBooking[];
  analytics: ServiceAnalytics | null;
  categories: string[];
  filters: ServiceFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;

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
  ) => Promise<string[]>;
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
  refreshServices: () => Promise<void>;

  // Computed
  availableServices: PopulatedService[];
  unavailableServices: PopulatedService[];
  getServicesByCategory: (
    category: string
  ) => PopulatedService[];
  getServiceById: (
    serviceId: string
  ) => PopulatedService | undefined;
  totalRevenue: number;
  averagePrice: number;

  // Trash toggle
  showDeleted: boolean;
  toggleShowDeleted: () => void;
}

export const useService = (
  options: UseServiceOptions = {}
): UseServiceReturn => {
  const {
    autoFetch = true,
    garageId,
    filters: initialFilters,
  } = options;

  const store = useServiceStore();

  // Local state for showing deleted/trashed services
  const [showDeleted, setShowDeleted] =
    useState(false);
  const toggleShowDeleted = () =>
    setShowDeleted((prev) => !prev);

  // Computed services arrays (safely filter undefined)
  const safeServices = useMemo(
    () => store.services?.filter(Boolean) || [],
    [store.services]
  );

  const availableServices = useMemo(
    () =>
      safeServices.filter(
        (s) => !s.isDeleted && s.isAvailable
      ),
    [safeServices]
  );

  const unavailableServices = useMemo(
    () =>
      safeServices.filter(
        (s) => !s.isDeleted && !s.isAvailable
      ),
    [safeServices]
  );

  const getServicesByCategory = useCallback(
    (category: string) =>
      safeServices.filter(
        (s) =>
          s.category === category &&
          (!s.isDeleted || showDeleted)
      ),
    [safeServices, showDeleted]
  );

  const getServiceById = useCallback(
    (serviceId: string) =>
      safeServices.find(
        (s) => s._id === serviceId
      ),
    [safeServices]
  );

  const totalRevenue = useMemo(
    () => store.analytics?.totalRevenue || 0,
    [store.analytics]
  );

  const averagePrice = useMemo(() => {
    if (safeServices.length === 0) return 0;
    const total = safeServices.reduce(
      (sum, s) => sum + (s.price || 0),
      0
    );
    return total / safeServices.length;
  }, [safeServices]);

  // Auto-fetch services
  useEffect(() => {
    if (autoFetch) {
      if (garageId) {
        store.fetchServicesByGarage(
          garageId,
          initialFilters
        );
      } else {
        store.fetchServices(initialFilters);
      }
    }
  }, [
    autoFetch,
    garageId,
    initialFilters,
    store,
  ]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const refreshServices =
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    useCallback(async () => {
      store.invalidateCache();
      if (garageId) {
        await store.fetchServicesByGarage(
          garageId,
          store.filters
        );
      } else {
        await store.fetchServices(store.filters);
      }
    }, [garageId, store.filters]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(safeServices.map((s) => s.category))
    );
  }, [safeServices]);

  // Garage-specific helpers
  const garageActions = useMemo(
    () => ({
      getServicesByGarage: (id: string) =>
        safeServices.filter((s) =>
          typeof s.garage === "string"
            ? s.garage === id
            : s.garage?._id === id
        ),

      getGarageCategories: (id: string) => {
        const services = safeServices.filter(
          (s) =>
            typeof s.garage === "string"
              ? s.garage === id
              : s.garage?._id === id
        );
        const cats = Array.from(
          new Set(services.map((s) => s.category))
        );
        return cats.map((cat) => ({
          category: cat,
          count: services.filter(
            (s) => s.category === cat
          ).length,
          minPrice: Math.min(
            ...services
              .filter((s) => s.category === cat)
              .map((s) => s.price)
          ),
          maxPrice: Math.max(
            ...services
              .filter((s) => s.category === cat)
              .map((s) => s.price)
          ),
        }));
      },
    }),
    [safeServices]
  );

  return {
    // State
    services: safeServices,
    currentService: store.currentService,
    bookings: store.bookings,
    analytics: store.analytics,
    categories,
    filters: store.filters,
    pagination: store.pagination,
    loading: store.loading,
    error: store.error,

    // Actions
    createService: store.createService,
    fetchServices: store.fetchServices,
    fetchServiceById: store.fetchServiceById,
    updateService: store.updateService,
    toggleAvailability: store.toggleAvailability,
    deleteService: store.deleteService,
    restoreService: store.restoreService,
    hardDeleteService: store.hardDeleteService,
    fetchServiceBookings:
      store.fetchServiceBookings,
    fetchServiceAnalytics:
      store.fetchServiceAnalytics,
    fetchCategories: store.fetchCategories,
    fetchServicesByGarage:
      store.fetchServicesByGarage,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
    clearError: store.clearError,
    clearCurrentService:
      store.clearCurrentService,
    refreshServices,

    // Computed
    availableServices,
    unavailableServices,
    getServicesByCategory,
    getServiceById,
    totalRevenue,
    averagePrice,

    // Trash toggle
    showDeleted,
    toggleShowDeleted,

    // Garage helpers
    ...garageActions,
  };
};
