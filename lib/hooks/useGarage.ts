import { useCallback } from "react";
import { useGarageStore } from "../store/garage.store";
import type {
  PopulatedGarage,
  UserSummary,
  GarageService,
  ServiceBooking,
  GarageReview,
  GarageAnalyticsData,
  DeletedGaragesStats,
  UnverifiedGaragesStats,
  CategorySummary,
  ReviewsSummary,
  BookingsStats,
  VerifyGaragePayload,
  UploadFilesPayload,
} from "@/lib/types/garage.types";
import type { CompleteGaragesData } from "../api/garage.api";

export const useGarage = () => {
  const store = useGarageStore();

  /* ============================ */
  /* COMPLETE DATA HELPERS - NEW
  /* ============================ */

  const getCompleteData =
    (): CompleteGaragesData | null =>
      store.completeData;

  const getCompleteStats = () =>
    store.completeData?.stats;

  const getCollections = () =>
    store.completeData?.collections;

  const getAllServices = () =>
    store.completeData?.collections.services ||
    [];

  const getAllBookings = () =>
    store.completeData?.collections.bookings ||
    [];

  const getAllReviews = () =>
    store.completeData?.collections.reviews || [];

  const getAllPayments = () =>
    store.completeData?.collections.payments ||
    [];

  const getAllOwners = () =>
    store.completeData?.collections.owners || [];

  const getPricingInfo = () =>
    store.completeData?.pricing;

  const getGlobalPriceRange = () =>
    store.completeData?.pricing.global;

  const getGaragePricing = (garageId: string) =>
    store.completeData?.pricing.byGarage.find(
      (g) => g.garageId === garageId
    );

  const getGroups = () =>
    store.completeData?.groups;

  const getGaragesByCity = (city: string) =>
    store.completeData?.groups.byCity[city];

  const getVerifiedGaragesList = () =>
    store.completeData?.groups
      .byVerificationStatus.verified || [];

  const getUnverifiedGaragesList = () =>
    store.completeData?.groups
      .byVerificationStatus.unverified || [];

  const getDeletedGaragesList = () =>
    store.completeData?.groups.byDeletionStatus
      .deleted || [];

  const getActiveGaragesIds = () =>
    store.completeData?.groups.byDeletionStatus
      .active || [];

  const getGaragesByStatus = (status: string) =>
    store.completeData?.groups.byStatus[status] ||
    [];

  const getTimelineData = () =>
    store.completeData?.timeline;

  const getCreatedByMonth = () =>
    store.completeData?.timeline.createdByMonth ||
    {};

  const getVerifiedByMonth = () =>
    store.completeData?.timeline
      .verifiedByMonth || {};

  const getMetadata = () =>
    store.completeData?.metadata;

  const getDatabaseStats = () =>
    store.completeData?.metadata.databaseStats;

  /* ============================ */
  /* BASIC HELPERS
  /* ============================ */

  const getGarageById = (
    id: string
  ): PopulatedGarage | null =>
    store.garages?.find((g) => g._id === id) ||
    null;

  const hasGarage = (): boolean => !!store.garage;

  const getGarageCount = (): number =>
    store.garages?.length || 0;

  /* ============================ */
  /* OWNER
  /* ============================ */

  const getOwnerInfo = (): UserSummary | null => {
    const owner = store.garage?.owner;
    return typeof owner === "object"
      ? owner
      : null;
  };

  const isGarageOwner = (
    userId?: string
  ): boolean => {
    if (!store.garage || !userId) return false;

    const owner = store.garage.owner;

    return typeof owner === "string"
      ? owner === userId
      : owner?._id === userId;
  };

  /* ============================ */
  /* SERVICES
  /* ============================ */

  const getServices = (): GarageService[] =>
    store.garage?.services ?? [];

  const getServiceById = (
    serviceId: string
  ): GarageService | null =>
    store.garage?.services?.find(
      (s) => s._id === serviceId
    ) || null;

  /* ============================ */
  /* BOOKINGS
  /* ============================ */

  const getBookings = (): ServiceBooking[] =>
    (store.garage?.services || []).flatMap(
      (s) => s.bookings || []
    );

  const getPendingBookings =
    (): ServiceBooking[] =>
      getBookings().filter(
        (b) => b.status === "pending"
      );

  const getCompletedBookings =
    (): ServiceBooking[] =>
      getBookings().filter(
        (b) => b.status === "completed"
      );

  const getUpcomingBookings =
    (): ServiceBooking[] =>
      getBookings().filter(
        (b) =>
          b.status === "approved" &&
          new Date(b.bookingDate) > new Date()
      );

  const getTodaysBookings =
    (): ServiceBooking[] => {
      const today = new Date()
        .toISOString()
        .split("T")[0];
      return getBookings().filter(
        (b) =>
          b.bookingDate.startsWith(today) &&
          ["pending", "approved"].includes(
            b.status
          )
      );
    };

  /* ============================ */
  /* REVIEWS
  /* ============================ */

  const getReviews = (): GarageReview[] =>
    store.garage?.reviews || [];

  const getAverageRating = (): number => {
    const reviews = getReviews();
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    return parseFloat(
      (sum / reviews.length).toFixed(1)
    );
  };

  /* ============================ */
  /* LOCAL STATS (Using complete data when available)
  /* ============================ */

  const getLocalStats = useCallback(() => {
    // If complete data is available, use that for more accurate stats
    if (store.completeData) {
      const stats = store.completeData.stats;
      const collections =
        store.completeData.collections;

      return {
        totalGarages: stats.totalGarages,
        activeGarages: stats.totalActive,
        deletedGarages: stats.totalDeleted,
        verifiedGarages: stats.totalVerified,
        pendingGarages: stats.totalPending,
        suspendedGarages: stats.totalSuspended,
        totalBookings: stats.bookings.total,
        totalRevenue: stats.bookings.totalRevenue,
        avgRating: stats.reviews.averageRating,
        recentGarages:
          store.completeData.garages.slice(0, 5),
        // Additional stats from complete data
        totalServices: stats.services.total,
        totalReviews: stats.reviews.total,
        totalPayments: stats.payments.total,
        totalOwners: stats.owners.total,
        totalImages: stats.files.totalImages,
        totalDocuments:
          stats.files.totalDocuments,
        servicePriceRange:
          stats.services.priceRange,
        bookingStats: stats.bookings,
        reviewStats: stats.reviews,
        paymentStats: stats.payments,
      };
    }

    // Fallback to local calculation if complete data not available
    const garages = store.garages || [];
    const deletedGarages =
      store.garages?.filter((g) => g.isDeleted) ||
      [];

    const totalGarages = garages.length;
    const activeGarages = garages.filter(
      (g) => g.isActive && !g.isDeleted
    ).length;
    const deletedGaragesCount =
      deletedGarages.length;
    const verifiedGarages = garages.filter(
      (g) => g.isVerified && !g.isDeleted
    ).length;
    const pendingGarages = garages.filter(
      (g) => !g.isVerified && !g.isDeleted
    ).length;
    const suspendedGarages = garages.filter(
      (g) =>
        g.status === "suspended" && !g.isDeleted
    ).length;

    // Calculate total bookings across all garages
    const totalBookings = garages.reduce(
      (sum, garage) =>
        sum + (garage.stats?.totalBookings || 0),
      0
    );

    // Calculate total revenue across all garages
    const totalRevenue = garages.reduce(
      (sum, garage) => {
        // This would need proper calculation from bookings
        return sum;
      },
      0
    );

    // Calculate average rating across all garages
    const avgRating =
      garages.reduce(
        (sum, garage) =>
          sum +
          (garage.stats?.averageRating || 0),
        0
      ) / (garages.length || 1) || 0;

    return {
      totalGarages,
      activeGarages,
      deletedGarages: deletedGaragesCount,
      verifiedGarages,
      pendingGarages,
      suspendedGarages,
      totalBookings,
      totalRevenue,
      avgRating: parseFloat(avgRating.toFixed(1)),
      recentGarages: garages.slice(0, 5),
    };
  }, [store.garages, store.completeData]);

  /* ============================ */
  /* FILTERS (Enhanced with complete data)
  /* ============================ */

  const getVerifiedGarages =
    (): PopulatedGarage[] =>
      store.garages?.filter(
        (g) => g.isVerified
      ) || [];

  const getActiveGarages =
    (): PopulatedGarage[] =>
      store.garages?.filter((g) => g.isActive) ||
      [];

  const getDeletedGarages =
    (): PopulatedGarage[] =>
      store.garages?.filter((g) => g.isDeleted) ||
      [];

  const getPendingVerificationGarages =
    (): PopulatedGarage[] =>
      store.garages?.filter(
        (g) => !g.isVerified && !g.isDeleted
      ) || [];

  const getSuspendedGarages =
    (): PopulatedGarage[] =>
      store.garages?.filter(
        (g) =>
          g.status === "suspended" && !g.isDeleted
      ) || [];

  /* ============================ */
  /* ADVANCED QUERIES (Using complete data)
  /* ============================ */

  const findGarageByServicePrice = (
    minPrice?: number,
    maxPrice?: number
  ) => {
    if (!store.completeData) return [];

    return store.completeData.pricing.byGarage.filter(
      (garage) =>
        garage.services.some(
          (service) =>
            (!minPrice ||
              service.price >= minPrice) &&
            (!maxPrice ||
              service.price <= maxPrice)
        )
    );
  };

  const getTopRatedGarages = (
    limit: number = 10
  ) => {
    if (!store.completeData) return [];

    return [...store.completeData.garages]
      .sort(
        (a, b) =>
          (b.stats?.averageRating || 0) -
          (a.stats?.averageRating || 0)
      )
      .slice(0, limit);
  };

  const getMostBookedGarages = (
    limit: number = 10
  ) => {
    if (!store.completeData) return [];

    return [...store.completeData.garages]
      .sort(
        (a, b) =>
          (b.stats?.totalBookings || 0) -
          (a.stats?.totalBookings || 0)
      )
      .slice(0, limit);
  };

  const getGaragesByCategory = (
    category: string
  ) => {
    if (!store.completeData) return [];

    return store.completeData.garages.filter(
      (garage) =>
        garage.services?.some(
          (service) =>
            service.category === category
        )
    );
  };

  const getServicesByCategory = (
    category: string
  ) => {
    if (!store.completeData) return [];

    return store.completeData.collections.services.filter(
      (service) => service.category === category
    );
  };

  const getBookingsByDateRange = (
    startDate: Date,
    endDate: Date
  ) => {
    if (!store.completeData) return [];

    return store.completeData.collections.bookings.filter(
      (booking) => {
        const bookingDate = new Date(
          booking.bookingDate
        );
        return (
          bookingDate >= startDate &&
          bookingDate <= endDate
        );
      }
    );
  };

  const getReviewsByRating = (rating: number) => {
    if (!store.completeData) return [];

    return store.completeData.collections.reviews.filter(
      (review) => review.rating === rating
    );
  };

  const getPaymentStatsByMethod = (
    method: string
  ) => {
    if (!store.completeData) return 0;

    return (
      store.completeData.stats.payments.byMethod[
        method
      ] || 0
    );
  };

  const getRevenueByPeriod = (
    period: "day" | "week" | "month" | "year"
  ) => {
    if (!store.completeData) return 0;

    // This would need more sophisticated calculation based on timeline data
    return store.completeData.stats.bookings
      .totalRevenue;
  };

  /* ============================ */
  /* RETURN
  /* ============================ */

  return {
    // State
    garage: store.garage,
    garages: store.garages,
    nearbyGarages: store.nearbyGarages,
    deletedGarages: store.deletedGarages,
    unverifiedGarages: store.unverifiedGarages,
    garageServices: store.garageServices,
    garageReviews: store.garageReviews,
    garageBookings: store.garageBookings,
    garageAnalytics: store.garageAnalytics,

    // NEW: Complete data state
    completeData: store.completeData,

    loading: store.loading,
    error: store.error,
    actionLoading: store.actionLoading,

    pagination: store.pagination,
    priceRange: store.priceRange,
    deletedGaragesStats:
      store.deletedGaragesStats,
    unverifiedGaragesStats:
      store.unverifiedGaragesStats,
    servicesPagination: store.servicesPagination,
    reviewsPagination: store.reviewsPagination,
    bookingsPagination: store.bookingsPagination,

    // Actions
    fetchGarages: store.fetchGarages,
    fetchGarage: store.fetchGarage,
    fetchNearbyGarages: store.fetchNearbyGarages,
    fetchDeletedGarages:
      store.fetchDeletedGarages,
    fetchUnverifiedGarages:
      store.fetchUnverifiedGarages,
    fetchGarageServices:
      store.fetchGarageServices,
    fetchGarageReviews: store.fetchGarageReviews,
    fetchGarageBookings:
      store.fetchGarageBookings,
    fetchGarageAnalytics:
      store.fetchGarageAnalytics,

    // NEW: Fetch complete data action
    fetchCompleteData: store.fetchCompleteData,

    createGarage: store.createGarage,
    updateGarage: store.updateGarage,
    deleteGarage: store.deleteGarage,
    restoreGarage: store.restoreGarage,

    verifyGarage: store.verifyGarage,
    toggleActiveGarage: store.toggleActiveGarage,

    uploadFiles: store.uploadFiles,
    deleteFile: store.deleteFile,

    clearError: store.clearError,
    resetGarage: store.resetGarage,
    resetGarageServices:
      store.resetGarageServices,
    resetGarageReviews: store.resetGarageReviews,
    resetGarageBookings:
      store.resetGarageBookings,

    // Helpers
    getGarageById,
    hasGarage,
    getGarageCount,
    getOwnerInfo,
    isGarageOwner,

    getServices,
    getServiceById,

    getBookings,
    getPendingBookings,
    getCompletedBookings,
    getUpcomingBookings,
    getTodaysBookings,

    getReviews,
    getAverageRating,

    getVerifiedGarages,
    getActiveGarages,
    getDeletedGarages,
    getPendingVerificationGarages,
    getSuspendedGarages,

    // Local Stats
    getLocalStats,

    // NEW: Complete data helpers
    getCompleteData,
    getCompleteStats,
    getCollections,
    getAllServices,
    getAllBookings,
    getAllReviews,
    getAllPayments,
    getAllOwners,
    getPricingInfo,
    getGlobalPriceRange,
    getGaragePricing,
    getGroups,
    getGaragesByCity,
    getVerifiedGaragesList,
    getUnverifiedGaragesList,
    getDeletedGaragesList,
    getActiveGaragesIds,
    getGaragesByStatus,
    getTimelineData,
    getCreatedByMonth,
    getVerifiedByMonth,
    getMetadata,
    getDatabaseStats,

    // NEW: Advanced queries
    findGarageByServicePrice,
    getTopRatedGarages,
    getMostBookedGarages,
    getGaragesByCategory,
    getServicesByCategory,
    getBookingsByDateRange,
    getReviewsByRating,
    getPaymentStatsByMethod,
    getRevenueByPeriod,
  };
};
