import { useCallback } from "react";
import { useGarageStore } from "../store/garage.store";
import type {
  PopulatedGarage,
  UserSummary,
  GarageService,
  ServiceBooking,
  GarageReview,
} from "@/lib/types/garage.types";
import type { CompleteGaragesData } from "../api/garage.api";

export const useGarage = () => {
  const store = useGarageStore();

  /* ============================ */
  /* COMPLETE DATA HELPERS
  /* ============================ */

  const getCompleteData = (): CompleteGaragesData | null =>
    store.completeData ?? null;

  const getCompleteStats = () => store.completeData?.stats ?? null;

  const getCollections = () => store.completeData?.collections ?? null;

  const getAllServices = () =>
    store.completeData?.collections?.services ?? [];

  const getAllBookings = () =>
    store.completeData?.collections?.bookings ?? [];

  const getAllReviews = () =>
    store.completeData?.collections?.reviews ?? [];

  const getAllPayments = () =>
    store.completeData?.collections?.payments ?? [];

  const getAllOwners = () =>
    store.completeData?.collections?.owners ?? [];

  const getPricingInfo = () => store.completeData?.pricing ?? null;

  const getGlobalPriceRange = () =>
    store.completeData?.pricing?.global ?? null;

  const getGaragePricing = (garageId: string) =>
    store.completeData?.pricing?.byGarage?.find(
      (g) => g.garageId === garageId
    ) ?? null;

  const getGroups = () => store.completeData?.groups ?? null;

  const getGaragesByCity = (city: string) =>
    store.completeData?.groups?.byCity?.[city] ?? [];

  const getVerifiedGaragesList = () =>
    store.completeData?.groups?.byVerificationStatus?.verified ?? [];

  const getUnverifiedGaragesList = () =>
    store.completeData?.groups?.byVerificationStatus?.unverified ?? [];

  const getDeletedGaragesList = () =>
    store.completeData?.groups?.byDeletionStatus?.deleted ?? [];

  const getActiveGaragesIds = () =>
    store.completeData?.groups?.byDeletionStatus?.active ?? [];

  const getGaragesByStatus = (status: string) =>
    store.completeData?.groups?.byStatus?.[status] ?? [];

  const getTimelineData = () => store.completeData?.timeline ?? null;

  const getCreatedByMonth = () =>
    store.completeData?.timeline?.createdByMonth ?? {};

  const getVerifiedByMonth = () =>
    store.completeData?.timeline?.verifiedByMonth ?? {};

  const getMetadata = () => store.completeData?.metadata ?? null;

  const getDatabaseStats = () =>
    store.completeData?.metadata?.databaseStats ?? null;

  /* ============================ */
  /* BASIC HELPERS
  /* ============================ */

  const getGarageById = (id: string): PopulatedGarage | null =>
    store.garages?.find((g) => g._id === id) ?? null;

  const hasGarage = (): boolean => !!store.garage;

  const getGarageCount = (): number => store.garages?.length ?? 0;

  /* ============================ */
  /* OWNER
  /* ============================ */

  const getOwnerInfo = (): UserSummary | null => {
    const owner = store.garage?.owner;
    return typeof owner === "object" ? owner : null;
  };

  const isGarageOwner = (userId?: string): boolean => {
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

  const getServiceById = (serviceId: string): GarageService | null =>
    store.garage?.services?.find((s) => s._id === serviceId) ?? null;

  /* ============================ */
  /* BOOKINGS
  /* ============================ */

  const getBookings = (): ServiceBooking[] =>
    (store.garage?.services ?? []).flatMap((s) => s.bookings ?? []);

  const getPendingBookings = (): ServiceBooking[] =>
    getBookings().filter((b) => b.status === "pending");

  const getCompletedBookings = (): ServiceBooking[] =>
    getBookings().filter((b) => b.status === "completed");

  const getUpcomingBookings = (): ServiceBooking[] =>
    getBookings().filter(
      (b) =>
        b.status === "approved" &&
        new Date(b.bookingDate) > new Date()
    );

  const getTodaysBookings = (): ServiceBooking[] => {
    const today = new Date().toISOString().split("T")[0];

    return getBookings().filter(
      (b) =>
        b.bookingDate.startsWith(today) &&
        ["pending", "approved"].includes(b.status)
    );
  };

  /* ============================ */
  /* REVIEWS
  /* ============================ */

  const getReviews = (): GarageReview[] =>
    store.garage?.reviews ?? [];

  const getAverageRating = (): number => {
    const reviews = getReviews();

    if (!reviews.length) return 0;

    const sum = reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );

    return parseFloat((sum / reviews.length).toFixed(1));
  };

  /* ============================ */
  /* LOCAL STATS
  /* ============================ */

  const getLocalStats = useCallback(() => {
    const stats = store.completeData?.stats;

    if (stats) {
      const bookings = stats.bookings ?? {};
      const reviews = stats.reviews ?? {};
      const services = stats.services ?? {};
      const payments = stats.payments ?? {};
      const owners = stats.owners ?? {};
      const files = stats.files ?? {};

      return {
        totalGarages: stats.totalGarages ?? 0,
        activeGarages: stats.totalActive ?? 0,
        inactiveGarages: stats.totalInactive ?? 0,
        deletedGarages: stats.totalDeleted ?? 0,
        verifiedGarages: stats.totalVerified ?? 0,
        unverifiedGarages: stats.totalUnverified ?? 0,
        pendingGarages: stats.totalPending ?? 0,
        approvedGarages: stats.totalApproved ?? 0,
        suspendedGarages: stats.totalSuspended ?? 0,

        totalBookings: bookings.total ?? 0,
        totalRevenue: bookings.totalRevenue ?? 0,
        upcomingBookings: bookings.upcoming ?? 0,

        avgRating: reviews.averageRating ?? 0,

        recentGarages:
          store.completeData?.garages?.slice(0, 5) ?? [],

        totalServices: services.total ?? 0,
        totalReviews: reviews.total ?? 0,
        totalPayments: payments.total ?? 0,
        totalOwners: owners.total ?? 0,

        totalImages: files.totalImages ?? 0,
        totalDocuments: files.totalDocuments ?? 0,
      };
    }

    const garages = store.garages ?? [];

    const totalGarages = garages.length;

    const activeGarages = garages.filter(
      (g) => g.isActive && !g.isDeleted
    ).length;

    const inactiveGarages = garages.filter(
      (g) => !g.isActive && !g.isDeleted
    ).length;

    const verifiedGarages = garages.filter(
      (g) => g.isVerified && !g.isDeleted
    ).length;

    const unverifiedGarages = garages.filter(
      (g) => !g.isVerified && !g.isDeleted
    ).length;

    const pendingGarages = garages.filter(
      (g) => g.status === "pending" && !g.isDeleted
    ).length;

    const approvedGarages = garages.filter(
      (g) => g.status === "approved" && !g.isDeleted
    ).length;

    const suspendedGarages = garages.filter(
      (g) => g.status === "suspended" && !g.isDeleted
    ).length;

    const totalBookings = garages.reduce(
      (sum, g) => sum + (g.stats?.totalBookings ?? 0),
      0
    );

    const avgRating =
      garages.reduce(
        (sum, g) => sum + (g.stats?.averageRating ?? 0),
        0
      ) / (garages.length || 1);

    const totalServices = garages.reduce(
      (sum, g) => sum + (g.services?.length ?? 0),
      0
    );

    const totalReviews = garages.reduce(
      (sum, g) => sum + (g.reviews?.length ?? 0),
      0
    );

    const totalImages = garages.reduce(
      (sum, g) => sum + (g.images?.length ?? 0),
      0
    );

    const totalDocuments = garages.reduce(
      (sum, g) => sum + (g.documents?.length ?? 0),
      0
    );

    return {
      totalGarages,
      activeGarages,
      inactiveGarages,
      verifiedGarages,
      unverifiedGarages,
      pendingGarages,
      approvedGarages,
      suspendedGarages,
      totalBookings,
      totalRevenue: 0,
      avgRating: parseFloat(avgRating.toFixed(1)),
      recentGarages: garages.slice(0, 5),
      totalServices,
      totalReviews,
      totalImages,
      totalDocuments,
    };
  }, [store.completeData, store.garages]);

  /* ============================ */
  /* FILTER HELPERS
  /* ============================ */

  const getVerifiedGarages = (): PopulatedGarage[] =>
    store.garages?.filter((g) => g.isVerified && !g.isDeleted) ?? [];

  const getActiveGarages = (): PopulatedGarage[] =>
    store.garages?.filter((g) => g.isActive && !g.isDeleted) ?? [];

  const getDeletedGarages = (): PopulatedGarage[] =>
    store.garages?.filter((g) => g.isDeleted) ?? [];

  const getPendingVerificationGarages = (): PopulatedGarage[] =>
    store.garages?.filter((g) => !g.isVerified && !g.isDeleted) ?? [];

  const getSuspendedGarages = (): PopulatedGarage[] =>
    store.garages?.filter((g) => g.status === "suspended" && !g.isDeleted) ?? [];

  /* ============================ */
  /* ADVANCED QUERIES
  /* ============================ */

  const findGarageByServicePrice = (minPrice?: number, maxPrice?: number) => {
    if (!store.completeData) return [];

    return store.completeData.pricing.byGarage
      .filter((garage) =>
        garage.services.some(
          (service) =>
            (!minPrice || service.price >= minPrice) &&
            (!maxPrice || service.price <= maxPrice)
        )
      )
      .map((g) => g.garageId);
  };

  const getTopRatedGarages = (limit: number = 10) => {
    if (!store.completeData) return [];

    return [...store.completeData.garages]
      .filter((g) => !g.isDeleted)
      .sort(
        (a, b) =>
          (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0)
      )
      .slice(0, limit);
  };

  const getMostBookedGarages = (limit: number = 10) => {
    if (!store.completeData) return [];

    return [...store.completeData.garages]
      .filter((g) => !g.isDeleted)
      .sort(
        (a, b) => (b.stats?.totalBookings || 0) - (a.stats?.totalBookings || 0)
      )
      .slice(0, limit);
  };

  const getGaragesByCategory = (category: string) => {
    if (!store.completeData) return [];

    return store.completeData.garages.filter(
      (garage) =>
        !garage.isDeleted &&
        garage.services?.some((service) => service.category === category)
    );
  };

  const getServicesByCategory = (category: string) => {
    if (!store.completeData) return [];

    return store.completeData.collections.services.filter(
      (service) => service.category === category
    );
  };

  const getBookingsByDateRange = (startDate: Date, endDate: Date) => {
    if (!store.completeData) return [];

    return store.completeData.collections.bookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  };

  const getReviewsByRating = (rating: number) => {
    if (!store.completeData) return [];

    return store.completeData.collections.reviews.filter(
      (review) => review.rating === rating
    );
  };

  const getPaymentStatsByMethod = (method: string) => {
    if (!store.completeData) return 0;

    return store.completeData.stats.payments.byMethod[method] || 0;
  };

  const getPaymentStatsByStatus = (status: string) => {
    if (!store.completeData || !store.completeData.stats.payments.byStatus)
      return 0;

    return store.completeData.stats.payments.byStatus[status] || 0;
  };

  const getRevenueByPeriod = (period: "day" | "week" | "month" | "year") => {
    if (!store.completeData) return 0;

    return store.completeData.stats.bookings.totalRevenue;
  };

  const getBookingStatusCount = (status: string): number => {
    if (!store.completeData) return 0;

    return store.completeData.stats.bookings.byStatus[status] || 0;
  };

  const getReviewRatingCount = (rating: number): number => {
    if (!store.completeData) return 0;

    return store.completeData.stats.reviews.byRating[rating] || 0;
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

    // Complete data state
    completeData: store.completeData,

    // Loading states
    loading: store.loading,
    error: store.error,
    actionLoading: store.actionLoading || {},

    // Pagination & Stats
    pagination: store.pagination,
    priceRange: store.priceRange,
    deletedGaragesStats: store.deletedGaragesStats,
    unverifiedGaragesStats: store.unverifiedGaragesStats,
    servicesPagination: store.servicesPagination,
    reviewsPagination: store.reviewsPagination,
    bookingsPagination: store.bookingsPagination,
    reviewsSummary: store.reviewsSummary,
    bookingsStats: store.bookingsStats,
    categorySummary: store.categorySummary,

    // Actions
    fetchGarages: store.fetchGarages,
    fetchGarage: store.fetchGarage,
    fetchNearbyGarages: store.fetchNearbyGarages,
    fetchDeletedGarages: store.fetchDeletedGarages,
    fetchUnverifiedGarages: store.fetchUnverifiedGarages,
    fetchGarageServices: store.fetchGarageServices,
    fetchGarageReviews: store.fetchGarageReviews,
    fetchGarageBookings: store.fetchGarageBookings,
    fetchGarageAnalytics: store.fetchGarageAnalytics,
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
    resetGarageServices: store.resetGarageServices,
    resetGarageReviews: store.resetGarageReviews,
    resetGarageBookings: store.resetGarageBookings,

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

    // Complete data helpers
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

    // Advanced queries
    findGarageByServicePrice,
    getTopRatedGarages,
    getMostBookedGarages,
    getGaragesByCategory,
    getServicesByCategory,
    getBookingsByDateRange,
    getReviewsByRating,
    getPaymentStatsByMethod,
    getPaymentStatsByStatus,
    getRevenueByPeriod,
    getBookingStatusCount,
    getReviewRatingCount,
  };
};