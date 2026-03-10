// src/components/PaymentTable.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlinePrinter,
  HiOutlineReceiptRefund,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineSparkles,
  HiOutlineFingerPrint,
  HiOutlineQrcode,
  HiOutlineChat,
  HiOutlinePhone,
  HiOutlineGlobe,
  HiOutlineDeviceMobile,
  HiOutlineLocationMarker,
  HiOutlineTag,
  HiOutlineGift,
  HiOutlineStar,
  HiOutlineFire,
  HiOutlineLightningBolt,
  HiOutlineHeart,
  HiOutlineEmojiHappy,
} from "react-icons/hi";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal, FaApple, FaGooglePay } from "react-icons/fa";
import { SiAlipay, SiWechat } from "react-icons/si";
import toast from "react-hot-toast";
import { Payment, PaymentStatus, PaymentType } from "@/lib/types/payment.type";

interface PaymentTableProps {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  onViewDetails?: (payment: Payment) => void;
  onVerify?: (paymentId: string) => Promise<void>;
  onRefund?: (paymentId: string) => Promise<void>;
  onExport?: (payments: Payment[]) => void;
  onPrint?: (payment: Payment) => void;
}

// Enhanced payment type with additional fields for better UX
interface EnhancedPayment extends Payment {
  riskScore?: number;
  deviceInfo?: string;
  location?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const PaymentTable = ({
  payments,
  loading,
  error,
  onViewDetails,
  onVerify,
  onRefund,
  onExport,
  onPrint,
}: PaymentTableProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PaymentType | "all">("all");
  const [sortField, setSortField] = useState<keyof Payment>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");
  const [showStats, setShowStats] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const tableRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to clear selection
      if (e.key === "Escape") {
        setSelectedRows([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter and sort payments with enhanced filtering
  const filteredPayments = useMemo(() => {
    let filtered = [...payments] as EnhancedPayment[];

    // Apply search with fuzzy matching
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.user?.name?.toLowerCase().includes(searchLower) ||
          p.user?.email?.toLowerCase().includes(searchLower) ||
          p.transactionId?.toLowerCase().includes(searchLower) ||
          p._id.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.paymentMethod?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((p) => p.paymentType === typeFilter);
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter((p) => new Date(p.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter((p) => new Date(p.createdAt) <= new Date(dateRange.end));
    }

    // Apply amount range filter
    if (minAmount !== "") {
      filtered = filtered.filter((p) => p.amount >= minAmount);
    }
    if (maxAmount !== "") {
      filtered = filtered.filter((p) => p.amount <= maxAmount);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle nested objects
      if (sortField === "user") {
        aValue = a.user?.name || "";
        bValue = b.user?.name || "";
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [payments, searchTerm, statusFilter, typeFilter, sortField, sortDirection, dateRange, minAmount, maxAmount]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const completed = filteredPayments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0);
    const pending = filteredPayments.filter(p => p.status === PaymentStatus.PENDING).reduce((sum, p) => sum + p.amount, 0);
    const failed = filteredPayments.filter(p => p.status === PaymentStatus.FAILED).reduce((sum, p) => sum + p.amount, 0);
    const refunded = filteredPayments.filter(p => p.status === PaymentStatus.REFUNDED).reduce((sum, p) => sum + p.amount, 0);
    
    return {
      total,
      completed,
      pending,
      failed,
      refunded,
      count: filteredPayments.length,
      avgAmount: filteredPayments.length > 0 ? total / filteredPayments.length : 0,
    };
  }, [filteredPayments]);

  // Get status badge with enhanced design
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-500",
          text: "text-white",
          icon: HiOutlineCheckCircle,
          label: "Completed",
          shadow: "shadow-lg shadow-green-500/20",
        };
      case PaymentStatus.PENDING:
        return {
          bg: "bg-gradient-to-r from-yellow-500 to-amber-500",
          text: "text-white",
          icon: HiOutlineClock,
          label: "Pending",
          shadow: "shadow-lg shadow-yellow-500/20",
        };
      case PaymentStatus.FAILED:
        return {
          bg: "bg-gradient-to-r from-red-500 to-rose-500",
          text: "text-white",
          icon: HiOutlineXCircle,
          label: "Failed",
          shadow: "shadow-lg shadow-red-500/20",
        };
      case PaymentStatus.REFUNDED:
        return {
          bg: "bg-gradient-to-r from-purple-500 to-pink-500",
          text: "text-white",
          icon: HiOutlineCash,
          label: "Refunded",
          shadow: "shadow-lg shadow-purple-500/20",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-slate-500",
          text: "text-white",
          icon: HiOutlineDocumentText,
          label: status,
          shadow: "shadow-lg shadow-gray-500/20",
        };
    }
  };

  // Get payment type badge with enhanced design
  const getTypeBadge = (type: PaymentType) => {
    switch (type) {
      case PaymentType.BOOKING:
        return {
          bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
          text: "text-white",
          icon: HiOutlineCreditCard,
          label: "Booking",
          shadow: "shadow-lg shadow-blue-500/20",
        };
      case PaymentType.SUBSCRIPTION:
        return {
          bg: "bg-gradient-to-r from-purple-500 to-violet-500",
          text: "text-white",
          icon: HiOutlineRefresh,
          label: "Subscription",
          shadow: "shadow-lg shadow-purple-500/20",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-slate-500",
          text: "text-white",
          icon: HiOutlineCash,
          label: type,
          shadow: "shadow-lg shadow-gray-500/20",
        };
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "visa":
        return <FaCcVisa className="w-5 h-5 text-blue-600" />;
      case "mastercard":
        return <FaCcMastercard className="w-5 h-5 text-red-600" />;
      case "amex":
        return <FaCcAmex className="w-5 h-5 text-blue-800" />;
      case "paypal":
        return <FaCcPaypal className="w-5 h-5 text-blue-700" />;
      case "apple pay":
        return <FaApple className="w-5 h-5 text-gray-800" />;
      case "google pay":
        return <FaGooglePay className="w-5 h-5 text-blue-500" />;
      case "alipay":
        return <SiAlipay className="w-5 h-5 text-blue-600" />;
      case "wechat pay":
        return <SiWechat className="w-5 h-5 text-green-600" />;
      default:
        return <HiOutlineCreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format currency with animation
  const formatCurrency = (amount: number, animate = false) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return animate ? (
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {formatted}
      </motion.span>
    ) : formatted;
  };

  // Format date with relative time
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.length === filteredPayments.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredPayments.map(p => p._id));
    }
  };

  // Handle row select
  const handleRowSelect = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: "verify" | "refund" | "export") => {
    if (selectedRows.length === 0) return;

    const selectedPayments = payments.filter(p => selectedRows.includes(p._id));

    switch (action) {
      case "verify":
        for (const payment of selectedPayments) {
          if (payment.status === PaymentStatus.PENDING && onVerify) {
            await onVerify(payment._id);
          }
        }
        toast.success(`Verified ${selectedRows.length} payments`);
        break;
      case "refund":
        for (const payment of selectedPayments) {
          if (payment.status === PaymentStatus.COMPLETED && onRefund) {
            await onRefund(payment._id);
          }
        }
        toast.success(`Refunded ${selectedRows.length} payments`);
        break;
      case "export":
        if (onExport) {
          onExport(selectedPayments);
        }
        break;
    }
    setSelectedRows([]);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
            }}
            className="w-20 h-20 mb-6"
          >
            <div className="w-full h-full border-4 border-indigo-600 border-t-transparent rounded-full" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-lg font-medium"
          >
            Loading your payments...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gray-400 text-sm mt-2"
          >
            This will just take a moment
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="text-center py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <HiOutlineExclamationCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Payments</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (payments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="text-center py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <HiOutlineCash className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Payments Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            There are no payment records to display. New payments will appear here when they're created.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Clear Filters
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Payment Transactions</h2>
              <p className="text-indigo-100 text-sm">Manage and monitor all payment activities</p>
            </div>
          </div>
          
          {/* Quick stats toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
          >
            <HiOutlineTrendingUp className="w-4 h-4" />
            {showStats ? "Hide Stats" : "Show Stats"}
          </motion.button>
        </div>
      </div>

      {/* Statistics Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-100 bg-gray-50/50"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Total Payments</p>
                    <HiOutlineCurrencyDollar className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.total)}</p>
                  <p className="text-xs text-gray-400 mt-1">{statistics.count} transactions</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Completed</p>
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(statistics.completed)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {((statistics.completed / statistics.total) * 100).toFixed(1)}% of total
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Pending</p>
                    <HiOutlineClock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(statistics.pending)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {((statistics.pending / statistics.total) * 100).toFixed(1)}% of total
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Average Amount</p>
                    <HiOutlineTrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(statistics.avgAmount)}</p>
                  <p className="text-xs text-gray-400 mt-1">per transaction</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Actions */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col gap-4">
          {/* Search and view toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by user, transaction ID... (Ctrl+F)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white"
              />
              {searchTerm && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <HiOutlineXCircle className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                  showFilters
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-500"
                }`}
              >
                <HiOutlineFilter className="w-5 h-5" />
                Filters
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
                className="px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 transition-all duration-300 flex items-center gap-2"
              >
                {viewMode === "table" ? (
                  <>
                    <HiOutlineDocumentText className="w-5 h-5" />
                    Grid View
                  </>
                ) : (
                  <>
                    <HiOutlineCreditCard className="w-5 h-5" />
                    Table View
                  </>
                )}
              </motion.button>

              {selectedRows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction("verify")}
                    className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <HiOutlineCheckCircle className="w-5 h-5" />
                    Verify ({selectedRows.length})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction("refund")}
                    className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <HiOutlineReceiptRefund className="w-5 h-5" />
                    Refund ({selectedRows.length})
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Advanced filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="all">All Status</option>
                      {Object.values(PaymentStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as PaymentType | "all")}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="all">All Types</option>
                      {Object.values(PaymentType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Min Amount</label>
                    <input
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : "")}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Max Amount</label>
                    <input
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : "")}
                      placeholder="1000.00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setStatusFilter("all");
                        setTypeFilter("all");
                        setMinAmount("");
                        setMaxAmount("");
                        setDateRange({ start: "", end: "" });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300"
                    >
                      Clear All
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table/Grid View */}
      {viewMode === "table" ? (
        <div 
          ref={tableRef}
          className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredPayments.length && filteredPayments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                {[
                  { key: "user", label: "User", sortable: true, icon: HiOutlineUser },
                  { key: "amount", label: "Amount", sortable: true, icon: HiOutlineCurrencyDollar },
                  { key: "paymentType", label: "Type", sortable: true, icon: HiOutlineCreditCard },
                  { key: "status", label: "Status", sortable: true, icon: HiOutlineShieldCheck },
                  { key: "transactionId", label: "Transaction ID", sortable: true, icon: HiOutlineFingerPrint },
                  { key: "createdAt", label: "Date", sortable: true, icon: HiOutlineCalendar },
                  { key: "actions", label: "Actions", sortable: false, icon: HiOutlineLightningBolt },
                ].map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.sortable ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          if (sortField === column.key) {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                          } else {
                            setSortField(column.key as keyof Payment);
                            setSortDirection("asc");
                          }
                        }}
                        className="flex items-center gap-2 hover:text-indigo-600 transition-colors group"
                      >
                        <column.icon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        {column.label}
                        {sortField === column.key && (
                          <motion.span
                            initial={{ rotate: sortDirection === "asc" ? 0 : 180 }}
                            animate={{ rotate: sortDirection === "asc" ? 0 : 180 }}
                          >
                            {sortDirection === "asc" ? (
                              <HiOutlineChevronUp className="w-3 h-3" />
                            ) : (
                              <HiOutlineChevronDown className="w-3 h-3" />
                            )}
                          </motion.span>
                        )}
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <column.icon className="w-4 h-4" />
                        {column.label}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredPayments.map((payment, index) => {
                  const statusBadge = getStatusBadge(payment.status);
                  const typeBadge = getTypeBadge(payment.paymentType);
                  const StatusIcon = statusBadge.icon;
                  const TypeIcon = typeBadge.icon;
                  const isExpanded = expandedRow === payment._id;
                  const isHovered = hoveredRow === payment._id;
                  const isSelected = selectedRows.includes(payment._id);

                  return (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03 }}
                      onHoverStart={() => setHoveredRow(payment._id)}
                      onHoverEnd={() => setHoveredRow(null)}
                      className={`relative transition-all duration-300 ${
                        isSelected 
                          ? "bg-indigo-50/50" 
                          : isHovered 
                          ? "bg-gradient-to-r from-gray-50 to-indigo-50/30" 
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(payment._id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="flex-shrink-0 h-10 w-10"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                              <HiOutlineUser className="w-5 h-5 text-white" />
                            </div>
                          </motion.div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {payment.user?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <HiOutlineMail className="w-3 h-3" />
                              {payment.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <motion.div
                          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                          className="text-base font-bold text-gray-900"
                        >
                          {formatCurrency(payment.amount, true)}
                        </motion.div>
                        {payment.currency && (
                          <div className="text-xs text-gray-400 mt-1">{payment.currency}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${typeBadge.bg} ${typeBadge.text} ${typeBadge.shadow}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          {typeBadge.label}
                        </motion.div>
                      </td>
                      <td className="px-6 py-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${statusBadge.bg} ${statusBadge.text} ${statusBadge.shadow}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusBadge.label}
                        </motion.div>
                        {payment.riskScore && (
                          <div className="mt-2">
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${payment.riskScore}%` }}
                                  className={`h-full ${
                                    payment.riskScore < 30 
                                      ? "bg-green-500" 
                                      : payment.riskScore < 70 
                                      ? "bg-yellow-500" 
                                      : "bg-red-500"
                                  }`}
                                />
                              </div>
                              <span className="text-xs text-gray-400">
                                Risk: {payment.riskScore}%
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <div>
                            <div className="text-sm font-mono text-gray-900">
                              {payment.transactionId || "N/A"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {payment.paymentMethod || "Unknown method"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatDate(payment.createdAt)}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {payment._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {onViewDetails && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onViewDetails(payment)}
                              className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-300 relative group"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                View Details
                              </span>
                            </motion.button>
                          )}
                          {payment.status === PaymentStatus.PENDING && onVerify && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onVerify(payment._id)}
                              className="p-2 text-green-500 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all duration-300 relative group"
                              title="Verify Payment"
                            >
                              <HiOutlineCheckCircle className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Verify Payment
                              </span>
                            </motion.button>
                          )}
                          {payment.status === PaymentStatus.COMPLETED && onRefund && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onRefund(payment._id)}
                              className="p-2 text-purple-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-300 relative group"
                              title="Refund Payment"
                            >
                              <HiOutlineReceiptRefund className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Refund Payment
                              </span>
                            </motion.button>
                          )}
                          {onPrint && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onPrint(payment)}
                              className="p-2 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-300 relative group"
                              title="Print Receipt"
                            >
                              <HiOutlinePrinter className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Print Receipt
                              </span>
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setExpandedRow(isExpanded ? null : payment._id)}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 relative group"
                            title={isExpanded ? "Show less" : "Show more"}
                          >
                            {isExpanded ? (
                              <HiOutlineChevronUp className="w-5 h-5" />
                            ) : (
                              <HiOutlineChevronDown className="w-5 h-5" />
                            )}
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {isExpanded ? "Show less" : "Show more"}
                            </span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      ) : (
        // Grid View
        <div className="p-6 overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredPayments.map((payment, index) => {
                const statusBadge = getStatusBadge(payment.status);
                const typeBadge = getTypeBadge(payment.paymentType);
                const StatusIcon = statusBadge.icon;
                const TypeIcon = typeBadge.icon;

                return (
                  <motion.div
                    key={payment._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <HiOutlineUser className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {payment.user?.name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.user?.email || "N/A"}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(payment._id)}
                        onChange={() => handleRowSelect(payment._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${typeBadge.bg} ${typeBadge.text}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeBadge.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="font-mono">{payment.transactionId || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <HiOutlineCalendar className="w-4 h-4" />
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      {payment.description && (
                        <div className="text-gray-500 text-xs line-clamp-2">
                          {payment.description}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                      {onViewDetails && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onViewDetails(payment)}
                          className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </motion.button>
                      )}
                      {payment.status === PaymentStatus.PENDING && onVerify && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onVerify(payment._id)}
                          className="p-2 text-green-500 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all"
                        >
                          <HiOutlineCheckCircle className="w-4 h-4" />
                        </motion.button>
                      )}
                      {payment.status === PaymentStatus.COMPLETED && onRefund && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRefund(payment._id)}
                          className="p-2 text-purple-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-all"
                        >
                          <HiOutlineReceiptRefund className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Expanded Details */}
      <AnimatePresence>
        {expandedRow && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30"
          >
            {payments
              .filter((p) => p._id === expandedRow)
              .map((payment) => (
                <div key={payment._id} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <HiOutlineInformationCircle className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-700">Payment Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <HiOutlineCreditCard className="w-3 h-3" />
                        Payment Method
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.paymentMethod || "N/A"}
                      </p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <HiOutlineTag className="w-3 h-3" />
                        Reference ID
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.booking?._id || payment.subscription?._id || "N/A"}
                      </p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <HiOutlineDocumentText className="w-3 h-3" />
                        Description
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.description || "N/A"}
                      </p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <HiOutlineGlobe className="w-3 h-3" />
                        Location
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {(payment as EnhancedPayment).location || "N/A"}
                      </p>
                    </motion.div>
                    {(payment as EnhancedPayment).deviceInfo && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                      >
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <HiOutlineDeviceMobile className="w-3 h-3" />
                          Device Info
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {(payment as EnhancedPayment).deviceInfo}
                        </p>
                      </motion.div>
                    )}
                    {(payment as EnhancedPayment).ipAddress && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                      >
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <HiOutlineFingerPrint className="w-3 h-3" />
                          IP Address
                        </p>
                        <p className="text-sm font-medium text-gray-900 font-mono">
                          {(payment as EnhancedPayment).ipAddress}
                        </p>
                      </motion.div>
                    )}
                    {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="col-span-full bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                      >
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                          <HiOutlineQrcode className="w-3 h-3" />
                          Additional Metadata
                        </p>
                        <pre className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 overflow-x-auto">
                          {JSON.stringify(payment.metadata, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary with enhanced design */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Showing</span>
              <span className="text-sm font-semibold text-indigo-600">
                {filteredPayments.length}
              </span>
              <span className="text-sm text-gray-500">of</span>
              <span className="text-sm font-semibold text-gray-900">
                {payments.length}
              </span>
              <span className="text-sm text-gray-500">payments</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Selected:</span>
              <span className="text-sm font-semibold text-indigo-600">
                {selectedRows.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <HiOutlineCurrencyDollar className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500">Total:</span>
              </div>
              <motion.span
                key={statistics.total}
                initial={{ scale: 1.2, color: "#4F46E5" }}
                animate={{ scale: 1, color: "#111827" }}
                className="text-lg font-bold text-gray-900"
              >
                {formatCurrency(statistics.total)}
              </motion.span>
            </div>
            {onExport && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onExport(filteredPayments)}
                className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-sm border border-gray-200"
              >
                <HiOutlineDownload className="w-4 h-4" />
                Export
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="px-6 py-2 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-4">
        <span>⌘/Ctrl + F: Search</span>
        <span>Esc: Clear selection</span>
        <span>Click row to expand</span>
      </div>
    </motion.div>
  );
};