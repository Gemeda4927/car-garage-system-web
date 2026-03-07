import { useGarageStore } from "../store/garage.store";
import type {
  PopulatedGarage,
  UserSummary,
} from "@/lib/types/garage.types";

export const useGarage = () => {
  const store = useGarageStore();

  // Helper functions
  const getGarageById = (
    id: string
  ): PopulatedGarage | null => {
    return (
      store.garages.find((g) => g._id === id) ||
      null
    );
  };

  const getGarageStats = () => {
    if (!store.garage) return null;
    return store.garage.stats;
  };

  const getOwnerInfo = (): UserSummary | null => {
    if (
      !store.garage ||
      typeof store.garage.owner !== "object"
    )
      return null;
    return store.garage.owner;
  };

  const getVerificationInfo = () => {
    if (!store.garage) return null;
    return {
      isVerified: store.garage.isVerified,
      verifiedAt: store.garage.verifiedAt,
      verifiedBy: store.garage.verifiedBy,
      status: store.garage.status,
    };
  };

  const getTimestamps = () => {
    if (!store.garage) return null;
    return {
      createdAt: store.garage.createdAt,
      updatedAt: store.garage.updatedAt,
      paidAt: store.garage.paidAt,
    };
  };

  const getAddress = () => {
    if (!store.garage) return null;
    return store.garage.address;
  };

  const getContactInfo = () => {
    if (!store.garage) return null;
    return store.garage.contactInfo;
  };

  const getBusinessHours = () => {
    if (!store.garage) return null;
    return store.garage.businessHours;
  };

  const hasGarage = (): boolean => {
    return !!store.garage;
  };

  const isGarageOwner = (
    userId?: string
  ): boolean => {
    if (!store.garage || !userId) return false;
    if (typeof store.garage.owner === "string") {
      return store.garage.owner === userId;
    }
    return store.garage.owner._id === userId;
  };

  return {
    // State
    garage: store.garage,
    garages: store.garages,
    loading: store.loading,
    error: store.error,
    pagination: store.pagination,
    priceRange: store.priceRange,

    // Core actions
    fetchGarages: store.fetchGarages,
    fetchGarage: store.fetchGarage,
    fetchMyGarage: store.fetchMyGarage,
    createGarage: store.createGarage,
    updateGarage: store.updateGarage,
    deleteGarage: store.deleteGarage,
    clearError: store.clearError,
    resetGarage: store.resetGarage,

    // Helper functions
    getGarageById,
    getGarageStats,
    getOwnerInfo,
    getVerificationInfo,
    getTimestamps,
    getAddress,
    getContactInfo,
    getBusinessHours,
    hasGarage,
    isGarageOwner,

    // Aliases for convenience
    getMyGarage: store.fetchMyGarage,
    addGarage: store.createGarage,
    editGarage: store.updateGarage,
    removeGarage: store.deleteGarage,
  };
};
