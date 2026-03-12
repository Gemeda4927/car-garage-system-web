"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineStar,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineCog,
  HiOutlineTrash,
  HiOutlineArchive,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineSearch,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineCloudUpload,
  HiOutlineDatabase,
  HiOutlineChartBar,
  HiOutlineDownload,
  HiOutlineBan,
  HiOutlineArrowLeft,
} from "react-icons/hi";

import {
  HiOutlineBuildingOffice,
  HiOutlineBuildingStorefront,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineWrench,
  HiOutlineGlobeAlt,
  HiOutlineCreditCard,
} from "react-icons/hi2";

import type {
  PopulatedGarage,
  GarageService,
  ServiceBooking,
  UserSummary,
  GarageReview,
} from "@/lib/types/garage.types";

import { useGarage } from "@/lib/hooks/useGarage";

interface GarageTableProps {
  showDeleted?: boolean;
  showUnverified?: boolean;
  showComplete?: boolean;
  onViewChange?: (view: 'regular' | 'deleted' | 'unverified' | 'complete') => void;
}

type SortField = "name" | "createdAt" | "rating" | "bookings" | "status" | "price";
type SortOrder = "asc" | "desc";

const formatETB = (price: number) => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

const isGarageOpenNow = (businessHours?: any): boolean => {
  if (!businessHours) return false;

  const now = new Date();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const daySchedule = businessHours[currentDay];
  if (!daySchedule || daySchedule.closed) return false;

  const [openHour, openMinute] = daySchedule.open.split(":").map(Number);
  const [closeHour, closeMinute] = daySchedule.close.split(":").map(Number);

  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  return currentTime >= openTime && currentTime <= closeTime;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function GarageTable({
  showDeleted = false,
  showUnverified = false,
  showComplete = false,
  onViewChange,
}: GarageTableProps) {
  const {
    garage: selectedGarage,
    garages: hookGarages,
    deletedGarages,
    unverifiedGarages,
    garageServices,
    garageReviews,
    garageBookings,
    garageAnalytics,
    completeData,
    loading,
    error,
    actionLoading,
    pagination,
    priceRange,
    deletedGaragesStats,
    unverifiedGaragesStats,
    servicesPagination,
    reviewsPagination,
    bookingsPagination,
    reviewsSummary,
    bookingsStats,
    categorySummary,
    fetchGarages,
    fetchGarage,
    fetchNearbyGarages,
    fetchDeletedGarages,
    fetchUnverifiedGarages,
    fetchGarageServices,
    fetchGarageReviews,
    fetchGarageBookings,
    fetchGarageAnalytics,
    fetchCompleteData,
    createGarage,
    updateGarage,
    deleteGarage,
    restoreGarage,
    verifyGarage,
    toggleActiveGarage,
    uploadFiles,
    deleteFile,
    clearError,
    resetGarage,
    resetGarageServices,
    resetGarageReviews,
    resetGarageBookings,
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
    getDeletedGarages: getDeletedGaragesHelper,
    getPendingVerificationGarages,
    getSuspendedGarages,
    getLocalStats,
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
  } = useGarage();

  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGarages, setSelectedGarages] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalGarage, setModalGarage] = useState<PopulatedGarage | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'garages' | 'services' | 'bookings' | 'reviews'>('overview');


  // Get the appropriate garage list based on view
  const getGaragesToShow = useCallback(() => {
    if (showDeleted) return deletedGarages;
    if (showUnverified) return unverifiedGarages;
    return hookGarages;
  }, [hookGarages, deletedGarages, unverifiedGarages, showDeleted, showUnverified]);

  const garages = getGaragesToShow();
  const garageList = useMemo(() => {
    if (!Array.isArray(garages)) return [];
    return garages;
  }, [garages]);

  // Fetch data when view changes
  useEffect(() => {
    const fetchData = async () => {
      if (showComplete) {
        await fetchCompleteData();
      } else if (showDeleted) {
        await fetchDeletedGarages();
      } else if (showUnverified) {
        await fetchUnverifiedGarages();
      } else {
        await fetchGarages();
      }
    };
    fetchData();
  }, [showComplete, showDeleted, showUnverified, fetchCompleteData, fetchDeletedGarages, fetchUnverifiedGarages, fetchGarages]);

  // View handlers
  const handleRegularView = () => {
    if (onViewChange) {
      onViewChange('regular');
    }
    fetchGarages();
  };

  const handleCompleteView = () => {
    if (onViewChange) {
      onViewChange('complete');
    }
    fetchCompleteData();
  };

  const handleDeletedView = () => {
    if (onViewChange) {
      onViewChange('deleted');
    }
    fetchDeletedGarages();
  };

  const handleUnverifiedView = () => {
    if (onViewChange) {
      onViewChange('unverified');
    }
    fetchUnverifiedGarages();
  };

  // Filter and sort garages
  const filteredAndSortedGarages = useMemo(() => {
    let filtered = [...garageList];

    if (searchTerm) {
      filtered = filtered.filter((garage) => {
        const ownerName = typeof garage.owner === "object" ? garage.owner?.name || "" : "";
        return (
          garage.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.address?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.contactInfo?.phone?.includes(searchTerm) ||
          garage.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((garage) => {
        if (statusFilter === "verified") return garage.isVerified;
        if (statusFilter === "unverified") return !garage.isVerified;
        if (statusFilter === "active") return garage.isActive;
        if (statusFilter === "inactive") return !garage.isActive;
        if (statusFilter === "pending") return garage.status === "pending";
        if (statusFilter === "approved") return garage.status === "approved";
        if (statusFilter === "suspended") return garage.status === "suspended";
        if (statusFilter === "deleted") return garage.isDeleted;
        return true;
      });
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "rating":
          comparison = (a.stats?.averageRating || 0) - (b.stats?.averageRating || 0);
          break;
        case "bookings":
          comparison = (a.stats?.totalBookings || 0) - (b.stats?.totalBookings || 0);
          break;
        case "status":
          comparison = (a.isVerified ? 1 : 0) - (b.isVerified ? 1 : 0);
          break;
        case "price":
          const minPriceA = a.services?.length ? Math.min(...a.services.map((s) => s.price)) : 0;
          const minPriceB = b.services?.length ? Math.min(...b.services.map((s) => s.price)) : 0;
          comparison = minPriceA - minPriceB;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [garageList, searchTerm, sortField, sortOrder, statusFilter]);

  // Pagination
  const paginatedGarages = useMemo(() => {
    if (pagination) {
      return filteredAndSortedGarages;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedGarages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedGarages, currentPage, itemsPerPage, pagination]);

  const totalPages = pagination?.pages ?? Math.ceil(filteredAndSortedGarages.length / itemsPerPage);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedGarages.length === paginatedGarages.length) {
      setSelectedGarages([]);
    } else {
      setSelectedGarages(paginatedGarages.map((g) => g._id));
    }
  };

  const handleSelectGarage = (id: string) => {
    setSelectedGarages((prev) => (prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]));
  };

  // Action handlers
  const handleViewDetails = async (garage: PopulatedGarage) => {
    setModalGarage(garage);
    setShowDetailsModal(true);
    await fetchGarage(garage._id);
    await fetchGarageServices(garage._id);
    await fetchGarageReviews(garage._id);
    await fetchGarageBookings(garage._id);
    await fetchGarageAnalytics(garage._id);
  };

  const handleVerify = async (id: string, status: "active" | "rejected", notes?: string) => {
    try {
      await verifyGarage(id, {
        status,
        notes: notes || "",
      });
      toast.success(`Garage ${status === "active" ? "verified" : "rejected"} successfully`);
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${status} garage`);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActiveGarage(id);
      toast.success("Garage status updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update garage status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGarage(id);
      toast.success(showDeleted ? "Garage permanently deleted" : "Garage moved to trash");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete garage");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreGarage(id);
      toast.success("Garage restored successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to restore garage");
    }
  };

  const handleBulkVerify = async () => {
    if (selectedGarages.length === 0) {
      toast.error("No garages selected");
      return;
    }

    const confirmed = window.confirm(`Verify ${selectedGarages.length} selected garages?`);
    if (!confirmed) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await Promise.all(
        selectedGarages.map(async (id) => {
          try {
            await verifyGarage(id, {
              status: "active",
              notes: "",
            });
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      if (successCount > 0) {
        toast.success(`Successfully verified ${successCount} garages`);
      }
      if (failCount > 0) {
        toast.error(`Failed to verify ${failCount} garages`);
      }

      setSelectedGarages([]);
    } catch (error) {
      toast.error("Failed to verify some garages");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkToggle = async () => {
    if (selectedGarages.length === 0) {
      toast.error("No garages selected");
      return;
    }

    const action = showDeleted ? "restore" : "toggle";
    const confirmed = window.confirm(`Update ${selectedGarages.length} selected garages?`);
    if (!confirmed) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await Promise.all(
        selectedGarages.map(async (id) => {
          try {
            if (showDeleted) {
              await restoreGarage(id);
            } else {
              await toggleActiveGarage(id);
            }
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} garages`);
      }
      if (failCount > 0) {
        toast.error(`Failed to update ${failCount} garages`);
      }

      setSelectedGarages([]);
    } catch (error) {
      toast.error("Failed to update some garages");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGarages.length === 0) {
      toast.error("No garages selected");
      return;
    }

    const action = showDeleted ? "permanently delete" : "move to trash";
    const confirmed = window.confirm(`Are you sure you want to ${action} ${selectedGarages.length} garages?`);
    if (!confirmed) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await Promise.all(
        selectedGarages.map(async (id) => {
          try {
            await deleteGarage(id);
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      if (successCount > 0) {
        toast.success(`Successfully ${action} ${successCount} garages`);
      }
      if (failCount > 0) {
        toast.error(`Failed to ${action} ${failCount} garages`);
      }

      setSelectedGarages([]);
    } catch (error) {
      toast.error(`Failed to ${action} some garages`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const isActionLoading = (id: string, action: string) => {
    if (!actionLoading || typeof actionLoading !== 'object') {
      return false;
    }
    return actionLoading[id] === action;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <HiOutlineBuildingOffice className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            {showComplete ? "Loading complete data..." : "Loading garages..."}
          </p>
          <p className="text-sm text-gray-400">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <HiOutlineXCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Garages</h3>
          <p className="text-red-600 bg-red-50 rounded-lg p-4 max-w-md mx-auto text-sm">{error}</p>
          <button
            onClick={() => {
              clearError();
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

// Complete data view
if (showComplete && completeData) {
  const stats = completeData.stats;
  const collections = completeData.collections;
  const metadata = completeData.metadata;
  const groups = completeData.groups;
  const timeline = completeData.timeline;

  
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Back Button at the top */}
      <div className="flex items-center gap-4 mb-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRegularView}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-sm font-medium shadow-sm"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Garages</span>
        </motion.button>
        <span className="text-sm text-gray-500">/ Complete Analytics</span>
      </div>

      {/* Header with Actions */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Complete Garage Analytics</h2>
            <p className="text-indigo-100">All data without any filters or conditions</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const dataStr = JSON.stringify(completeData, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `complete-garage-data-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('Data exported successfully!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-all text-sm font-medium"
            >
              <HiOutlineDownload className="w-4 h-4" />
              Export JSON
            </motion.button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Total Records</p>
            <p className="text-2xl font-bold">{stats.totalGarages + stats.services.total + stats.bookings.total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Data Points</p>
            <p className="text-2xl font-bold">
              {Object.keys(collections).reduce((acc, key) => acc + (collections[key as keyof typeof collections]?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Last Updated</p>
            <p className="text-lg font-semibold">{new Date(metadata.generatedAt || "").toLocaleDateString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Version</p>
            <p className="text-lg font-semibold">{metadata.version || "1.0.0"}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
            { id: 'garages', label: 'Garages', icon: HiOutlineBuildingStorefront, count: stats.totalGarages },
            { id: 'services', label: 'Services', icon: HiOutlineWrench, count: stats.services.total },
            { id: 'bookings', label: 'Bookings', icon: HiOutlineCalendar, count: stats.bookings.total },
            { id: 'reviews', label: 'Reviews', icon: HiOutlineStar, count: stats.reviews.total },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Overview Tab - Stats Cards */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Garages",
                  value: stats.totalGarages,
                  icon: HiOutlineBuildingStorefront,
                  color: "indigo",
                  subtext: `${stats.totalVerified} Verified · ${stats.totalUnverified} Unverified`,
                  trend: "+12%",
                  trendUp: true
                },
                {
                  label: "Total Bookings",
                  value: formatNumber(stats.bookings.total),
                  icon: HiOutlineCalendar,
                  color: "green",
                  subtext: `Revenue: ${formatETB(stats.bookings.totalRevenue)}`,
                  trend: "+8%",
                  trendUp: true
                },
                {
                  label: "Total Services",
                  value: stats.services.total,
                  icon: HiOutlineWrench,
                  color: "blue",
                  subtext: `Avg: ${formatETB(stats.services.priceRange.avg)}`,
                  trend: "+15%",
                  trendUp: true
                },
                {
                  label: "Total Reviews",
                  value: stats.reviews.total,
                  icon: HiOutlineStar,
                  color: "yellow",
                  subtext: `Avg: ${stats.reviews.averageRating.toFixed(1)} ⭐`,
                  trend: "+5%",
                  trendUp: true
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.2)" }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-2">{stat.subtext}</p>
                    </div>
                    <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </span>
                    <span className="text-xs text-gray-400">vs last month</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Garage Status Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Garage Status Distribution</h3>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
                    {stats.totalGarages} Total
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Active", value: stats.totalActive, color: "green", icon: HiOutlineCheckCircle },
                    { label: "Inactive", value: stats.totalInactive, color: "gray", icon: HiOutlineClock },
                    { label: "Verified", value: stats.totalVerified, color: "blue", icon: HiOutlineShieldCheck },
                    { label: "Unverified", value: stats.totalUnverified, color: "yellow", icon: HiOutlineXCircle },
                    { label: "Pending", value: stats.totalPending, color: "orange", icon: HiOutlineClock },
                    { label: "Suspended", value: stats.totalSuspended, color: "red", icon: HiOutlineBan },
                    { label: "Deleted", value: stats.totalDeleted, color: "red", icon: HiOutlineTrash }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 text-${item.color}-500`} />
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{item.value}</span>
                        <span className="text-xs text-gray-400 w-12">
                          {((item.value / stats.totalGarages) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Booking Status Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    {stats.bookings.total} Total
                  </span>
                </div>
                <div className="space-y-4">
                  {Object.entries(stats.bookings.byStatus).map(([status, count]) => {
                    const getStatusColor = (s: string) => {
                      switch(s) {
                        case 'completed': return 'green';
                        case 'pending': return 'yellow';
                        case 'approved': return 'blue';
                        case 'cancelled': return 'red';
                        case 'rejected': return 'orange';
                        default: return 'gray';
                      }
                    };
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{status}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">{formatNumber(count as number)}</span>
                          <span className={`px-2 py-1 bg-${getStatusColor(status)}-100 text-${getStatusColor(status)}-600 rounded-full text-xs`}>
                            {(((count as number) / stats.bookings.total) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Upcoming</span>
                      <span className="font-semibold text-blue-600">{formatNumber(stats.bookings.upcoming || 0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Garages Table Tab */}
        {activeTab === 'garages' && (
          <motion.div
            key="garages-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Garage</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Services</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completeData.garages.slice(0, 10).map((garage) => {
                    const owner = typeof garage.owner === 'object' ? garage.owner : null;
                    const isOpen = isGarageOpenNow(garage.businessHours);
                    
                    return (
                      <motion.tr
                        key={garage._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                <HiOutlineBuildingStorefront className="w-5 h-5" />
                              </div>
                              {garage.isVerified && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <HiOutlineCheckCircle className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{garage.name}</p>
                              <p className="text-xs text-gray-500">ID: {garage._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {owner ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">{owner.name}</p>
                              <p className="text-xs text-gray-500">{owner.email}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {garage.address ? (
                            <div>
                              <p className="text-sm text-gray-900">{garage.address.city}</p>
                              <p className="text-xs text-gray-500">{garage.address.street}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No address</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {garage.services?.length || 0} services
                            </p>
                            {garage.services && garage.services.length > 0 && (
                              <p className="text-xs text-gray-500">
                                From {formatETB(Math.min(...garage.services.map(s => s.price)))}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                              garage.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {garage.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full inline-block ml-1 ${
                              garage.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {garage.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full inline-block ml-1 ${
                              isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {isOpen ? 'Open' : 'Closed'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewDetails(garage)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </motion.button>
                            {!garage.isVerified && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleVerify(garage._id, "active")}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Verify Garage"
                              >
                                <HiOutlineShieldCheck className="w-4 h-4" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleToggleActive(garage._id)}
                              className={`p-2 rounded-lg ${
                                garage.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-blue-600 hover:bg-blue-50'
                              }`}
                              title={garage.isActive ? "Deactivate" : "Activate"}
                            >
                              <HiOutlineRefresh className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {completeData.garages.length > 10 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  View all {completeData.garages.length} garages →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Services Table Tab */}
        {activeTab === 'services' && (
          <motion.div
            key="services-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Garage</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {collections.services?.slice(0, 10).map((service) => {
                    const garage = completeData.garages.find(g => g._id === service.garage);
                    
                    return (
                      <motion.tr
                        key={service._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{service.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{garage?.name || 'Unknown'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{formatETB(service.price)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{service.duration} min</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            service.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {service.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Bookings Table Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Garage</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {collections.bookings?.slice(0, 10).map((booking) => {
                    const garage = completeData.garages.find(g => g._id === booking.garage);
                    const service = collections.services?.find(s => s._id === booking.service);
                    
                    return (
                      <motion.tr
                        key={booking._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {typeof booking.carOwner === 'object' ? booking.carOwner.name : 'Unknown'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{garage?.name || 'Unknown'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{service?.name || 'Unknown'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{booking.timeSlot?.start} - {booking.timeSlot?.end}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{formatETB(booking.price?.total || 0)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Reviews Table Tab */}
        {activeTab === 'reviews' && (
          <motion.div
            key="reviews-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Garage</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {collections.reviews?.slice(0, 10).map((review) => {
                    const garage = completeData.garages.find(g => g._id === review.garage);
                    
                    return (
                      <motion.tr
                        key={review._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{review.carOwner?.name || 'Anonymous'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{garage?.name || 'Unknown'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <HiOutlineStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 truncate max-w-[200px]">{review.comment}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer with Generation Info */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-4">
          <span>Generated: {new Date(metadata.generatedAt || "").toLocaleString()}</span>
          <span>•</span>
          <span>Version: {metadata.version || "1.0.0"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Live Data</span>
        </div>
      </div>
    </div>
  );
}

  // Empty state
  if (garageList.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-16">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl mb-6">
            <HiOutlineBuildingStorefront className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {showDeleted ? "Trash is empty" : showUnverified ? "No unverified garages" : "No garages found"}
          </h3>
          <p className="text-gray-500 mb-6 text-sm">
            {showDeleted
              ? "Deleted garages will appear here"
              : showUnverified
              ? "All garages have been verified"
              : "No garages available"}
          </p>
        </div>
      </div>
    );
  }

  // Main table view
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && modalGarage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <HiOutlineBuildingStorefront className="w-8 h-8" />
                      </div>
                      {modalGarage.isVerified && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{modalGarage.name}</h2>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            modalGarage.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {modalGarage.isActive ? "Active" : "Inactive"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            modalGarage.isVerified ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {modalGarage.isVerified ? "Verified" : "Unverified"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            modalGarage.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : modalGarage.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : modalGarage.status === "suspended"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {modalGarage.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <HiOutlineX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-900">{modalGarage.description || "No description provided"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Owner Information</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white">
                          <HiOutlineUser className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {typeof modalGarage.owner === "object" ? modalGarage.owner?.name : "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {typeof modalGarage.owner === "object" ? modalGarage.owner?.email : ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {typeof modalGarage.owner === "object" ? modalGarage.owner?.phone : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                          <span>{modalGarage.contactInfo?.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <HiOutlineMail className="w-4 h-4 text-gray-400" />
                          <span>{modalGarage.contactInfo?.email || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <HiOutlineMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p>{modalGarage.address?.street}</p>
                            <p>
                              {modalGarage.address?.city}, {modalGarage.address?.state}
                            </p>
                            <p>
                              {modalGarage.address?.country} {modalGarage.address?.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Performance Stats</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-indigo-600">{modalGarage.stats?.totalBookings || 0}</p>
                        <p className="text-xs text-gray-500">Total Bookings</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{modalGarage.stats?.completedBookings || 0}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{modalGarage.stats?.averageRating.toFixed(1) || 0}</p>
                        <p className="text-xs text-gray-500">Avg Rating</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">{modalGarage.stats?.totalReviews || 0}</p>
                        <p className="text-xs text-gray-500">Reviews</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Services</h3>
                    {garageServices && garageServices.length > 0 ? (
                      <div className="space-y-2">
                        {garageServices.map((service) => (
                          <div key={service._id} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{service.name}</p>
                                <p className="text-xs text-gray-500">{service.category}</p>
                              </div>
                              <p className="font-bold text-indigo-600">{formatETB(service.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No services available</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Reviews</h3>
                    {garageReviews && garageReviews.length > 0 ? (
                      <div className="space-y-2">
                        {garageReviews.slice(0, 3).map((review) => (
                          <div key={review._id} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <HiOutlineStar
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">{review.carOwner?.name || "Anonymous"}</span>
                            </div>
                            <p className="text-sm text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No reviews yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${showDeleted ? "deleted" : showUnverified ? "unverified" : ""} garages...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-80 xl:w-96 pl-12 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
            {!showDeleted && !showUnverified && !showComplete && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 lg:flex-none px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>

                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-") as [SortField, SortOrder];
                    setSortField(field);
                    setSortOrder(order);
                  }}
                  className="flex-1 lg:flex-none px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="createdAt-desc">Newest</option>
                  <option value="createdAt-asc">Oldest</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="rating-asc">Lowest Rated</option>
                  <option value="bookings-desc">Most Bookings</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </>
            )}

            <div className="flex gap-2">
              {/* Regular View Button */}
              <button
                onClick={handleRegularView}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
                  !showComplete && !showDeleted && !showUnverified
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title="Regular View"
              >
                <HiOutlineBuildingStorefront className="w-5 h-5" />
                <span className="hidden sm:inline">Garages</span>
              </button>

              {/* Complete View Button */}
              <button
                onClick={handleCompleteView}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
                  showComplete
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title="Complete Data View"
              >
                <HiOutlineDatabase className="w-5 h-5" />
                <span className="hidden sm:inline">Complete</span>
              </button>

              {/* Deleted View Button */}
              <button
                onClick={handleDeletedView}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
                  showDeleted
                    ? "bg-red-600 text-white shadow-lg shadow-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title="Deleted Garages"
              >
                <HiOutlineTrash className="w-5 h-5" />
                <span className="hidden sm:inline">Deleted</span>
              </button>

              {/* Unverified View Button */}
              <button
                onClick={handleUnverifiedView}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
                  showUnverified
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title="Unverified Garages"
              >
                <HiOutlineShieldCheck className="w-5 h-5" />
                <span className="hidden sm:inline">Unverified</span>
              </button>
            </div>

            {/* Back button - shows when in special views */}
            {(showDeleted || showUnverified || showComplete) && (
              <button
                onClick={handleRegularView}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm font-medium ml-2"
                title="Back to regular view"
              >
                <HiOutlineArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
          </div>
        </div>

        {priceRange && !showDeleted && !showUnverified && !showComplete && (
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price Range:</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  Min: <span className="font-semibold text-indigo-600">{formatETB(priceRange.minPrice)}</span>
                </span>
                <span className="text-gray-700">
                  Avg: <span className="font-semibold text-indigo-600">{formatETB(priceRange.avgPrice)}</span>
                </span>
                <span className="text-gray-700">
                  Max: <span className="font-semibold text-indigo-600">{formatETB(priceRange.maxPrice)}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {!showComplete && selectedGarages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-200 rounded-full flex items-center justify-center">
                  <span className="text-xs md:text-sm font-semibold text-indigo-700">{selectedGarages.length}</span>
                </div>
                <span className="text-sm md:text-base font-medium text-gray-700">garages selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {!showDeleted && !showUnverified && (
                  <>
                    <button
                      onClick={handleBulkVerify}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineCheckCircle className="w-4 h-4" />
                      )}
                      <span>Verify All</span>
                    </button>
                    <button
                      onClick={handleBulkToggle}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineRefresh className="w-4 h-4" />
                      )}
                      <span>Toggle All</span>
                    </button>
                  </>
                )}
                {showDeleted ? (
                  <>
                    <button
                      onClick={handleBulkToggle}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineRefresh className="w-4 h-4" />
                      )}
                      <span>Restore All</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineTrash className="w-4 h-4" />
                      )}
                      <span>Delete All</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50"
                  >
                    {bulkActionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiOutlineArchive className="w-4 h-4" />
                    )}
                    <span>Trash All</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedGarages([])}
                  disabled={bulkActionLoading}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs md:text-sm disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats Cards */}
      {!showDeleted && !showUnverified && !showComplete && (
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 min-w-max md:min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineBuildingOffice className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{garageList.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Verified</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {garageList.filter((g) => g.isVerified).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineUserGroup className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {garageList.filter((g) => g.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineStar className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {(
                      garageList.reduce((acc, g) => acc + (g.stats?.averageRating || 0), 0) / garageList.length || 0
                    ).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineCurrencyDollar className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Price</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {priceRange ? formatETB(priceRange.avgPrice) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      {!showComplete && (
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedGarages.length === paginatedGarages.length && paginatedGarages.length > 0}
                      onChange={handleSelectAll}
                      disabled={bulkActionLoading}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Garage Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {paginatedGarages.map((garage, index) => {
                    const owner = typeof garage.owner === "object" ? garage.owner : null;
                    const isSelected = selectedGarages.includes(garage._id);
                    const isLoading =
                      isActionLoading(garage._id, "verify") ||
                      isActionLoading(garage._id, "toggle") ||
                      isActionLoading(garage._id, "delete") ||
                      isActionLoading(garage._id, "restore");
                    const isOpen = isGarageOpenNow(garage.businessHours);

                    return (
                      <motion.tr
                        key={garage._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group hover:bg-indigo-50/30 transition-colors ${
                          isSelected ? "bg-indigo-50/50" : ""
                        } ${isLoading ? "opacity-50" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectGarage(garage._id)}
                            disabled={bulkActionLoading || isLoading}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <HiOutlineBuildingStorefront className="w-6 h-6" />
                              </div>
                              {garage.isVerified && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => handleViewDetails(garage)}
                                className="font-semibold text-gray-900 hover:text-indigo-600 text-left"
                              >
                                {garage.name}
                              </button>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {isOpen ? "Open Now" : "Closed"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {owner ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                <HiOutlineUser className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate max-w-[120px]">{owner.name}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[120px]">{owner.email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {garage.address ? (
                            <div className="flex items-start gap-2">
                              <HiOutlineMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm text-gray-900 truncate max-w-[120px]">{garage.address.city}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                  {garage.address.state}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No address</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <HiOutlineWrench className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900">
                                {garage.services?.length || 0} services
                              </span>
                            </div>
                            {garage.services && garage.services.length > 0 && (
                              <div className="flex items-center gap-2">
                                <HiOutlineCurrencyDollar className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-xs text-gray-600 font-medium">
                                  From {formatETB(Math.min(...garage.services.map((s) => s.price)))}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2 min-w-[120px]">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Bookings</span>
                              <span className="font-semibold text-gray-900">{garage.stats?.totalBookings || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Rating</span>
                              <span className="font-semibold text-yellow-600">
                                {garage.stats?.averageRating.toFixed(1) || "0.0"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                                garage.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {garage.isActive ? "Active" : "Inactive"}
                            </span>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full inline-block ml-2 ${
                                garage.isVerified ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {garage.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewDetails(garage)}
                              disabled={isLoading}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-5 h-5" />
                            </motion.button>

                            {!showDeleted && !showUnverified ? (
                              <>
                                {!garage.isVerified && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVerify(garage._id, "active")}
                                    disabled={isLoading}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                    title="Verify Garage"
                                  >
                                    {isActionLoading(garage._id, "verify") ? (
                                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <HiOutlineShieldCheck className="w-5 h-5" />
                                    )}
                                  </motion.button>
                                )}

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleToggleActive(garage._id)}
                                  disabled={isLoading}
                                  className={`p-2 rounded-lg ${
                                    garage.isActive
                                      ? "text-orange-600 hover:bg-orange-50"
                                      : "text-blue-600 hover:bg-blue-50"
                                  }`}
                                  title={garage.isActive ? "Deactivate" : "Activate"}
                                >
                                  {isActionLoading(garage._id, "toggle") ? (
                                    <div
                                      className={`w-5 h-5 border-2 ${
                                        garage.isActive ? "border-orange-600" : "border-blue-600"
                                      } border-t-transparent rounded-full animate-spin`}
                                    />
                                  ) : (
                                    <HiOutlineRefresh className="w-5 h-5" />
                                  )}
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDelete(garage._id)}
                                  disabled={isLoading}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete Garage"
                                >
                                  {isActionLoading(garage._id, "delete") ? (
                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <HiOutlineArchive className="w-5 h-5" />
                                  )}
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRestore(garage._id)}
                                  disabled={isLoading}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Restore Garage"
                                >
                                  {isActionLoading(garage._id, "restore") ? (
                                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <HiOutlineRefresh className="w-5 h-5" />
                                  )}
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDelete(garage._id)}
                                  disabled={isLoading}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Permanently Delete"
                                >
                                  {isActionLoading(garage._id, "delete") ? (
                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <HiOutlineTrash className="w-5 h-5" />
                                  )}
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      {!showComplete && (
        <div className="lg:hidden space-y-3">
          <AnimatePresence>
            {paginatedGarages.map((garage, index) => {
              const owner = typeof garage.owner === "object" ? garage.owner : null;
              const isSelected = selectedGarages.includes(garage._id);
              const isExpanded = expandedRow === garage._id;
              const isLoading =
                isActionLoading(garage._id, "verify") ||
                isActionLoading(garage._id, "toggle") ||
                isActionLoading(garage._id, "delete") ||
                isActionLoading(garage._id, "restore");
              const isOpen = isGarageOpenNow(garage.businessHours);

              return (
                <motion.div
                  key={garage._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-white rounded-xl shadow-sm border ${
                    isSelected ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200"
                  } overflow-hidden ${isLoading ? "opacity-50" : ""}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                          <HiOutlineBuildingStorefront className="w-6 h-6" />
                        </div>
                        {garage.isVerified && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <button
                              onClick={() => handleViewDetails(garage)}
                              className="font-semibold text-gray-900 hover:text-indigo-600 text-left"
                            >
                              {garage.name}
                            </button>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectGarage(garage._id)}
                            disabled={bulkActionLoading || isLoading}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ml-2"
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              garage.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {garage.isActive ? "Active" : "Inactive"}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              garage.isVerified ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {garage.isVerified ? "Verified" : "Pending"}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate">{owner?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate">{garage.address?.city || "No location"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineWrench className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{garage.services?.length || 0} services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineStar className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-600">{garage.stats?.averageRating.toFixed(1) || "0.0"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(garage)}
                        disabled={isLoading}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <HiOutlineEye className="w-5 h-5" />
                      </motion.button>

                      {!showDeleted && !showUnverified ? (
                        <>
                          {!garage.isVerified && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleVerify(garage._id, "active")}
                              disabled={isLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              {isActionLoading(garage._id, "verify") ? (
                                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiOutlineShieldCheck className="w-5 h-5" />
                              )}
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleActive(garage._id)}
                            disabled={isLoading}
                            className={`p-2 rounded-lg ${
                              garage.isActive ? "text-orange-600 hover:bg-orange-50" : "text-blue-600 hover:bg-blue-50"
                            }`}
                          >
                            {isActionLoading(garage._id, "toggle") ? (
                              <div
                                className={`w-5 h-5 border-2 ${
                                  garage.isActive ? "border-orange-600" : "border-blue-600"
                                } border-t-transparent rounded-full animate-spin`}
                              />
                            ) : (
                              <HiOutlineRefresh className="w-5 h-5" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(garage._id)}
                            disabled={isLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            {isActionLoading(garage._id, "delete") ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineArchive className="w-5 h-5" />
                            )}
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRestore(garage._id)}
                            disabled={isLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            {isActionLoading(garage._id, "restore") ? (
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineRefresh className="w-5 h-5" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(garage._id)}
                            disabled={isLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            {isActionLoading(garage._id, "delete") ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineTrash className="w-5 h-5" />
                            )}
                          </motion.button>
                        </>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedRow(isExpanded ? null : garage._id)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-auto"
                      >
                        <HiOutlineCog className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="text-gray-500">Contact:</span>
                              <p className="font-medium text-gray-900">{garage.contactInfo?.phone || "N/A"}</p>
                              <p className="text-xs text-gray-500">{garage.contactInfo?.email}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Full Address:</span>
                              {garage.address ? (
                                <p className="text-gray-700 mt-1">
                                  {garage.address.street}, {garage.address.city}
                                </p>
                              ) : (
                                <p className="text-gray-400 mt-1">No address</p>
                              )}
                            </div>
                            <div>
                              <span className="text-gray-500">Total Bookings:</span>
                              <span className="ml-2 font-semibold">{garage.stats?.totalBookings || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Reviews:</span>
                              <span className="ml-2 font-semibold">{garage.stats?.totalReviews || 0}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {!showComplete && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            {pagination ? (
              <>
                Page {pagination.page} of {pagination.pages} | Total {pagination.total} garages
              </>
            ) : (
              <>
                Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedGarages.length)} of{" "}
                {filteredAndSortedGarages.length} garages
              </>
            )}
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || bulkActionLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
            >
              Previous
            </motion.button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = currentPage;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={bulkActionLoading}
                    className={`w-10 h-10 rounded-lg text-sm font-medium ${
                      currentPage === pageNum ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || bulkActionLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
            >
              Next
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}