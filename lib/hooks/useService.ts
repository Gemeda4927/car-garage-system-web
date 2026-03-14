import { useEffect } from "react";
import { useServiceStore } from "../store/service.store";
import { ServiceFilters } from "../types/service.types";

export const useService = (options?: { autoFetch?: boolean; filters?: ServiceFilters }) => {
  const {
    services,
    categoryStats,
    pagination,
    selectedService,
    isLoading,
    error,
    filters,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    toggleAvailability,
    restoreService,
    hardDeleteService,
    clearSelectedService,
    setFilters,
    resetFilters,
    clearError,
  } = useServiceStore();

  // Auto fetch on mount if enabled
  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchServices(options?.filters);
    }
  }, []);

  // Get services by category
  const getServicesByCategory = (category: string) => {
    return services.filter(s => s.category === category);
  };

  // Get available services
  const getAvailableServices = () => {
    return services.filter(s => s.isAvailable === true);
  };

  // Get unavailable services
  const getUnavailableServices = () => {
    return services.filter(s => s.isAvailable === false);
  };

  // Search services
  const searchServices = (query: string) => {
    return services.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Get price range
  const getPriceRange = () => {
    if (services.length === 0) return { min: 0, max: 0 };
    const prices = services.map(s => s.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  };

  // Get unique categories
  const getUniqueCategories = () => {
    return [...new Set(services.map(s => s.category))];
  };

  // Get service by ID from local state
  const getServiceById = (id: string) => {
    return services.find(s => s._id === id) || null;
  };

  // Refresh services with current filters
  const refreshServices = () => {
    return fetchServices(filters);
  };

  // Get services by price range
  const getServicesByPriceRange = (min: number, max: number) => {
    return services.filter(s => s.price >= min && s.price <= max);
  };

  // Get services by duration
  const getServicesByDuration = (maxDuration: number) => {
    return services.filter(s => s.duration <= maxDuration);
  };

  // Get service stats
  const getServiceStats = () => {
    const total = services.length;
    const available = services.filter(s => s.isAvailable).length;
    const unavailable = services.filter(s => !s.isAvailable).length;
    const categories = getUniqueCategories().length;
    const avgPrice = total > 0 
      ? services.reduce((sum, s) => sum + s.price, 0) / total 
      : 0;
    const minPrice = total > 0 ? Math.min(...services.map(s => s.price)) : 0;
    const maxPrice = total > 0 ? Math.max(...services.map(s => s.price)) : 0;

    return {
      total,
      available,
      unavailable,
      categories,
      avgPrice,
      minPrice,
      maxPrice,
    };
  };

  return {
    // Data
    services,
    categoryStats,
    pagination,
    selectedService,
    isLoading,
    error,
    filters,

    // CRUD Operations
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    toggleAvailability,
    restoreService,
    hardDeleteService,
    clearSelectedService,
    
    // Filter controls
    setFilters,
    resetFilters,
    clearError,
    
    // Helper methods
    getServicesByCategory,
    getAvailableServices,
    getUnavailableServices,
    searchServices,
    getPriceRange,
    getUniqueCategories,
    getServiceById,
    refreshServices,
    getServicesByPriceRange,
    getServicesByDuration,
    getServiceStats,
    
    // Convenience getters
    availableServices: getAvailableServices(),
    unavailableServices: getUnavailableServices(),
    totalServices: services.length,
    availableCount: getAvailableServices().length,
    unavailableCount: getUnavailableServices().length,
    uniqueCategories: getUniqueCategories(),
    priceRange: getPriceRange(),
    stats: getServiceStats(),
  };
};