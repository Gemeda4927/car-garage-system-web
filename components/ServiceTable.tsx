"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineFire,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineTag,
  HiOutlineInformationCircle,
  HiOutlineStar,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineBadgeCheck,
  HiOutlineChartBar,
  HiOutlineRefresh,
  HiOutlineArchive,
} from "react-icons/hi";
import { Service, CategoryStat, Pagination } from "@/types/service.types";
import { HiOutlineBuildingOffice } from "react-icons/hi2";

interface Props {
  services: Service[];
  categoryStats?: CategoryStat[];
  pagination?: Pagination | null;
  loading?: boolean;
  error?: string | null;
  showDeleted?: boolean;
  onEdit?: (service: Service) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onToggleAvailability?: (id: string) => void;
  onViewDetails?: (service: Service) => void;
  onPageChange?: (page: number) => void;
  onRetry?: () => void;
}

// Format price in ETB
const formatETB = (price: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Get garage display info
const getGarageInfo = (service: Service) => {
  if (service.garage) {
    return {
      name: service.garage.name,
      location: service.garage.address?.city || 'Location not specified',
      phone: service.garage.contactInfo?.phone || 'No phone',
      email: service.garage.contactInfo?.email || 'No email',
      rating: service.garage.stats?.averageRating || 0,
      totalBookings: service.garage.stats?.totalBookings || 0,
      isVerified: service.garage.isVerified || false,
      isActive: service.garage.isActive || false,
      hasDetails: true,
    };
  }
  return {
    name: `ID: ${service.garageId?.slice(-6) || 'N/A'}`,
    location: 'Garage details not available',
    phone: 'N/A',
    email: 'N/A',
    rating: 0,
    totalBookings: 0,
    isVerified: false,
    isActive: false,
    hasDetails: false,
  };
};

export default function ServiceTable({
  services,
  categoryStats = [],
  pagination = null,
  loading = false,
  error = null,
  showDeleted = false,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onToggleAvailability,
  onViewDetails,
  onPageChange,
  onRetry,
}: Props) {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Loading state with enhanced animation
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full" />
            </motion.div>
          </div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-gray-800 mt-6"
          >
            Loading Services
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 mt-2"
          >
            Please wait while we fetch the latest data...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // Error state with enhanced animations
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12"
      >
        <div className="text-center max-w-md mx-auto">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <HiOutlineXCircle className="w-12 h-12 text-red-500" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Services</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry || (() => window.location.reload())}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Empty state with enhanced category stats
  if (!services || services.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12"
      >
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            {showDeleted ? (
              <HiOutlineArchive className="w-12 h-12 text-gray-400" />
            ) : (
              <HiOutlineEye className="w-12 h-12 text-gray-400" />
            )}
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {showDeleted ? "Trash is Empty" : "No Services Found"}
          </h3>
          <p className="text-gray-500 mb-8 text-lg">
            {showDeleted 
              ? "Deleted services will appear here. Move services to trash to see them."
              : "There are no services available at the moment."}
          </p>
          
          {/* Enhanced Category Stats Display */}
          {categoryStats.length > 0 && !showDeleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <HiOutlineTag className="w-6 h-6 text-orange-500" />
                <h4 className="text-xl font-semibold text-gray-700">Services by Category</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((stat, index) => (
                  <motion.div
                    key={stat._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-orange-700 capitalize text-lg">
                        {stat._id}
                      </span>
                      <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        {stat.count} {stat.count === 1 ? 'service' : 'services'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <HiOutlineCurrencyDollar className="w-4 h-4" />
                          Price Range:
                        </span>
                        <span className="font-semibold text-gray-800">
                          {formatETB(stat.minPrice)} - {formatETB(stat.maxPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Average:</span>
                        <span className="font-semibold text-orange-600">
                          {formatETB(stat.avgPrice)}
                        </span>
                      </div>
                      <div className="relative pt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>0</span>
                          <span>{formatETB(stat.maxPrice)}</span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stat.avgPrice / stat.maxPrice) * 100}%` }}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Pagination info */}
          {pagination && pagination.total > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <HiOutlineInformationCircle className="w-5 h-5" />
                <p>
                  <span className="font-bold">{pagination.total}</span> services exist in the system
                  {pagination.pages > 1 && ` across ${pagination.pages} pages`}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // Main table with enhanced UI
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Table Header with Stats Summary */}
      {categoryStats.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineChartBar className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-gray-700">Category Summary</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categoryStats.map((stat) => (
              <motion.div
                key={stat._id}
                whileHover={{ scale: 1.05 }}
                className="bg-white px-3 py-1.5 rounded-full border border-orange-200 shadow-sm"
              >
                <span className="text-sm capitalize font-medium text-gray-700">{stat._id}</span>
                <span className="text-xs text-gray-500 ml-2">({stat.count})</span>
                <span className="text-xs text-orange-600 ml-2 font-semibold">{formatETB(stat.avgPrice)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Service Details</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price (ETB)</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Garage Information</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Availability</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service, index) => {
              const garageInfo = getGarageInfo(service);
              const isExpanded = expandedService === service._id;
              const isHovered = hoveredRow === service._id;

              return (
                <motion.tr
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onHoverStart={() => setHoveredRow(service._id)}
                  onHoverEnd={() => setHoveredRow(null)}
                  className={`border-t border-gray-100 transition-all ${
                    isHovered ? 'bg-orange-50/50 shadow-md' : ''
                  } ${!service.isAvailable ? 'bg-gray-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{service.name}</p>
                        {service.images && service.images.length > 0 && (
                          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                            📸 {service.images.length}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 max-w-[250px] mt-1">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          ID: {service._id.slice(-6)}
                        </span>
                        {service.documents && service.documents.length > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            📄 {service.documents.length}
                          </span>
                        )}
                        {service.bookings && service.bookings.length > 0 && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            📅 {service.bookings.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200 shadow-sm">
                      {service.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 font-bold text-gray-800">
                      <HiOutlineCurrencyDollar className="w-4 h-4 text-green-600" />
                      <span>{formatETB(service.price)}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <HiOutlineClock className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <HiOutlineBuildingOffice className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-1">
                            <p className={`font-medium ${garageInfo.hasDetails ? 'text-gray-800' : 'text-gray-500'}`}>
                              {garageInfo.name}
                            </p>
                            {garageInfo.isVerified && (
                              <HiOutlineBadgeCheck className="w-4 h-4 text-blue-500" title="Verified Garage" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <HiOutlineLocationMarker className="w-3 h-3" />
                            {garageInfo.location}
                          </p>
                        </div>
                      </div>
                      
                      {garageInfo.hasDetails && (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-gray-500">
                            <HiOutlineStar className="w-3 h-3 text-yellow-500" />
                            <span>{garageInfo.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <HiOutlineChartBar className="w-3 h-3" />
                            <span>{garageInfo.totalBookings} bookings</span>
                          </div>
                        </div>
                      )}
                      
                      {isExpanded && garageInfo.hasDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 space-y-1 text-xs bg-gray-50 p-2 rounded-lg"
                        >
                          <div className="flex items-center gap-1">
                            <HiOutlinePhone className="w-3 h-3 text-gray-400" />
                            <span>{garageInfo.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HiOutlineMail className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{garageInfo.email}</span>
                          </div>
                        </motion.div>
                      )}
                      
                      {garageInfo.hasDetails && (
                        <button
                          onClick={() => setExpandedService(isExpanded ? null : service._id)}
                          className="text-xs text-orange-600 hover:text-orange-800 mt-1"
                        >
                          {isExpanded ? 'Show less' : 'Show contact'}
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                      service.isAvailable 
                        ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200" 
                        : "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}>
                      {service.isAvailable ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleAvailability?.(service._id)}
                      disabled={!service.isAvailable && !onToggleAvailability}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        service.isAvailable
                          ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200 hover:from-green-200 hover:to-green-100 shadow-sm hover:shadow"
                          : "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                      }`}
                    >
                      {service.isAvailable ? (
                        <>
                          <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                          Available
                        </>
                      ) : (
                        <>
                          <HiOutlineXCircle className="w-3.5 h-3.5" />
                          Unavailable
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {onViewDetails && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onViewDetails(service)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <HiOutlineEye size={18} />
                        </motion.button>
                      )}

                      {service.isAvailable && onEdit && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onEdit(service)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Service"
                        >
                          <HiOutlinePencil size={18} />
                        </motion.button>
                      )}

                      {service.isAvailable && onDelete && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(service._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                          title="Move to Trash"
                        >
                          <HiOutlineTrash size={18} />
                        </motion.button>
                      )}

                      {!service.isAvailable && onRestore && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRestore(service._id)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all"
                          title="Restore Service"
                        >
                          <HiOutlineFire size={18} />
                        </motion.button>
                      )}

                      {!service.isAvailable && onPermanentDelete && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onPermanentDelete(service._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Permanently"
                        >
                          <HiOutlineTrash size={18} />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/50"
        >
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-orange-600">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
            <span className="font-semibold text-orange-600">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-semibold text-orange-600">{pagination.total}</span> services
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1"
            >
              <HiOutlineRefresh className="w-4 h-4" />
              Previous
            </motion.button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === pagination.page;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`w-8 h-8 text-sm rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md font-semibold'
                        : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
              {pagination.pages > 5 && (
                <span className="px-2 text-gray-500 font-medium">...</span>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1"
            >
              Next
              <HiOutlineRefresh className="w-4 h-4 rotate-180" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}