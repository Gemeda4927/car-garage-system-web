"use client";

import { User } from "@/lib/types/user.types";
import { useUser } from "@/lib/hooks/useUser";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineKey,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineCash,
  HiOutlineCurrencyDollar,
  HiOutlineFilter,
  HiOutlineSortAscending,
  HiOutlineSortDescending,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineInformationCircle,
  HiOutlineStar,
  HiOutlineArchive,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi";
import {
  HiOutlineBuildingOffice,
  HiOutlineUserGroup,
  HiOutlineChartBar,
} from "react-icons/hi2";

interface UserTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  showDeleted?: boolean;
  onRestore?: (userId: string) => Promise<void>;
  onPermanentDelete?: (userId: string) => Promise<void>;
}

type SortField = "name" | "email" | "role" | "createdAt" | "phone" | "canCreateGarage";
type SortOrder = "asc" | "desc";
type FilterType = "all" | "garage_owner" | "car_owner";
type PermissionType = "all" | "granted" | "revoked";
type PaymentFilterType = "all" | "hasPayments" | "noPayments" | "pending" | "completed";

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  error,
  showDeleted = false,
  onRestore,
  onPermanentDelete,
}) => {
  const {
    softDeleteUser,
    hardDeleteUser,
    restoreUser,
    grantGarageCreation,
    revokeGarageCreation,
    updateUser,
    getUsersWithPendingPayments,
    getUsersWithCompletedPayments,
    getUserPaymentSummary,
    getPaymentStats,
  } = useUser();

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPayments, setShowPayments] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  
  // Sorting and filtering
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [roleFilter, setRoleFilter] = useState<FilterType>("all");
  const [permissionFilter, setPermissionFilter] = useState<PermissionType>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get users with specific payment statuses
  const usersWithPendingPayments = useMemo(() => 
    getUsersWithPendingPayments().map(u => u._id), 
    [getUsersWithPendingPayments, users]
  );
  
  const usersWithCompletedPayments = useMemo(() => 
    getUsersWithCompletedPayments().map(u => u._id), 
    [getUsersWithCompletedPayments, users]
  );

  // Payment stats
  const paymentStats = useMemo(() => 
    getPaymentStats(), 
    [getPaymentStats, users]
  );

  // Sort and filter users
  const processedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search
    if (searchTerm.trim()) {
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Apply permission filter
    if (permissionFilter !== "all") {
      const hasPermission = permissionFilter === "granted";
      filtered = filtered.filter(u => u.canCreateGarage === hasPermission);
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      switch (paymentFilter) {
        case "hasPayments":
          filtered = filtered.filter(u => u.garageCreationPayments?.length > 0);
          break;
        case "noPayments":
          filtered = filtered.filter(u => !u.garageCreationPayments?.length);
          break;
        case "pending":
          filtered = filtered.filter(u => 
            u.garageCreationPayments?.some(p => p.status === "pending")
          );
          break;
        case "completed":
          filtered = filtered.filter(u => 
            u.garageCreationPayments?.some(p => p.status === "completed")
          );
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: unknown = a[sortField];
      let bValue: unknown = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, sortField, sortOrder, roleFilter, permissionFilter, paymentFilter]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }, [sortField]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? 
      <HiOutlineSortAscending className="w-4 h-4 ml-1 text-indigo-600" /> : 
      <HiOutlineSortDescending className="w-4 h-4 ml-1 text-indigo-600" />;
  };

  const handleSoftDelete = async (userId: string) => {
    setActionLoading(userId);
    try {
      await toast.promise(softDeleteUser(userId), {
        loading: "Moving user to trash...",
        success: "User moved to trash successfully",
        error: "Failed to delete user",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleHardDelete = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure? This action is permanent and cannot be undone."
      )
    ) {
      setActionLoading(userId);
      try {
        if (onPermanentDelete) {
          await onPermanentDelete(userId);
        } else {
          await toast.promise(hardDeleteUser(userId), {
            loading: "Permanently deleting user...",
            success: "User permanently deleted",
            error: "Failed to delete user",
          });
        }
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRestore = async (userId: string) => {
    setActionLoading(userId);
    try {
      if (onRestore) {
        await onRestore(userId);
      } else {
        await toast.promise(restoreUser(userId), {
          loading: "Restoring user...",
          success: "User restored successfully",
          error: "Failed to restore user",
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name, phone: user.phone || "" });
  };

  const handleUpdate = async (userId: string) => {
    setActionLoading(userId);
    try {
      await toast.promise(updateUser(userId, editForm), {
        loading: "Updating user...",
        success: "User updated successfully",
        error: "Failed to update user",
      });
      setEditingUser(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrantGarageCreation = async (userId: string) => {
    setActionLoading(userId);
    try {
      await toast.promise(grantGarageCreation(userId), {
        loading: "Granting permission...",
        success: "Garage creation permission granted",
        error: "Failed to grant permission",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeGarageCreation = async (userId: string) => {
    setActionLoading(userId);
    try {
      await toast.promise(revokeGarageCreation(userId), {
        loading: "Revoking permission...",
        success: "Permission revoked successfully",
        error: "Failed to revoke permission",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "garage_owner":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "car_owner":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "garage_owner":
        return <HiOutlineBuildingOffice className="w-3.5 h-3.5" />;
      case "car_owner":
        return <HiOutlineUser className="w-3.5 h-3.5" />;
      default:
        return <HiOutlineShieldCheck className="w-3.5 h-3.5" />;
    }
  };

  const getTotalPayments = (user: User) => {
    return user.garageCreationPayments?.length || 0;
  };

  const getTotalPaymentAmount = (user: User) => {
    return (
      user.garageCreationPayments?.reduce(
        (sum, p) => sum + (p.payment?.amount || 0),
        0
      ) || 0
    );
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading users</p>
        <p className="text-sm text-gray-400 mt-1">Please wait</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-xl p-10 text-center"
      >
        <HiOutlineShieldExclamation className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            <HiOutlineFilter className="w-4 h-4" />
            Filters
            {showFilters ? (
              <HiOutlineChevronUp className="w-4 h-4" />
            ) : (
              <HiOutlineChevronDown className="w-4 h-4" />
            )}
          </button>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              Showing <span className="font-semibold text-indigo-600">{processedUsers.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{users.length}</span> users
            </span>
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 p-4 bg-gray-50/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as FilterType)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="garage_owner">Garage Owners</option>
                    <option value="car_owner">Car Owners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Permission
                  </label>
                  <select
                    value={permissionFilter}
                    onChange={(e) => setPermissionFilter(e.target.value as PermissionType)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="all">All Permissions</option>
                    <option value="granted">Can Create Garage</option>
                    <option value="revoked">Cannot Create Garage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Payment Status
                  </label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value as PaymentFilterType)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="all">All Payments</option>
                    <option value="hasPayments">Has Payments</option>
                    <option value="noPayments">No Payments</option>
                    <option value="pending">Pending Payments</option>
                    <option value="completed">Completed Payments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Sort By
                  </label>
                  <select
                    value={sortField}
                    onChange={(e) => handleSort(e.target.value as SortField)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                    <option value="createdAt">Joined Date</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                  >
                    User
                    {getSortIcon("name")}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("phone")}
                    className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                  >
                    Contact
                    {getSortIcon("phone")}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("role")}
                    className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                  >
                    Role
                    {getSortIcon("role")}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("canCreateGarage")}
                    className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                  >
                    Permissions
                    {getSortIcon("canCreateGarage")}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payments
                  </span>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                  >
                    Joined
                    {getSortIcon("createdAt")}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <AnimatePresence>
                {processedUsers.length > 0 ? (
                  processedUsers.map((u: User, index: number) => {
                    const paymentSummary = getUserPaymentSummary(u._id);
                    const hasPendingPayments = usersWithPendingPayments.includes(u._id);
                    const hasCompletedPayments = usersWithCompletedPayments.includes(u._id);

                    return (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className={`hover:bg-gray-50 transition-colors ${
                          u.isDeleted ? "bg-red-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          {editingUser === u._id ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <HiOutlineUser className="w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, name: e.target.value })
                                  }
                                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
                                  placeholder="Name"
                                  autoFocus
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <HiOutlineMail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 truncate max-w-[150px]">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {u.name}
                                  </span>
                                  <button
                                    onClick={() => setShowUserDetails(showUserDetails === u._id ? null : u._id)}
                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                  >
                                    <HiOutlineInformationCircle className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                  <HiOutlineMail className="w-3 h-3" />
                                  {u.email}
                                </div>
                                {u.isDeleted && u.deletedAt && (
                                  <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full inline-flex">
                                    <HiOutlineTrash className="w-3 h-3" />
                                    Deleted: {new Date(u.deletedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* User Details Dropdown */}
                          <AnimatePresence>
                            {showUserDetails === u._id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 p-3 bg-gray-50 rounded-lg text-sm border border-gray-200"
                              >
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                                    <p className="font-mono text-xs text-gray-700 bg-white p-1.5 rounded border border-gray-200">
                                      {u._id}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                    <p className="text-xs text-gray-700 bg-white p-1.5 rounded border border-gray-200">
                                      {new Date(u.updatedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {paymentSummary && (
                                    <>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Payments</p>
                                        <p className="text-xs font-medium text-gray-700 bg-white p-1.5 rounded border border-gray-200">
                                          {paymentSummary.totalPayments}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                        <p className="text-xs font-medium text-gray-700 bg-white p-1.5 rounded border border-gray-200">
                                          ${paymentSummary.totalAmount.toLocaleString()}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>

                        <td className="px-6 py-4">
                          {editingUser === u._id ? (
                            <div className="flex items-center gap-2">
                              <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                              <input
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, phone: e.target.value })
                                }
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
                                placeholder="Phone"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm">
                              <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{u.phone || "—"}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                              u.role
                            )}`}
                          >
                            {getRoleIcon(u.role)}
                            {u.role === "garage_owner" ? "Garage Owner" : "Car Owner"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                              u.canCreateGarage
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            <HiOutlineKey className="w-3.5 h-3.5" />
                            {u.canCreateGarage ? "Can Create" : "Cannot Create"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {u.garageCreationPayments && u.garageCreationPayments.length > 0 ? (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setShowPayments(
                                    showPayments === u._id ? null : u._id
                                  )
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 border border-yellow-200 transition-colors"
                              >
                                <HiOutlineCash className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  {getTotalPayments(u)} payment{getTotalPayments(u) !== 1 ? 's' : ''}
                                </span>
                                {hasPendingPayments && (
                                  <HiOutlineClock className="w-3 h-3 text-yellow-600" />
                                )}
                              </button>
                              
                              <AnimatePresence>
                                {showPayments === u._id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20"
                                  >
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                          <HiOutlineCurrencyDollar className="w-4 h-4 text-yellow-600" />
                                          Payment History
                                        </p>
                                        {paymentSummary && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                            Total: ${paymentSummary.totalAmount.toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {u.garageCreationPayments.map((p, idx) => (
                                          <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="text-xs flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                                          >
                                            <span className="text-gray-600">
                                              {new Date(p.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                              ${p.payment?.amount || 0}
                                            </span>
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                                p.status
                                              )}`}
                                            >
                                              {p.status}
                                            </span>
                                          </motion.div>
                                        ))}
                                      </div>
                                      
                                      {paymentSummary && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <div className="flex justify-between text-xs">
                                            <span className="text-gray-600">
                                              Completed: {paymentSummary.completedCount}
                                            </span>
                                            <span className="text-gray-600">
                                              Pending: {paymentSummary.pendingCount}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic flex items-center gap-1">
                              <HiOutlineCash className="w-3 h-3" />
                              No payments
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {actionLoading === u._id ? (
                            <div className="flex justify-end">
                              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : !showDeleted ? (
                            // Active users actions
                            <div className="flex gap-1.5 justify-end">
                              {editingUser === u._id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdate(u._id)}
                                    className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                    title="Save changes"
                                  >
                                    <HiOutlineCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingUser(null)}
                                    className="p-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    title="Cancel"
                                  >
                                    <HiOutlineX className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(u)}
                                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Edit user"
                                  >
                                    <HiOutlinePencil className="w-4 h-4" />
                                  </button>

                                  {u.canCreateGarage ? (
                                    <button
                                      onClick={() => handleRevokeGarageCreation(u._id)}
                                      className="p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                      title="Revoke garage creation permission"
                                    >
                                      <HiOutlineShieldExclamation className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleGrantGarageCreation(u._id)}
                                      className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                      title="Grant garage creation permission"
                                    >
                                      <HiOutlineShieldCheck className="w-4 h-4" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleSoftDelete(u._id)}
                                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Move to trash"
                                  >
                                    <HiOutlineTrash className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            // Deleted users actions
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleRestore(u._id)}
                                className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                title="Restore user"
                              >
                                <HiOutlineRefresh className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleHardDelete(u._id)}
                                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                title="Delete permanently"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <HiOutlineUserGroup className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium text-lg">
                          No {showDeleted ? "deleted" : ""} users found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {showDeleted 
                            ? "Deleted users will appear here" 
                            : "Try adjusting your filters or search criteria"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Stats Summary */}
      {!showDeleted && paymentStats.totalPayments > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineChartBar className="w-5 h-5 text-indigo-600" />
            <h4 className="font-medium text-gray-700">Payment Summary</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Users with Payments</p>
              <p className="text-xl font-semibold text-gray-800">{paymentStats.usersWithPayments}</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Total Payments</p>
              <p className="text-xl font-semibold text-gray-800">{paymentStats.totalPayments}</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Completed</p>
              <p className="text-xl font-semibold text-green-600">{paymentStats.completedPayments}</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-xl font-semibold text-yellow-600">{paymentStats.pendingPayments}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};