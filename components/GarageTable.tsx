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
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineCog,
  HiOutlineTrash,
  HiOutlineArchive,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineSearch,
} from "react-icons/hi";

import {
  HiOutlineBuildingOffice,
  HiOutlineBuildingStorefront,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineWrench,
} from "react-icons/hi2";

import type { PopulatedGarage } from "@/lib/types/garage.types";

// Import your hook
import { useGarage } from "@/lib/hooks/useGarage";

interface GarageTableProps {
  garages?: PopulatedGarage[] | null;
  loading?: boolean;
  error?: string | null;
  showDeleted?: boolean;
  
  // Optional callbacks if you want to override hook methods
  onVerify?: (id: string) => Promise<void>;
  onToggleActive?: (id: string) => Promise<void>;
  onFeature?: (id: string) => Promise<void>;
  onViewDetails?: (garage: PopulatedGarage) => void;
  onRestore?: (id: string) => Promise<void>;
  onPermanentDelete?: (id: string) => Promise<void>;
}

type SortField = "name" | "createdAt" | "rating" | "bookings" | "status";
type SortOrder = "asc" | "desc";

// Helper function to format price in ETB
const formatETB = (price: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function GarageTable({
  garages: propGarages,
  loading: propLoading,
  error: propError,
  showDeleted = false,
  onVerify: propOnVerify,
  onToggleActive: propOnToggleActive,
  onFeature: propOnFeature,
  onViewDetails: propOnViewDetails,
  onRestore: propOnRestore,
  onPermanentDelete: propOnPermanentDelete,
}: GarageTableProps) {
  // Use the garage hook
  const {
    garages: hookGarages,
    loading: hookLoading,
    error: hookError,
    updateGarage,
    deleteGarage,
    restoreGarage,
    hardDeleteGarage,
    fetchGarages,
    fetchDeletedGarages,
  } = useGarage();

  // Use either props or hook data
  const garages = propGarages ?? hookGarages;
  const loading = propLoading ?? hookLoading;
  const error = propError ?? hookError;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGarages, setSelectedGarages] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Loading states for individual actions
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Refresh data when showDeleted changes
  useEffect(() => {
    if (showDeleted) {
      fetchDeletedGarages();
    } else {
      fetchGarages({});
    }
  }, [showDeleted, fetchDeletedGarages, fetchGarages]);

  const garageList = useMemo(() => {
    if (!Array.isArray(garages)) return [];
    return garages;
  }, [garages]);

  // Filter and sort garages
  const filteredAndSortedGarages = useMemo(() => {
    let filtered = [...garageList];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((garage) => {
        const ownerName = typeof garage.owner === "object" ? garage.owner?.name || "" : "";
        return (
          garage.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.address?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ownerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter (only for non-deleted view)
    if (!showDeleted && statusFilter !== "all") {
      filtered = filtered.filter((garage) => {
        if (statusFilter === "verified") return garage.isVerified;
        if (statusFilter === "unverified") return !garage.isVerified;
        if (statusFilter === "active") return garage.isActive;
        if (statusFilter === "inactive") return !garage.isActive;
        return true;
      });
    }

    // Apply sorting
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
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [garageList, searchTerm, sortField, sortOrder, statusFilter, showDeleted]);

  // Pagination
  const paginatedGarages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedGarages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedGarages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedGarages.length / itemsPerPage);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedGarages.length === paginatedGarages.length) {
      setSelectedGarages([]);
    } else {
      setSelectedGarages(paginatedGarages.map((g) => g._id));
    }
  };

  // Handle select single
  const handleSelectGarage = (id: string) => {
    setSelectedGarages((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  // Generic action handler with loading state
  const handleAction = async (
    action: string,
    id: string,
    garage?: PopulatedGarage
  ) => {
    // Set loading state for this specific action and garage
    setActionLoading(prev => ({ ...prev, [id]: action }));

    try {
      switch (action) {
        case "view":
          if (propOnViewDetails) {
            propOnViewDetails(garage!);
          } else {
            // Just show a toast with garage info
            toast.success(
              <div>
                <strong>{garage?.name}</strong>
                <p className="text-sm">{garage?.description || "No description"}</p>
              </div>,
              { duration: 5000 }
            );
          }
          break;

        case "verify":
          if (propOnVerify) {
            await propOnVerify(id);
          } else {
            // Use the updateGarage method from hook
            await updateGarage(id, { isVerified: true });
            // Refresh the list
            if (showDeleted) {
              await fetchDeletedGarages();
            } else {
              await fetchGarages({});
            }
          }
          toast.success("Garage verified successfully");
          break;

        case "toggle":
          if (propOnToggleActive) {
            await propOnToggleActive(id);
          } else {
            // Use the toggle-active endpoint
            await updateGarage(id, { isActive: !garage?.isActive });
            // Refresh the list
            if (showDeleted) {
              await fetchDeletedGarages();
            } else {
              await fetchGarages({});
            }
          }
          toast.success(`Garage ${garage?.isActive ? "deactivated" : "activated"} successfully`);
          break;

        case "feature":
          if (propOnFeature) {
            await propOnFeature(id);
          } else {
            // You might need to add this to your garage type
            toast.success(`✨ ${garage?.name} featured! (Demo feature)`);
          }
          break;

        case "restore":
          if (propOnRestore) {
            await propOnRestore(id);
          } else {
            await restoreGarage(id);
            await fetchDeletedGarages(); // Refresh deleted list
          }
          toast.success("Garage restored successfully");
          break;

        case "delete":
          if (showDeleted) {
            // Permanent delete
            if (propOnPermanentDelete) {
              await propOnPermanentDelete(id);
            } else {
              await hardDeleteGarage(id);
              await fetchDeletedGarages(); // Refresh deleted list
            }
            toast.success("Garage permanently deleted");
          } else {
            // Soft delete
            if (propOnPermanentDelete) {
              await propOnPermanentDelete(id);
            } else {
              await deleteGarage(id);
              await fetchGarages({}); // Refresh active list
            }
            toast.success("Garage moved to trash");
          }
          break;
      }
    } catch (error: any) {
      console.error(`Error ${action} garage:`, error);
      toast.error(error?.response?.data?.message || error?.message || `Failed to ${action} garage`);
    } finally {
      // Clear loading state
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  // Bulk actions
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
            await updateGarage(id, { isVerified: true });
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      // Refresh the list
      if (showDeleted) {
        await fetchDeletedGarages();
      } else {
        await fetchGarages({});
      }

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

  const handleBulkToggleActive = async () => {
    if (selectedGarages.length === 0) {
      toast.error("No garages selected");
      return;
    }

    const action = showDeleted ? "restore" : "toggle status";
    const confirmed = window.confirm(`Update ${selectedGarages.length} selected garages?`);
    if (!confirmed) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await Promise.all(
        selectedGarages.map(async (id) => {
          try {
            const garage = garageList.find(g => g._id === id);
            
            if (showDeleted) {
              await restoreGarage(id);
            } else {
              await updateGarage(id, { isActive: !garage?.isActive });
            }
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      // Refresh the list
      if (showDeleted) {
        await fetchDeletedGarages();
      } else {
        await fetchGarages({});
      }

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
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedGarages.length} garages?`
    );
    if (!confirmed) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await Promise.all(
        selectedGarages.map(async (id) => {
          try {
            if (showDeleted) {
              await hardDeleteGarage(id);
            } else {
              await deleteGarage(id);
            }
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      // Refresh the list
      if (showDeleted) {
        await fetchDeletedGarages();
      } else {
        await fetchGarages({});
      }

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

  // Check if an action is loading for a specific garage
  const isActionLoading = (id: string, action: string) => {
    return actionLoading[id] === action;
  };

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
          <p className="mt-4 text-gray-600 font-medium">Loading garages...</p>
          <p className="text-sm text-gray-400">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

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
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (garageList.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-16">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl mb-6">
            <HiOutlineBuildingStorefront className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {showDeleted ? "Trash is empty" : "No garages found"}
          </h3>
          <p className="text-gray-500 mb-6 text-sm">
            {showDeleted
              ? "Deleted garages will appear here"
              : "Get started by adding your first garage to the platform"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${showDeleted ? "deleted" : ""} garages...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-80 xl:w-96 pl-12 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Filters - Only show for active view */}
          {!showDeleted && (
            <div className="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
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
              </select>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedGarages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-200 rounded-full flex items-center justify-center">
                  <span className="text-xs md:text-sm font-semibold text-indigo-700">
                    {selectedGarages.length}
                  </span>
                </div>
                <span className="text-sm md:text-base font-medium text-gray-700">garages selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {!showDeleted && (
                  <>
                    <button
                      onClick={handleBulkVerify}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineCheckCircle className="w-4 h-4" />
                      )}
                      <span className="hidden xs:inline">Verify All</span>
                    </button>
                    <button
                      onClick={handleBulkToggleActive}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineRefresh className="w-4 h-4" />
                      )}
                      <span className="hidden xs:inline">Toggle All</span>
                    </button>
                  </>
                )}
                {showDeleted ? (
                  <>
                    <button
                      onClick={handleBulkToggleActive}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineRefresh className="w-4 h-4" />
                      )}
                      <span className="hidden xs:inline">Restore All</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineTrash className="w-4 h-4" />
                      )}
                      <span className="hidden xs:inline">Delete All</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkActionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiOutlineArchive className="w-4 h-4" />
                    )}
                    <span className="hidden xs:inline">Trash All</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedGarages([])}
                  disabled={bulkActionLoading}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs md:text-sm disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats Summary - Only show for active view */}
      {!showDeleted && (
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-max md:min-w-0">
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
                    {garageList.filter(g => g.isVerified).length}
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
                    {garageList.filter(g => g.isActive).length}
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
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {(garageList.reduce((acc, g) => acc + (g.stats?.averageRating || 0), 0) / garageList.length || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedGarages.length === paginatedGarages.length && paginatedGarages.length > 0}
                    onChange={handleSelectAll}
                    disabled={bulkActionLoading}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
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

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {paginatedGarages.map((garage, index) => {
                  const owner = typeof garage.owner === "object" ? garage.owner : null;
                  const isSelected = selectedGarages.includes(garage._id);
                  const isLoading = isActionLoading(garage._id, 'verify') || 
                                   isActionLoading(garage._id, 'toggle') ||
                                   isActionLoading(garage._id, 'feature') ||
                                   isActionLoading(garage._id, 'delete') ||
                                   isActionLoading(garage._id, 'restore');

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
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectGarage(garage._id)}
                          disabled={bulkActionLoading || isLoading}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                      </td>

                      {/* Garage Details */}
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
                              onClick={() => handleAction("view", garage._id, garage)}
                              className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-left"
                            >
                              {garage.name}
                            </button>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                ID: {garage._id.slice(-6)}
                              </span>
                              {garage.stats?.averageRating > 0 && (
                                <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                                  <HiOutlineStar className="w-3 h-3" />
                                  {garage.stats.averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-6 py-4">
                        {owner ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                              <HiOutlineUser className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate max-w-[120px]">
                                {owner.name}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[120px]">
                                <HiOutlineMail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{owner.email}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        {garage.address ? (
                          <div className="flex items-start gap-2">
                            <HiOutlineMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm text-gray-900 truncate max-w-[120px]">
                                {garage.address.street}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                {garage.address.city}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No address</span>
                        )}
                      </td>

                      {/* Services */}
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
                                {formatETB(Math.min(...garage.services.map(s => s.price)))}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="px-6 py-4">
                        <div className="space-y-2 min-w-[100px]">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Bookings</span>
                            <span className="font-semibold text-gray-900">
                              {garage.stats?.totalBookings || 0}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                              style={{
                                width: `${Math.min(
                                  ((garage.stats?.completedBookings || 0) /
                                    (garage.stats?.totalBookings || 1)) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <HiOutlineCheckCircle className="w-3 h-3 text-green-500" />
                            {garage.stats?.completedBookings || 0} completed
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                garage.isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                garage.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {garage.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                garage.isVerified ? "bg-blue-500" : "bg-yellow-500"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                garage.isVerified
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {garage.isVerified ? "Verified" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction("view", garage._id, garage)}
                            disabled={isLoading}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View Details"
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </motion.button>

                          {!showDeleted ? (
                            <>
                              {!garage.isVerified && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAction("verify", garage._id, garage)}
                                  disabled={isLoading}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
                                  title="Verify Garage"
                                >
                                  {isActionLoading(garage._id, 'verify') ? (
                                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                  )}
                                </motion.button>
                              )}

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction("toggle", garage._id, garage)}
                                disabled={isLoading}
                                className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                  garage.isActive
                                    ? "text-orange-600 hover:bg-orange-50"
                                    : "text-blue-600 hover:bg-blue-50"
                                }`}
                                title={garage.isActive ? "Deactivate" : "Activate"}
                              >
                                {isActionLoading(garage._id, 'toggle') ? (
                                  <div className={`w-5 h-5 border-2 ${garage.isActive ? 'border-orange-600' : 'border-blue-600'} border-t-transparent rounded-full animate-spin`} />
                                ) : (
                                  <HiOutlineRefresh className="w-5 h-5" />
                                )}
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction("feature", garage._id, garage)}
                                disabled={isLoading}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Feature Garage"
                              >
                                {isActionLoading(garage._id, 'feature') ? (
                                  <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <HiOutlineStar className="w-5 h-5" />
                                )}
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction("delete", garage._id, garage)}
                                disabled={isLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Garage"
                              >
                                {isActionLoading(garage._id, 'delete') ? (
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
                                onClick={() => handleAction("restore", garage._id, garage)}
                                disabled={isLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Restore Garage"
                              >
                                {isActionLoading(garage._id, 'restore') ? (
                                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <HiOutlineRefresh className="w-5 h-5" />
                                )}
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction("delete", garage._id, garage)}
                                disabled={isLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Permanently Delete"
                              >
                                {isActionLoading(garage._id, 'delete') ? (
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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        <AnimatePresence>
          {paginatedGarages.map((garage, index) => {
            const owner = typeof garage.owner === "object" ? garage.owner : null;
            const isSelected = selectedGarages.includes(garage._id);
            const isExpanded = expandedRow === garage._id;
            const isLoading = isActionLoading(garage._id, 'verify') || 
                             isActionLoading(garage._id, 'toggle') ||
                             isActionLoading(garage._id, 'feature') ||
                             isActionLoading(garage._id, 'delete') ||
                             isActionLoading(garage._id, 'restore');

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
                {/* Card Header */}
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
                            onClick={() => handleAction("view", garage._id, garage)}
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-left"
                          >
                            {garage.name}
                          </button>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ID: {garage._id.slice(-8)}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectGarage(garage._id)}
                          disabled={bulkActionLoading || isLoading}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ml-2 disabled:opacity-50"
                        />
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="flex items-center gap-3 mt-2">
                        {garage.stats?.averageRating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                            <HiOutlineStar className="w-3 h-3" />
                            {garage.stats.averageRating.toFixed(1)}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          garage.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {garage.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          garage.isVerified
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {garage.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <HiOutlineUser className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {owner?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineMapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {garage.address?.city || "No location"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineWrench className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {garage.services?.length || 0} services
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineCurrencyDollar className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600 font-medium">
                        {garage.services?.length > 0 
                          ? formatETB(Math.min(...garage.services.map(s => s.price)))
                          : "N/A"
                        }
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction("view", garage._id, garage)}
                      disabled={isLoading}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50"
                    >
                      <HiOutlineEye className="w-5 h-5" />
                    </motion.button>

                    {!showDeleted ? (
                      <>
                        {!garage.isVerified && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction("verify", garage._id, garage)}
                            disabled={isLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                          >
                            {isActionLoading(garage._id, 'verify') ? (
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineCheckCircle className="w-5 h-5" />
                            )}
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction("toggle", garage._id, garage)}
                          disabled={isLoading}
                          className={`p-2 rounded-lg disabled:opacity-50 ${
                            garage.isActive
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          {isActionLoading(garage._id, 'toggle') ? (
                            <div className={`w-5 h-5 border-2 ${garage.isActive ? 'border-orange-600' : 'border-blue-600'} border-t-transparent rounded-full animate-spin`} />
                          ) : (
                            <HiOutlineRefresh className="w-5 h-5" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction("feature", garage._id, garage)}
                          disabled={isLoading}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg disabled:opacity-50"
                        >
                          {isActionLoading(garage._id, 'feature') ? (
                            <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <HiOutlineStar className="w-5 h-5" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction("delete", garage._id, garage)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          {isActionLoading(garage._id, 'delete') ? (
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
                          onClick={() => handleAction("restore", garage._id, garage)}
                          disabled={isLoading}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                        >
                          {isActionLoading(garage._id, 'restore') ? (
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <HiOutlineRefresh className="w-5 h-5" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction("delete", garage._id, garage)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          {isActionLoading(garage._id, 'delete') ? (
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
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-auto disabled:opacity-50"
                    >
                      <HiOutlineCog className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Expanded Content */}
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
                            <span className="text-gray-500">Description:</span>
                            <p className="text-gray-700 mt-1">{garage.description || "No description"}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-gray-500">Contact:</span>
                              <p className="font-medium text-gray-900">{garage.contactInfo?.phone || "N/A"}</p>
                              <p className="text-xs text-gray-500">{garage.contactInfo?.email}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Created:</span>
                              <p className="font-medium text-gray-900">
                                {new Date(garage.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-500">Full Address:</span>
                            {garage.address ? (
                              <p className="text-gray-700 mt-1">
                                {garage.address.street}, {garage.address.city}, {garage.address.state}, {garage.address.country}
                              </p>
                            ) : (
                              <p className="text-gray-400 mt-1">No address provided</p>
                            )}
                          </div>

                          <div>
                            <span className="text-gray-500">Services:</span>
                            {garage.services && garage.services.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                {garage.services.slice(0, 3).map((service) => (
                                  <div key={service._id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg">
                                    <span>{service.name}</span>
                                    <span className="font-semibold text-indigo-600">
                                      {formatETB(service.price)}
                                    </span>
                                  </div>
                                ))}
                                {garage.services.length > 3 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{garage.services.length - 3} more services
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-400 mt-1">No services listed</p>
                            )}
                          </div>

                          <div>
                            <span className="text-gray-500">Performance:</span>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Total Bookings</span>
                                <span className="font-semibold">{garage.stats?.totalBookings || 0}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Completed</span>
                                <span className="font-semibold text-green-600">{garage.stats?.completedBookings || 0}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Cancelled</span>
                                <span className="font-semibold text-red-600">{garage.stats?.cancelledBookings || 0}</span>
                              </div>
                            </div>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedGarages.length)} of{" "}
            {filteredAndSortedGarages.length} garages
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || bulkActionLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
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
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || bulkActionLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
            >
              Next
            </motion.button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-400">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}