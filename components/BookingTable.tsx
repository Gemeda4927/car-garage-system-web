import { useBookingStore } from "@/lib/store/booking.store";
import { BookingResponse, BookingStatus } from "@/lib/types/booking.types";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineStatusOnline, 
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineChevronDown,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineBan,
  HiOutlineClock as HiOutlineClockIcon,
  HiOutlineExclamation,
  HiOutlineCheck,
  HiOutlinePlay,
  HiOutlineStop
} from "react-icons/hi";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: {
      color: "bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700 border-amber-200",
      icon: HiOutlineClockIcon,
      label: "Pending",
      glow: "shadow-amber-100"
    },
    approved: {
      color: "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border-blue-200",
      icon: HiOutlineCheckCircle,
      label: "Approved",
      glow: "shadow-blue-100"
    },
    in_progress: {
      color: "bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border-purple-200",
      icon: HiOutlineRefresh,
      label: "In Progress",
      glow: "shadow-purple-100"
    },
    completed: {
      color: "bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200",
      icon: HiOutlineCheck,
      label: "Completed",
      glow: "shadow-emerald-100"
    },
    cancelled: {
      color: "bg-gradient-to-r from-rose-50 to-rose-100/50 text-rose-700 border-rose-200",
      icon: HiOutlineXCircle,
      label: "Cancelled",
      glow: "shadow-rose-100"
    },
    rejected: {
      color: "bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-700 border-gray-200",
      icon: HiOutlineBan,
      label: "Rejected",
      glow: "shadow-gray-100"
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: "bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-700 border-gray-200",
    icon: HiOutlineExclamation,
    label: status,
    glow: "shadow-gray-100"
  };

  const Icon = config.icon;

  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border shadow-sm ${config.color} ${config.glow}`}
    >
      <motion.div
        animate={status === 'in_progress' ? { rotate: 360 } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Icon className="w-3.5 h-3.5" />
      </motion.div>
      <span>{config.label}</span>
    </motion.span>
  );
};

// Action Modal for status updates
interface StatusUpdateModalProps {
  booking: BookingResponse;
  onClose: () => void;
  onConfirm: (status: BookingStatus, reason?: string) => Promise<void>;
  isLoading: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  booking,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BookingStatus.APPROVED);
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);

  const statusOptions = [
    { 
      value: BookingStatus.APPROVED, 
      label: "Approve", 
      icon: HiOutlineCheckCircle, 
      gradient: "from-blue-600 to-blue-700", 
      description: "Confirm and schedule the booking", 
      lightBg: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    { 
      value: BookingStatus.IN_PROGRESS, 
      label: "Start Progress", 
      icon: HiOutlineRefresh, 
      gradient: "from-purple-600 to-purple-700", 
      description: "Begin working on this booking", 
      lightBg: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    { 
      value: BookingStatus.COMPLETED, 
      label: "Complete", 
      icon: HiOutlineCheck, 
      gradient: "from-emerald-600 to-emerald-700", 
      description: "Mark as finished", 
      lightBg: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    { 
      value: BookingStatus.CANCELLED, 
      label: "Cancel", 
      icon: HiOutlineXCircle, 
      gradient: "from-rose-600 to-rose-700", 
      requiresReason: true, 
      description: "Cancel this booking", 
      lightBg: "bg-rose-50",
      iconColor: "text-rose-600"
    },
    { 
      value: BookingStatus.REJECTED, 
      label: "Reject", 
      icon: HiOutlineBan, 
      gradient: "from-gray-600 to-gray-700", 
      requiresReason: true, 
      description: "Reject the booking request", 
      lightBg: "bg-gray-50",
      iconColor: "text-gray-600"
    },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as BookingStatus;
    setSelectedStatus(value);
    setShowReason([BookingStatus.CANCELLED, BookingStatus.REJECTED].includes(value));
  };

  const handleSubmit = async () => {
    if (showReason && !reason.trim()) {
      alert("Please provide a reason");
      return;
    }
    await onConfirm(selectedStatus, reason || undefined);
  };

  const selectedOption = statusOptions.find(opt => opt.value === selectedStatus);
  const SelectedIcon = selectedOption?.icon || HiOutlineStatusOnline;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Header */}
        <div className={`bg-gradient-to-r ${selectedOption?.gradient || 'from-indigo-600 to-indigo-700'} px-6 py-5 relative overflow-hidden`}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ delay: 0.2 }}
            className="absolute inset-0 bg-white/20 rounded-full blur-3xl"
          />
          <div className="flex items-center justify-between relative z-10">
            <motion.h3 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-lg font-semibold text-white flex items-center gap-2"
            >
              <SelectedIcon className="w-5 h-5" />
              Update Booking Status
            </motion.h3>
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Booking Details Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <HiOutlineDocumentText className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="font-medium">Booking Details</span>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">Service</p>
                <p className="font-medium text-gray-900">{booking.service?.name || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">Customer</p>
                <p className="font-medium text-gray-900">{booking.carOwner?.name || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-medium text-gray-900">{new Date(booking.bookingDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">Time</p>
                <p className="font-medium text-gray-900">{booking.timeSlot?.start} - {booking.timeSlot?.end}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white shadow-sm"
              >
                {statusOptions.map((option) => {
                  const OptionIcon = option.icon;
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                })}
              </select>
              <SelectedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            {selectedOption && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-3 ${selectedOption.lightBg} rounded-xl flex items-start gap-2`}
              >
                <div className={`p-1 rounded-lg ${selectedOption.lightBg}`}>
                  <selectedOption.icon className={`w-4 h-4 ${selectedOption.iconColor}`} />
                </div>
                <p className="text-xs text-gray-600 flex-1">{selectedOption.description}</p>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {showReason && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm"
                  placeholder="Please provide a reason for this action..."
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
              disabled={isLoading}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-4 py-2.5 bg-gradient-to-r ${selectedOption?.gradient || 'from-indigo-600 to-indigo-700'} text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg flex items-center gap-2`}
            >
              {isLoading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <SelectedIcon className="w-4 h-4" />
                  Confirm Update
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Filter Bar Component
interface FilterBarProps {
  onFilterChange: (filters: { status?: string; garageId?: string }) => void;
  garages?: { id: string; name: string }[];
  showGarageFilter?: boolean;
  showStatusFilter?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onFilterChange,
  garages = [],
  showGarageFilter = false,
  showStatusFilter = false,
}) => {
  const [status, setStatus] = useState<string>("");
  const [garageId, setGarageId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    onFilterChange({ status: value || undefined, garageId: garageId || undefined });
  };

  const handleGarageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGarageId(value);
    onFilterChange({ status: status || undefined, garageId: value || undefined });
  };

  const clearFilters = () => {
    setStatus("");
    setGarageId("");
    onFilterChange({});
  };

  const hasActiveFilters = status || garageId;

  return (
    <motion.div 
      initial={false}
      animate={{ height: isExpanded ? 'auto' : '60px' }}
      className="mb-6 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={hasActiveFilters ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <HiOutlineFilter className={`w-5 h-5 ${hasActiveFilters ? 'text-indigo-600' : 'text-gray-400'}`} />
          </motion.div>
          <span className="font-medium text-gray-700">Filters</span>
          {hasActiveFilters && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium"
            >
              Active
            </motion.span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 pt-0 border-t border-gray-100"
          >
            <div className="flex flex-wrap gap-4">
              {showStatusFilter && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 min-w-[200px]"
                >
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Filter by Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={handleStatusChange}
                      className="w-full p-2.5 pl-9 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white shadow-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="approved">✅ Approved</option>
                      <option value="in_progress">🔄 In Progress</option>
                      <option value="completed">✓ Completed</option>
                      <option value="cancelled">✕ Cancelled</option>
                      <option value="rejected">⚠ Rejected</option>
                    </select>
                    <HiOutlineStatusOnline className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              )}

              {showGarageFilter && garages.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 min-w-[200px]"
                >
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Filter by Garage
                  </label>
                  <div className="relative">
                    <select
                      value={garageId}
                      onChange={handleGarageChange}
                      className="w-full p-2.5 pl-9 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white shadow-sm"
                    >
                      <option value="">All Garages</option>
                      {garages.map((garage) => (
                        <option key={garage.id} value={garage.id}>
                          {garage.name}
                        </option>
                      ))}
                    </select>
                    <HiOutlineOfficeBuilding className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              )}

              {hasActiveFilters && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-end"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <HiOutlineX className="w-4 h-4" />
                    Clear Filters
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main BookingTable Component
const BookingTable: React.FC<BookingTableProps> = ({
  bookings: propBookings,
  onEdit,
  onDelete,
  onStatusChange,
  showGarageFilter = false,
  showStatusFilter = false,
  isLoading: propIsLoading = false,
  filterParams,
}) => {
  const {
    bookings: storeBookings,
    isLoading: storeIsLoading,
    error,
    updateBookingStatus,
    deleteBooking: storeDeleteBooking,
    getAllBookings,
    clearError
  } = useBookingStore();

  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [localFilters, setLocalFilters] = useState<{ status?: string; garageId?: string }>({});
  const [filteredBookings, setFilteredBookings] = useState<BookingResponse[]>([]);

  const bookings = propBookings || storeBookings;
  const isLoading = propIsLoading || storeIsLoading;

  useEffect(() => {
    if (!propBookings) {
      getAllBookings(filterParams);
    }
  }, [getAllBookings, filterParams, propBookings]);

  useEffect(() => {
    if (error) {
      alert(`Error: ${error}`);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    let filtered = [...bookings];

    if (localFilters.status) {
      filtered = filtered.filter(b => b.status === localFilters.status);
    }

    if (localFilters.garageId) {
      filtered = filtered.filter(b => b.garage?._id === localFilters.garageId);
    }

    setFilteredBookings(filtered);
  }, [bookings, localFilters]);

  const handleStatusClick = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async (status: BookingStatus, reason?: string) => {
    if (selectedBooking) {
      const updatedBooking = await updateBookingStatus(selectedBooking._id, status, reason);
      if (updatedBooking) {
        setShowStatusModal(false);
        setSelectedBooking(null);
        onStatusChange?.(updatedBooking);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      const success = await storeDeleteBooking(id);
      if (success) {
        onDelete?.(id);
      }
    }
  };

  const handleFilterChange = (newFilters: { status?: string; garageId?: string }) => {
    setLocalFilters(newFilters);
  };

  const uniqueGarages = useMemo(() => {
    const garageMap = new Map();
    bookings.forEach(b => {
      if (b.garage) {
        garageMap.set(b.garage._id, { id: b.garage._id, name: b.garage.name });
      }
    });
    return Array.from(garageMap.values());
  }, [bookings]);

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-64 gap-4"
      >
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full shadow-lg" />
          </motion.div>
        </div>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 font-medium"
        >
          Loading bookings...
        </motion.p>
      </motion.div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-gray-200 shadow-sm"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-28 h-28 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100"
        >
          <HiOutlineCalendar className="w-14 h-14 text-indigo-400" />
        </motion.div>
        <motion.h3 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-semibold text-gray-700 mb-2"
        >
          No bookings found
        </motion.h3>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 mb-8"
        >
          Bookings will appear here once created.
        </motion.p>
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.2)" }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-xl transition-all font-medium shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto"
        >
          <HiOutlineSparkles className="w-5 h-5" />
          Create New Booking
        </motion.button>
      </motion.div>
    );
  }

  return (
    <>
      {(showGarageFilter || showStatusFilter) && (
        <FilterBar
          onFilterChange={handleFilterChange}
          garages={uniqueGarages}
          showGarageFilter={showGarageFilter}
          showStatusFilter={showStatusFilter}
        />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-white">
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Garage</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <AnimatePresence>
                {filteredBookings.map((booking, index) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "#f9fafb", scale: 1.002 }}
                    className="transition-all duration-200 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center mr-3 group-hover:shadow-md transition-all"
                        >
                          <HiOutlineDocumentText className="w-5 h-5 text-indigo-600" />
                        </motion.div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {booking.service?.name || "N/A"}
                          </div>
                          {booking.notes && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"
                            >
                              <span className="inline-block w-1 h-1 rounded-full bg-indigo-400"></span>
                              {booking.notes}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-gray-100 rounded-lg mr-2 group-hover:bg-white transition-colors">
                          <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.garage?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{booking.garage?.address?.city || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-gray-100 rounded-lg mr-2 group-hover:bg-white transition-colors">
                          <HiOutlineUser className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.carOwner?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{booking.carOwner?.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-gray-100 rounded-lg mr-2 group-hover:bg-white transition-colors">
                          <HiOutlineCalendar className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <HiOutlineClock className="w-3 h-3" />
                            {booking.timeSlot?.start} - {booking.timeSlot?.end}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.vehicleInfo ? (
                        <motion.div 
                          whileHover={{ x: 2 }}
                          className="text-sm font-medium text-gray-900"
                        >
                          {booking.vehicleInfo.make} {booking.vehicleInfo.model}
                          <div className="text-xs text-gray-500 font-normal">
                            {booking.vehicleInfo.year} • {booking.vehicleInfo.licensePlate}
                          </div>
                        </motion.div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        {onEdit && (
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEdit(booking)}
                            className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-blue-100"
                            title="Edit booking"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleStatusClick(booking)}
                          className="p-2 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all shadow-sm hover:shadow-purple-100"
                          title="Update status"
                        >
                          <HiOutlineStatusOnline className="w-4 h-4" />
                        </motion.button>

                        {onDelete && (
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(booking._id)}
                            className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all shadow-sm hover:shadow-rose-100"
                            title="Delete booking"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </motion.button>
                        )}
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {filteredBookings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-t border-gray-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">
                  {filteredBookings.length}
                </span>
                <span className="text-gray-500">of</span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold">
                  {bookings.length}
                </span>
                <span className="text-gray-600 font-medium">bookings shown</span>
              </motion.div>
              
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-sm text-amber-700 font-medium">Pending: {bookings.filter(b => b.status === 'pending').length}</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm text-emerald-700 font-medium">Completed: {bookings.filter(b => b.status === 'completed').length}</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-sm text-rose-700 font-medium">Cancelled: {bookings.filter(b => b.status === 'cancelled').length}</span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedBooking && (
          <StatusUpdateModal
            booking={selectedBooking}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedBooking(null);
            }}
            onConfirm={handleStatusConfirm}
            isLoading={storeIsLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingTable;