// src/app/admin/page.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUser } from "@/lib/hooks/useUser";
import { useGarage } from "@/lib/hooks/useGarage";
import { usePaymentStoress } from "@/lib/store/payment.stores";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { UserTable } from "@/components/UserTable";
import { PaymentTable } from "@/components/PaymentTable";
import { GarageTable } from "@/components/GarageTable";
import toast, { Toaster } from "react-hot-toast";
import {
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineLogout,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineCash,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi";
import {
  HiOutlineBuildingOffice,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers as HiOutlineUsers2,
  HiOutlineCreditCard,
} from "react-icons/hi2";
import {
  Payment,
  RefundPaymentRequest,
} from "@/types/payment.type";

type TabType =
  | "overview"
  | "users"
  | "garages"
  | "bookings"
  | "payments"
  | "verifications"
  | "settings";
type UserViewType = "active" | "deleted";
type GarageViewType = "active" | "deleted";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  key: TabType;
  color: string;
}

const DEFAULT_PAGE_LIMIT = 10;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // User hook
  const {
    users,
    deletedUsers,
    loading: usersLoading,
    error: usersError,
    pagination,
    fetchUsers,
    fetchDeletedUsers,
    fetchUserStats,
    restoreUser,
    hardDeleteUser,
    getLocalStats,
    getPaymentStats,
  } = useUser();

  // Garage hook
  const {
    garages,
    deletedGarages,
    loading: garagesLoading,
    error: garagesError,
    pagination: garagePagination,
    fetchGarages,
    fetchDeletedGarages,
    fetchGarageStats,
    createGarage,
    updateGarage,
    deleteGarage,
    restoreGarage,
    hardDeleteGarage,
    getLocalStats: getGarageLocalStats,
  } = useGarage();

  // Payment store
  const {
    payments,
    selectedPayment,
    statistics,
    pagination: paymentPagination,
    isLoading: paymentsLoading,
    isLoadingPayment,
    isLoadingStatistics,
    isRefunding,
    isVerifying,
    error: paymentsError,
    fetchPayments,
    fetchPaymentById,
    fetchStatistics,
    refundPayment,
    verifyPayment,
    filters,
    setFilters,
    clearFilters,
    clearSelectedPayment,
  } = usePaymentStoress();

  // State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [userView, setUserView] = useState<UserViewType>("active");
  const [garageView, setGarageView] = useState<GarageViewType>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [garageSearchTerm, setGarageSearchTerm] = useState("");
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentLimit] = useState(20);

  // Memoized values
  const localStats = useMemo(
    () => getLocalStats(),
    [getLocalStats, users, deletedUsers]
  );
  
  const garageLocalStats = useMemo(
    () => getGarageLocalStats(),
    [getGarageLocalStats, garages, deletedGarages]
  );
  
  const userPaymentStats = useMemo(
    () => getPaymentStats(),
    [getPaymentStats, users]
  );

  // Payment derived values
  const completedPayments = useMemo(
    () => payments.filter((p) => p.status === "COMPLETED"),
    [payments]
  );
  
  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === "PENDING"),
    [payments]
  );
  
  const totalRevenue = useMemo(
    () => completedPayments.reduce((sum, p) => sum + p.amount, 0),
    [completedPayments]
  );

  // Auth check
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      toast.error("Access denied. Redirecting to login...");
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  // Data fetching based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "users") {
          if (userView === "active") {
            await fetchUsers(1, 10);
          } else {
            await fetchDeletedUsers();
          }
        } else if (activeTab === "garages") {
          if (garageView === "active") {
            await fetchGarages({ page: 1, limit: 10 });
          } else {
            await fetchDeletedGarages();
          }
        } else if (activeTab === "overview") {

await Promise.all([
  fetchUsers(1, 5),
  fetchGarages({ page: 1, limit: 5 }),
  fetchPayments({ page: 1, limit: 5 }),
  fetchStatistics("month"),
]);


        } else if (activeTab === "payments") {
          await Promise.allSettled([
            fetchPayments({
              page: paymentPage,
              limit: paymentLimit,
            }),
            fetchStatistics("month"),
          ]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [
    activeTab,
    userView,
    garageView,
    paymentPage,
    paymentLimit,
    fetchUsers,
    fetchDeletedUsers,
    fetchUserStats,
    fetchGarages,
    fetchDeletedGarages,
    fetchGarageStats,
    fetchPayments,
    fetchStatistics,
  ]);

  // User handlers
  const handleRestoreUserFromTrash = useCallback(
    async (userId: string) => {
      await toast.promise(restoreUser(userId), {
        loading: "Restoring user...",
        success: "User restored successfully!",
        error: "Failed to restore user",
      });
    },
    [restoreUser]
  );

  const handlePermanentDeleteUser = useCallback(
    async (userId: string) => {
      if (
        window.confirm(
          "⚠️ Are you sure? This action is permanent and cannot be undone!"
        )
      ) {
        await toast.promise(hardDeleteUser(userId), {
          loading: "Deleting user permanently...",
          success: "User permanently deleted!",
          error: "Failed to delete user",
        });
      }
    },
    [hardDeleteUser]
  );

  const handleBulkRestoreUsers = useCallback(async () => {
    if (deletedUsers.length === 0) {
      toast.error("No users to restore");
      return;
    }

    if (
      window.confirm(
        `Restore all ${deletedUsers.length} deleted users?`
      )
    ) {
      await toast.promise(
        Promise.all(deletedUsers.map((u) => restoreUser(u._id))),
        {
          loading: `Restoring ${deletedUsers.length} users...`,
          success: `Successfully restored ${deletedUsers.length} users!`,
          error: "Failed to restore some users",
        }
      );
    }
  }, [deletedUsers, restoreUser]);

  const handleEmptyUserTrash = useCallback(async () => {
    if (deletedUsers.length === 0) {
      toast.error("Trash is already empty");
      return;
    }

    if (
      window.confirm(
        `⚠️ Permanently delete all ${deletedUsers.length} users? This cannot be undone!`
      )
    ) {
      await toast.promise(
        Promise.all(deletedUsers.map((u) => hardDeleteUser(u._id))),
        {
          loading: `Emptying trash (${deletedUsers.length} users)...`,
          success: `Successfully deleted ${deletedUsers.length} users permanently!`,
          error: "Failed to delete some users",
        }
      );
    }
  }, [deletedUsers, hardDeleteUser]);

  // Garage handlers
  const handleRestoreGarageFromTrash = useCallback(
    async (garageId: string) => {
      await toast.promise(restoreGarage(garageId), {
        loading: "Restoring garage...",
        success: "Garage restored successfully!",
        error: "Failed to restore garage",
      });
    },
    [restoreGarage]
  );

  const handlePermanentDeleteGarage = useCallback(
    async (garageId: string) => {
      if (
        window.confirm(
          "⚠️ Are you sure? This action is permanent and cannot be undone!"
        )
      ) {
        await toast.promise(hardDeleteGarage(garageId), {
          loading: "Deleting garage permanently...",
          success: "Garage permanently deleted!",
          error: "Failed to delete garage",
        });
      }
    },
    [hardDeleteGarage]
  );

  const handleBulkRestoreGarages = useCallback(async () => {
    if (deletedGarages.length === 0) {
      toast.error("No garages to restore");
      return;
    }

    if (
      window.confirm(
        `Restore all ${deletedGarages.length} deleted garages?`
      )
    ) {
      await toast.promise(
        Promise.all(deletedGarages.map((g) => restoreGarage(g._id))),
        {
          loading: `Restoring ${deletedGarages.length} garages...`,
          success: `Successfully restored ${deletedGarages.length} garages!`,
          error: "Failed to restore some garages",
        }
      );
    }
  }, [deletedGarages, restoreGarage]);

  const handleEmptyGarageTrash = useCallback(async () => {
    if (deletedGarages.length === 0) {
      toast.error("Trash is already empty");
      return;
    }

    if (
      window.confirm(
        `⚠️ Permanently delete all ${deletedGarages.length} garages? This cannot be undone!`
      )
    ) {
      await toast.promise(
        Promise.all(deletedGarages.map((g) => hardDeleteGarage(g._id))),
        {
          loading: `Emptying trash (${deletedGarages.length} garages)...`,
          success: `Successfully deleted ${deletedGarages.length} garages permanently!`,
          error: "Failed to delete some garages",
        }
      );
    }
  }, [deletedGarages, hardDeleteGarage]);

  // Export handlers
  const handleExportUserData = useCallback(() => {
    const data = userView === "active" ? users : deletedUsers;
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Email", "Role", "Phone", "Can Create Garage", "Joined"];
    const rows = data.map((obj) =>
      [
        obj.name,
        obj.email,
        obj.role,
        obj.phone || "",
        obj.canCreateGarage ? "Yes" : "No",
        new Date(obj.createdAt).toLocaleDateString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${userView}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  }, [users, deletedUsers, userView]);

  const handleExportGarageData = useCallback(() => {
    const data = garageView === "active" ? garages : deletedGarages;
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Address", "Owner", "Phone", "Status", "Created"];
    const rows = data.map((obj) =>
      [
        obj.name,
        obj.address?.street || "",
        obj.owner?.name || obj.ownerId || "",
        obj.phone || "",
        obj.isDeleted ? "Deleted" : "Active",
        new Date(obj.createdAt).toLocaleDateString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `garages-${garageView}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Garage data exported successfully!");
  }, [garages, deletedGarages, garageView]);

  // Payment handlers
  const handleVerifyPayment = useCallback(
    async (paymentId: string) => {
      await toast.promise(verifyPayment(paymentId), {
        loading: "Verifying payment...",
        success: "Payment verified successfully!",
        error: "Failed to verify payment",
      });
      await fetchPayments({ page: paymentPage, limit: paymentLimit });
    },
    [verifyPayment, fetchPayments, paymentPage, paymentLimit]
  );

  const handleRefundPayment = useCallback(
    async (paymentId: string) => {
      if (
        window.confirm("Are you sure you want to refund this payment?")
      ) {
        const refundData: RefundPaymentRequest = {
          reason: "Admin initiated refund",
          refundedBy: user?._id || "system",
        };

        await toast.promise(refundPayment(paymentId, refundData), {
          loading: "Processing refund...",
          success: "Payment refunded successfully!",
          error: "Failed to refund payment",
        });
        await fetchPayments({ page: paymentPage, limit: paymentLimit });
      }
    },
    [refundPayment, fetchPayments, paymentPage, paymentLimit, user]
  );

  const handleViewPaymentDetails = useCallback((payment: Payment) => {
    toast.success(`Viewing payment ${payment.transactionId || payment._id}`);
    console.log("Payment details:", payment);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (activeTab === "users") {
      if (userView === "active") {
        fetchUsers(1, 10);
      } else {
        fetchDeletedUsers();
      }
    } else if (activeTab === "garages") {
      if (garageView === "active") {
        fetchGarages({ page: 1, limit: 10 });
      } else {
        fetchDeletedGarages({ page: 1, limit: 10 });
      }
    } else if (activeTab === "payments") {
      fetchPayments({ page: paymentPage, limit: paymentLimit });
      fetchStatistics("month");
    } else if (activeTab === "overview") {
      fetchUserStats();
      fetchUsers(1, 5);
      fetchGarages({ page: 1, limit: 5 });
      fetchGarageStats();
      fetchPayments({ page: 1, limit: 5 });
      fetchStatistics("month");
    }
  }, [
    activeTab,
    userView,
    garageView,
    paymentPage,
    paymentLimit,
    fetchUsers,
    fetchDeletedUsers,
    fetchUserStats,
    fetchGarages,
    fetchDeletedGarages,
    fetchGarageStats,
    fetchPayments,
    fetchStatistics,
  ]);

  // Pagination handlers with safe defaults based on your hooks
  const handleUserPageChange = useCallback(
    (newPage: number) => {
      const limit = pagination?.limit || DEFAULT_PAGE_LIMIT;
      fetchUsers(newPage, limit);
    },
    [fetchUsers, pagination]
  );

  const handleGaragePageChange = useCallback(
    (newPage: number) => {
      const limit = garagePagination?.limit || DEFAULT_PAGE_LIMIT;
      fetchGarages({ page: newPage, limit });
    },
    [fetchGarages, garagePagination]
  );

  const handlePaymentPageChange = useCallback((newPage: number) => {
    setPaymentPage(newPage);
  }, []);

  // Filtered data
  const filteredUsers = useMemo(() => {
    const sourceUsers = userView === "active" ? users : deletedUsers;
    if (!searchTerm.trim()) return sourceUsers;

    return sourceUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, deletedUsers, userView, searchTerm]);

// In your admin page, ensure filteredGarages is always an array
const filteredGarages = useMemo(() => {
  const sourceGarages = garageView === "active" ? garages || [] : deletedGarages || [];
  if (!garageSearchTerm.trim()) return sourceGarages;

  return sourceGarages.filter(
    (garage) =>
      garage.name?.toLowerCase().includes(garageSearchTerm.toLowerCase()) ||
      garage.address?.street?.toLowerCase().includes(garageSearchTerm.toLowerCase()) ||
      garage.owner?.name?.toLowerCase().includes(garageSearchTerm.toLowerCase())
  );
}, [garages, deletedGarages, garageView, garageSearchTerm]);


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    {
      icon: HiOutlineChartBar,
      label: "Overview",
      key: "overview",
      color: "indigo",
    },
    {
      icon: HiOutlineUsers2,
      label: "Users",
      key: "users",
      color: "blue",
    },
    {
      icon: HiOutlineBuildingOffice,
      label: "Garages",
      key: "garages",
      color: "green",
    },
    {
      icon: HiOutlineClipboardDocumentList,
      label: "Bookings",
      key: "bookings",
      color: "purple",
    },
    {
      icon: HiOutlineCreditCard,
      label: "Payments",
      key: "payments",
      color: "pink",
    },
    {
      icon: HiOutlineShieldCheck,
      label: "Verifications",
      key: "verifications",
      color: "yellow",
    },
    {
      icon: HiOutlineCog,
      label: "Settings",
      key: "settings",
      color: "gray",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col">
        <div className="p-6 text-center border-b border-gray-200">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-gray-800">
              Admin <span className="text-indigo-600">Dashboard</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your platform</p>
          </motion.div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <motion.button
                key={item.key}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? `bg-${item.color}-50 text-${item.color}-600 shadow-md`
                    : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? `text-${item.color}-600` : ""}`}
                />
                <span className="flex-1">{item.label}</span>
                {item.key === "users" && (
                  <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                    {localStats.activeUsers}
                  </span>
                )}
                {item.key === "garages" && (
                  <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                    {garageLocalStats.activeGarages}
                  </span>
                )}
                {item.key === "payments" && (
                  <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-xs">
                    {payments.length}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <motion.div
            className="flex items-center gap-3 mb-3 px-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-lg font-semibold text-white">
                {user.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5" /> Logout
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Header with Refresh */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
          </h1>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
            title="Refresh data"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500 mb-8">
                Welcome back, {user.name}! Here&apos;s an overview of your
                platform&apos;s activity.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    label: "Total Users",
                    value: localStats.totalUsers,
                    icon: HiOutlineUsers2,
                    color: "indigo",
                    subtext: `${localStats.garageOwners} garage owners, ${localStats.carOwners} car owners`,
                  },
                  {
                    label: "Total Garages",
                    value: garageLocalStats.totalGarages,
                    icon: HiOutlineBuildingOffice,
                    color: "green",
                    subtext: `${garageLocalStats.activeGarages} active, ${garageLocalStats.deletedGarages} deleted`,
                  },
                  {
                    label: "Total Revenue",
                    value: `$${totalRevenue.toLocaleString()}`,
                    icon: HiOutlineCurrencyDollar,
                    color: "yellow",
                    subtext: `${completedPayments.length} completed payments`,
                  },
                  {
                    label: "Pending Actions",
                    value: pendingPayments.length + (deletedUsers.length > 0 ? 1 : 0),
                    icon: HiOutlineClock,
                    color: "orange",
                    subtext: `${pendingPayments.length} payments pending`,
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                    }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Users */}
              {localStats.recentUsers.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Recent Users
                  </h3>
                  <div className="space-y-3">
                    {localStats.recentUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-indigo-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "garage_owner"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role === "garage_owner" ? "Garage Owner" : "Car Owner"}
                          </span>
                          {user.canCreateGarage && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Can Create
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Garages */}
              {garages.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Recent Garages
                    </h3>
                    <button
                      onClick={() => setActiveTab("garages")}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {garages.slice(0, 5).map((garage) => (
                      <div
                        key={garage._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <HiOutlineBuildingOffice className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{garage.name}</p>
                            <p className="text-xs text-gray-500">
                              {garage.address?.street || "No address"} • 
                              Owner: {garage.owner?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Payments */}
              {payments.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Recent Payments
                    </h3>
                    <button
                      onClick={() => setActiveTab("payments")}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View All →
                    </button>
                  </div>
                  <PaymentTable
                    payments={payments.slice(0, 5)}
                    loading={paymentsLoading}
                    error={paymentsError}
                    onViewDetails={handleViewPaymentDetails}
                    onVerify={handleVerifyPayment}
                    onRefund={handleRefundPayment}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>

                {/* View Toggle */}
                <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserView("active")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      userView === "active"
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <HiOutlineUsers className="w-4 h-4" />
                    Active ({users.length})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserView("deleted")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      userView === "deleted"
                        ? "bg-red-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                    Trash ({deletedUsers.length})
                  </motion.button>
                </div>
              </div>

              {/* Search and Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${userView} users by name or email...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    title="Refresh"
                  >
                    <HiOutlineRefresh className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportUserData}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    title="Export to CSV"
                  >
                    <HiOutlineDownload className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </motion.button>

                  {userView === "deleted" && deletedUsers.length > 0 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBulkRestoreUsers}
                        className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                        title="Restore all"
                      >
                        <HiOutlineRefresh className="w-4 h-4" />
                        <span className="hidden sm:inline">Restore All</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEmptyUserTrash}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                        title="Empty trash"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                        <span className="hidden sm:inline">Empty Trash</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* User Table */}
              <UserTable
                users={filteredUsers}
                loading={usersLoading}
                error={usersError}
                showDeleted={userView === "deleted"}
                onRestore={handleRestoreUserFromTrash}
                onPermanentDelete={handlePermanentDeleteUser}
              />

              {/* Pagination */}
              {userView === "active" && pagination && pagination.pages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} users
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUserPageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </motion.button>
                    <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUserPageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "garages" && (
            <motion.div
              key="garages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Garage Management</h2>

                {/* View Toggle */}
                <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGarageView("active")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      garageView === "active"
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <HiOutlineBuildingOffice className="w-4 h-4" />
                    Active ({garages.length})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGarageView("deleted")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      garageView === "deleted"
                        ? "bg-red-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                    {/* Trash ({deletedGarages.length}) */}
                  </motion.button>
                </div>
              </div>

              {/* Search and Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${garageView} garages by name, address, or owner...`}
                    value={garageSearchTerm}
                    onChange={(e) => setGarageSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    title="Refresh"
                  >
                    <HiOutlineRefresh className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportGarageData}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    title="Export to CSV"
                  >
                    <HiOutlineDownload className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </motion.button>

                  {garageView === "deleted" && deletedGarages.length > 0 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBulkRestoreGarages}
                        className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                        title="Restore all"
                      >
                        <HiOutlineRefresh className="w-4 h-4" />
                        <span className="hidden sm:inline">Restore All</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEmptyGarageTrash}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                        title="Empty trash"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                        <span className="hidden sm:inline">Empty Trash</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Garage Table */}
              <GarageTable
                garages={filteredGarages}
                loading={garagesLoading}
                error={garagesError}
                showDeleted={garageView === "deleted"}
                onRestore={handleRestoreGarageFromTrash}
                onPermanentDelete={handlePermanentDeleteGarage}
                onViewDetails={(garage) => {
                  toast.success(`Viewing garage: ${garage.name}`);
                  console.log("Garage details:", garage);
                }}
              />

              {/* Pagination */}
              {garageView === "active" && garagePagination && garagePagination.pages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {(garagePagination.page - 1) * garagePagination.limit + 1} -{" "}
                    {Math.min(garagePagination.page * garagePagination.limit, garagePagination.total)} of{" "}
                    {garagePagination.total} garages
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGaragePageChange(garagePagination.page - 1)}
                      disabled={garagePagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </motion.button>
                    <span className="px-4 py-2 bg-green-50 text-green-600 rounded-lg">
                      Page {garagePagination.page} of {garagePagination.pages}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGaragePageChange(garagePagination.page + 1)}
                      disabled={garagePagination.page === garagePagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Payment Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    label: "Total Payments",
                    value: payments.length,
                    icon: HiOutlineCreditCard,
                    color: "pink",
                  },
                  {
                    label: "Total Revenue",
                    value: `$${totalRevenue.toLocaleString()}`,
                    icon: HiOutlineCurrencyDollar,
                    color: "green",
                  },
                  {
                    label: "Completed",
                    value: completedPayments.length,
                    icon: HiOutlineCheckCircle,
                    color: "green",
                  },
                  {
                    label: "Pending",
                    value: pendingPayments.length,
                    icon: HiOutlineClock,
                    color: "yellow",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                    }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Payment Table */}
              <PaymentTable
                payments={payments}
                loading={paymentsLoading}
                error={paymentsError}
                onViewDetails={handleViewPaymentDetails}
                onVerify={handleVerifyPayment}
                onRefund={handleRefundPayment}
              />
            </motion.div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== "overview" &&
            activeTab !== "users" &&
            activeTab !== "garages" &&
            activeTab !== "payments" && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  {activeTab === "bookings" && (
                    <HiOutlineClipboardDocumentList className="w-12 h-12 text-gray-400" />
                  )}
                  {activeTab === "verifications" && (
                    <HiOutlineShieldCheck className="w-12 h-12 text-gray-400" />
                  )}
                  {activeTab === "settings" && (
                    <HiOutlineCog className="w-12 h-12 text-gray-400" />
                  )}
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2 capitalize">
                  {activeTab} Management
                </h3>
                <p className="text-gray-500 mb-6">
                  This section is under construction. Check back soon!
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("overview")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Return to Overview
                </motion.button>
              </motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}