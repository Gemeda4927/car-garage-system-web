import { useGarageStore } from "../store/garage.store";
import type {
  PopulatedGarage,
  UserSummary,
} from "@/lib/types/garage.types";

export const useGarage = () => {
  const store = useGarageStore();

  /* ===================================================== */
  /* BASIC HELPERS */

  const getGarageById = (id: string): PopulatedGarage | null => {
    if (!id) return null;
    return store.garages?.find((g) => g._id === id) || null;
  };

  const hasGarage = (): boolean => {
    return !!store.garage;
  };

  const getGarageCount = (): number => {
    return store.garages?.length || 0;
  };

  /* ===================================================== */
  /* OWNER INFO */

  const getOwnerInfo = (): UserSummary | null => {
    if (!store.garage) return null;

    if (typeof store.garage.owner === "object") {
      return store.garage.owner;
    }

    return null;
  };

  const isGarageOwner = (userId?: string): boolean => {
    if (!store.garage || !userId) return false;

    if (typeof store.garage.owner === "string") {
      return store.garage.owner === userId;
    }

    return store.garage.owner?._id === userId;
  };

  /* ===================================================== */
  /* GARAGE DATA */

  const getGarageStats = () => {
    return store.garage?.stats || null;
  };

  const getAddress = () => {
    return store.garage?.address || null;
  };

  const getContactInfo = () => {
    return store.garage?.contactInfo || null;
  };

  const getBusinessHours = () => {
    return store.garage?.businessHours || null;
  };

  /* ===================================================== */
  /* VERIFICATION */

  const getVerificationInfo = () => {
    if (!store.garage) return null;

    return {
      isVerified: store.garage.isVerified,
      verifiedAt: store.garage.verifiedAt,
      verifiedBy: store.garage.verifiedBy,
      status: store.garage.status,
    };
  };

  /* ===================================================== */
  /* TIMESTAMPS */

  const getTimestamps = () => {
    if (!store.garage) return null;

    return {
      createdAt: store.garage.createdAt,
      updatedAt: store.garage.updatedAt,
      paidAt: store.garage.paidAt,
    };
  };

  /* ===================================================== */
  /* FILTER HELPERS */

  const getVerifiedGarages = (): PopulatedGarage[] => {
    return store.garages?.filter((g) => g.isVerified) || [];
  };

  const getUnverifiedGarages = (): PopulatedGarage[] => {
    return store.garages?.filter((g) => !g.isVerified) || [];
  };

  const getActiveGarages = (): PopulatedGarage[] => {
    return store.garages?.filter((g) => g.status === "active") || [];
  };

  const getDeletedGarages = (): PopulatedGarage[] => {
    return store.garages?.filter((g) => g.isDeleted) || [];
  };

  /* ===================================================== */
  /* DASHBOARD STATS */

  const getLocalStats = () => {
    const garagesList = store.garages || [];

    const activeGarages = garagesList.filter((g) => !g.isDeleted);
    const deletedGarages = garagesList.filter((g) => g.isDeleted);

    const verifiedGarages = activeGarages.filter((g) => g.isVerified);
    const unverifiedGarages = activeGarages.filter((g) => !g.isVerified);

    const recentGarages = [...activeGarages]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    return {
      totalGarages: garagesList.length,
      activeGarages: activeGarages.length,
      deletedGarages: deletedGarages.length,
      verifiedGarages: verifiedGarages.length,
      unverifiedGarages: unverifiedGarages.length,
      recentGarages,

      garagesWithAddress: activeGarages.filter(
        (g) => g.address && Object.keys(g.address).length > 0
      ).length,

      garagesWithContact: activeGarages.filter(
        (g) =>
          g.contactInfo &&
          Object.keys(g.contactInfo).length > 0
      ).length,

      garagesWithHours: activeGarages.filter(
        (g) =>
          g.businessHours &&
          Object.keys(g.businessHours).length > 0
      ).length,
    };
  };

  /* ===================================================== */
  /* RETURN API */

  return {
    /* ================= STATE ================= */

    garage: store.garage,
    garages: store.garages,
    loading: store.loading,
    error: store.error,
    pagination: store.pagination,
    priceRange: store.priceRange,

    /* ================= ACTIONS ================= */

    fetchGarages: store.fetchGarages,
    fetchGarage: store.fetchGarage,
    fetchMyGarage: store.fetchMyGarage,

    createGarage: store.createGarage,
    updateGarage: store.updateGarage,
    deleteGarage: store.deleteGarage,

    restoreGarage: store.restoreGarage,
    hardDeleteGarage: store.hardDeleteGarage,

    searchGarages: store.searchGarages,
    fetchDeletedGarages: store.fetchDeletedGarages,

    clearError: store.clearError,
    resetGarage: store.resetGarage,

    /* ================= HELPERS ================= */

    getGarageById,
    hasGarage,
    getGarageCount,

    getOwnerInfo,
    isGarageOwner,

    getGarageStats,
    getAddress,
    getContactInfo,
    getBusinessHours,

    getVerificationInfo,
    getTimestamps,

    getVerifiedGarages,
    getUnverifiedGarages,
    getActiveGarages,
    getDeletedGarages,

    getLocalStats,

    /* ================= ALIASES ================= */

    getMyGarage: store.fetchMyGarage,
    addGarage: store.createGarage,
    editGarage: store.updateGarage,
    removeGarage: store.deleteGarage,

    restore: store.restoreGarage,
    forceDelete: store.hardDeleteGarage,
    search: store.searchGarages,
  };
};