// src/app/admin/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Hooks
import { useAuth } from "@/lib/hooks/useAuth";
import { useUser } from "@/lib/hooks/useUser";
import { useGarage } from "@/lib/hooks/useGarage";

import { usePaymentStore } from "@/lib/store/payment.store";

// Components
import { UserTable } from "@/components/UserTable";
import { PaymentTable } from "@/components/PaymentTable";
import { GarageTable } from "@/components/GarageTable";
import ServiceTable from "@/components/ServiceTable";

// Icons
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
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi";
import {
  HiOutlineBuildingOffice,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers as HiOutlineUsers2,
  HiOutlineCreditCard,
  HiOutlineWrench,
} from "react-icons/hi2";
import { Service } from "@/lib/types/service.types";
import { useService } from "@/lib/hooks/useService";


type TabType =
  | "overview"
  | "users"
  | "garages"
  | "bookings"
  | "services"
  | "payments"
  | "verifications"
  | "settings";
type UserViewType = "active" | "deleted";
type GarageViewType = "active" | "deleted";
type ServiceViewType = "active" | "deleted";

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
    restoreUser,
    hardDeleteUser,
    getLocalStats,
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
    restoreGarage,
    hardDeleteGarage,
    getLocalStats: getGarageLocalStats,
  } = useGarage();

  // Service hook
  const {
    services,
    categoryStats,
    pagination: servicePagination,
    isLoading: servicesLoading,
    error: servicesError,
    filters: serviceFilters,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    toggleAvailability,
    restoreService,
    hardDeleteService,
    setFilters: setServiceFilters,
    resetFilters: resetServiceFilters,
    getServicesByCategory,
    getAvailableServices,
    searchServices,
    totalServices,
    availableCount,
  } = useService({ autoFetch: false });

  // Payment store
  const {
    payments = [],
    statistics,
    pagination: paymentPagination,
    isLoading: paymentsLoading,
    error: paymentsError,
    fetchPayments,
    fetchStatistics,
    refundPayment,
    verifyPayment,
  } = usePaymentStore();

  // State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [userView, setUserView] = useState<UserViewType>("active");
  const [garageView, setGarageView] = useState<GarageViewType>("active");
  const [serviceView, setServiceView] = useState<ServiceViewType>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [garageSearchTerm, setGarageSearchTerm] = useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentLimit] = useState(20);
  const [selectedGarage, setSelectedGarage] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});

  // Mock bookings data (replace with actual bookings hook when available)
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Garage view states
  const [showDeleted, setShowDeleted] = useState(false);
  const [showUnverified, setShowUnverified] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const handleViewChange = (view: "regular" | "deleted" | "unverified" | "complete") => {
    setShowDeleted(false);
    setShowUnverified(false);
    setShowComplete(false);

    switch (view) {
      case "deleted":
        setShowDeleted(true);
        break;
      case "unverified":
        setShowUnverified(true);
        break;
      case "complete":
        setShowComplete(true);
        break;
      default:
        break;
    }
  };

  // Memoized values
  const localStats = useMemo(() => getLocalStats(), [getLocalStats, users, deletedUsers]);
  const garageLocalStats = useMemo(
    () => getGarageLocalStats(),
    [getGarageLocalStats, garages, deletedGarages]
  );

  // Service stats
  const serviceStats = useMemo(() => {
    const activeServices = services.filter(s => s.isAvailable !== false);
    const deletedServices = services.filter(s => s.isAvailable === false);
    const avgPrice = activeServices.length > 0
      ? activeServices.reduce((sum, s) => sum + s.price, 0) / activeServices.length
      : 0;

    return {
      totalServices: services.length,
      activeServices: activeServices.length,
      deletedServices: deletedServices.length,
      availableServices: getAvailableServices().length,
      unavailableServices: services.filter(s => !s.isAvailable).length,
      avgPrice,
    };
  }, [services, getAvailableServices]);

  // Payment derived values
  const completedPayments = useMemo(
    () => (payments || []).filter((p) => p.status === "COMPLETED"),
    [payments]
  );

  const pendingPayments = useMemo(
    () => (payments || []).filter((p) => p.status === "PENDING"),
    [payments]
  );

  const totalRevenue = useMemo(
    () => (completedPayments || []).reduce((sum, p) => sum + p.amount, 0),
    [completedPayments]
  );

  // Auth check
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  // Data fetching based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "users") {
          if (userView === "active") {
            await fetchUsers(1, DEFAULT_PAGE_LIMIT);
          } else {
            await fetchDeletedUsers();
          }
        } else if (activeTab === "garages") {
          if (garageView === "active") {
            await fetchGarages({
              page: 1,
              limit: DEFAULT_PAGE_LIMIT,
            });
          } else {
            await fetchDeletedGarages();
          }
        } else if (activeTab === "services") {
          const filters: any = {
            page: 1,
            limit: DEFAULT_PAGE_LIMIT,
          };

          if (selectedGarage) filters.garageId = selectedGarage;
          if (priceRange.min) filters.minPrice = priceRange.min;
          if (priceRange.max) filters.maxPrice = priceRange.max;
          if (serviceSearchTerm) filters.search = serviceSearchTerm;

          await fetchServices(filters);
        } else if (activeTab === "overview") {
          const promises = [
            fetchUsers(1, 5),
            fetchGarages({ page: 1, limit: 5 }),
            fetchPayments({ page: 1, limit: 5 }),
            fetchServices({ page: 1, limit: 5 }),
          ];

          if (typeof fetchStatistics === 'function') {
            promises.push(fetchStatistics("month"));
          }

          await Promise.allSettled(promises);
        } else if (activeTab === "payments") {
          const promises = [
            fetchPayments({
              page: paymentPage,
              limit: paymentLimit,
            }),
          ];

          if (typeof fetchStatistics === 'function') {
            promises.push(fetchStatistics("month"));
          }

          await Promise.allSettled(promises);
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
    selectedGarage,
    priceRange.min,
    priceRange.max,
    serviceSearchTerm,
    fetchUsers,
    fetchDeletedUsers,
    fetchGarages,
    fetchDeletedGarages,
    fetchServices,
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

    if (window.confirm(`Restore all ${deletedUsers.length} deleted users?`)) {
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

  // Service handlers
  const handleEditService = useCallback(
    async (service: Service) => {
      toast.success(`Editing service: ${service.name}`);
      console.log("Edit service:", service);
    },
    []
  );

  const handleDeleteService = useCallback(
    async (serviceId: string) => {
      if (
        window.confirm(
          "Are you sure you want to move this service to trash?"
        )
      ) {
        await toast.promise(deleteService(serviceId), {
          loading: "Moving service to trash...",
          success: "Service moved to trash successfully!",
          error: "Failed to delete service",
        });
        await fetchServices(serviceFilters);
      }
    },
    [deleteService, fetchServices, serviceFilters]
  );

  const handleRestoreService = useCallback(
    async (serviceId: string) => {
      await toast.promise(restoreService(serviceId), {
        loading: "Restoring service...",
        success: "Service restored successfully!",
        error: "Failed to restore service",
      });
      await fetchServices(serviceFilters);
    },
    [restoreService, fetchServices, serviceFilters]
  );

  const handlePermanentDeleteService = useCallback(
    async (serviceId: string) => {
      if (
        window.confirm(
          "⚠️ Are you sure? This action is permanent and cannot be undone!"
        )
      ) {
        await toast.promise(hardDeleteService(serviceId), {
          loading: "Deleting service permanently...",
          success: "Service permanently deleted!",
          error: "Failed to delete service",
        });
        await fetchServices(serviceFilters);
      }
    },
    [hardDeleteService, fetchServices, serviceFilters]
  );

  const handleToggleAvailability = useCallback(
    async (serviceId: string) => {
      await toast.promise(toggleAvailability(serviceId), {
        loading: "Toggling service availability...",
        success: "Service availability updated!",
        error: "Failed to update availability",
      });
      await fetchServices(serviceFilters);
    },
    [toggleAvailability, fetchServices, serviceFilters]
  );

  const handleBulkRestoreServices = useCallback(async () => {
    const deletedServicesList = services.filter(s => !s.isAvailable);
    if (deletedServicesList.length === 0) {
      toast.error("No services to restore");
      return;
    }

    if (
      window.confirm(
        `Restore all ${deletedServicesList.length} deleted services?`
      )
    ) {
      await toast.promise(
        Promise.all(deletedServicesList.map((s) => restoreService(s._id))),
        {
          loading: `Restoring ${deletedServicesList.length} services...`,
          success: `Successfully restored ${deletedServicesList.length} services!`,
          error: "Failed to restore some services",
        }
      );
      await fetchServices(serviceFilters);
    }
  }, [services, restoreService, fetchServices, serviceFilters]);

  const handleEmptyServiceTrash = useCallback(async () => {
    const deletedServicesList = services.filter(s => !s.isAvailable);
    if (deletedServicesList.length === 0) {
      toast.error("Trash is already empty");
      return;
    }

    if (
      window.confirm(
        `⚠️ Permanently delete all ${deletedServicesList.length} services? This cannot be undone!`
      )
    ) {
      await toast.promise(
        Promise.all(deletedServicesList.map((s) => hardDeleteService(s._id))),
        {
          loading: `Emptying trash (${deletedServicesList.length} services)...`,
          success: `Successfully deleted ${deletedServicesList.length} services permanently!`,
          error: "Failed to delete some services",
        }
      );
      await fetchServices(serviceFilters);
    }
  }, [services, hardDeleteService, fetchServices, serviceFilters]);

  const handleViewServiceDetails = useCallback(
    async (service: Service) => {
      toast.success(`Loading details for: ${service.name}`);
      await fetchServiceById(service._id);
      console.log("Service details:", service);
    },
    [fetchServiceById]
  );

  const handleFilterByGarage = useCallback((garageId: string) => {
    setSelectedGarage(garageId === selectedGarage ? "" : garageId);
  }, [selectedGarage]);

  const handleClearFilters = useCallback(() => {
    setSelectedGarage("");
    setPriceRange({});
    setServiceSearchTerm("");
    resetServiceFilters();
  }, [resetServiceFilters]);

  // Export handlers
  const handleExportUserData = useCallback(() => {
    const data = userView === "active" ? users : deletedUsers;
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Role",
      "Phone",
      "Can Create Garage",
      "Joined",
    ];
    const rows = data.map((obj) =>
      [
        `"${obj.name || ""}"`,
        `"${obj.email || ""}"`,
        obj.role || "",
        obj.phone || "",
        obj.canCreateGarage ? "Yes" : "No",
        new Date(obj.createdAt).toLocaleDateString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
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

    const headers = [
      "Name",
      "Address",
      "Owner",
      "Phone",
      "Status",
      "Created",
    ];
    const rows = data.map((obj) =>
      [
        `"${obj.name || ""}"`,
        `"${obj.address?.street || ""}"`,
        `"${obj.owner?.name || obj.ownerId || ""}"`,
        obj.contactInfo?.phone || "",
        obj.isDeleted ? "Deleted" : "Active",
        new Date(obj.createdAt).toLocaleDateString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `garages-${garageView}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Garage data exported successfully!");
  }, [garages, deletedGarages, garageView]);

  const handleExportServiceData = useCallback(() => {
    if (services.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Description",
      "Price",
      "Duration",
      "Category",
      "Garage ID",
      "Status",
      "Availability",
      "Created",
    ];
    const rows = services.map((obj) =>
      [
        `"${obj.name || ""}"`,
        `"${obj.description || ""}"`,
        obj.price || "",
        obj.duration || "",
        obj.category || "",
        obj.garageId || "",
        obj.isAvailable ? "Active" : "Inactive",
        obj.isAvailable ? "Available" : "Unavailable",
        new Date(obj.createdAt).toLocaleDateString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `services-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Service data exported successfully!");
  }, [services]);

  // Payment handlers
  const handleVerifyPayment = useCallback(
    async (paymentId: string) => {
      await toast.promise(verifyPayment(paymentId), {
        loading: "Verifying payment...",
        success: "Payment verified successfully!",
        error: "Failed to verify payment",
      });
      await fetchPayments({
        page: paymentPage,
        limit: paymentLimit,
      });
    },
    [verifyPayment, fetchPayments, paymentPage, paymentLimit]
  );

  const handleRefundPayment = useCallback(
    async (paymentId: string) => {
      if (
        window.confirm(
          "Are you sure you want to refund this payment?"
        )
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
        await fetchPayments({
          page: paymentPage,
          limit: paymentLimit,
        });
      }
    },
    [refundPayment, fetchPayments, paymentPage, paymentLimit, user]
  );

  const handleViewPaymentDetails = useCallback(
    (payment: Payment) => {
      toast.success(`Viewing payment ${payment.transactionId || payment._id}`);
      console.log("Payment details:", payment);
    },
    []
  );

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (activeTab === "users") {
      if (userView === "active") {
        fetchUsers(1, DEFAULT_PAGE_LIMIT);
      } else {
        fetchDeletedUsers();
      }
    } else if (activeTab === "garages") {
      if (garageView === "active") {
        fetchGarages({
          page: 1,
          limit: DEFAULT_PAGE_LIMIT,
        });
      } else {
        fetchDeletedGarages();
      }
    } else if (activeTab === "services") {
      const filters: any = {
        page: 1,
        limit: DEFAULT_PAGE_LIMIT,
      };
      if (selectedGarage) filters.garageId = selectedGarage;
      if (priceRange.min) filters.minPrice = priceRange.min;
      if (priceRange.max) filters.maxPrice = priceRange.max;
      if (serviceSearchTerm) filters.search = serviceSearchTerm;

      fetchServices(filters);
    } else if (activeTab === "payments") {
      fetchPayments({
        page: paymentPage,
        limit: paymentLimit,
      });
      fetchStatistics?.("month");
    } else if (activeTab === "overview") {
      Promise.allSettled([
        fetchUsers(1, 5),
        fetchGarages({ page: 1, limit: 5 }),
        fetchPayments({ page: 1, limit: 5 }),
        fetchServices({ page: 1, limit: 5 }),
        fetchStatistics?.("month"),
      ]);
    }
  }, [
    activeTab,
    userView,
    garageView,
    paymentPage,
    paymentLimit,
    selectedGarage,
    priceRange.min,
    priceRange.max,
    serviceSearchTerm,
    fetchUsers,
    fetchDeletedUsers,
    fetchGarages,
    fetchDeletedGarages,
    fetchServices,
    fetchPayments,
    fetchStatistics,
  ]);

  // Pagination handlers
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

  const handleServicePageChange = useCallback(
    (newPage: number) => {
      const filters: any = {
        page: newPage,
        limit: DEFAULT_PAGE_LIMIT,
      };
      if (selectedGarage) filters.garageId = selectedGarage;
      if (priceRange.min) filters.minPrice = priceRange.min;
      if (priceRange.max) filters.maxPrice = priceRange.max;
      if (serviceSearchTerm) filters.search = serviceSearchTerm;

      fetchServices(filters);
    },
    [fetchServices, selectedGarage, priceRange, serviceSearchTerm]
  );

  const handlePaymentPageChange = useCallback(
    (newPage: number) => {
      setPaymentPage(newPage);
    },
    []
  );

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

  // Filtered services based on view
  const filteredServices = useMemo(() => {
    if (serviceView === "active") {
      return services.filter(s => s.isAvailable !== false);
    } else {
      return services.filter(s => s.isAvailable === false);
    }
  }, [services, serviceView]);

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
      icon: HiOutlineWrench,
      label: "Services",
      key: "services",
      color: "orange",
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

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        hover: "hover:bg-indigo-50",
      },
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        hover: "hover:bg-blue-50",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        hover: "hover:bg-green-50",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        hover: "hover:bg-orange-50",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        hover: "hover:bg-purple-50",
      },
      pink: {
        bg: "bg-pink-50",
        text: "text-pink-600",
        hover: "hover:bg-pink-50",
      },
      yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        hover: "hover:bg-yellow-50",
      },
      gray: {
        bg: "bg-gray-50",
        text: "text-gray-600",
        hover: "hover:bg-gray-50",
      },
    };
    return colorMap[color] || colorMap.gray;
  };

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

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            const colors = getColorClasses(item.color, isActive);

            return (
              <motion.button
                key={item.key}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? `${colors.bg} ${colors.text} shadow-md`
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? colors.text : ""}`} />
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
                {item.key === "services" && (
                  <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                    {serviceStats.activeServices}
                  </span>
                )}
                {item.key === "payments" && (
                  <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-xs">
                    {(payments || []).length}
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold text-white">
                {user.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
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
                Welcome back, {user.name}! Here&apos;s an overview of your platform&apos;s activity.
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
                    label: "Total Services",
                    value: serviceStats.totalServices,
                    icon: HiOutlineWrench,
                    color: "orange",
                    subtext: `${serviceStats.availableServices} available`,
                  },
                  {
                    label: "Total Revenue",
                    value: `$${totalRevenue.toLocaleString()}`,
                    icon: HiOutlineCurrencyDollar,
                    color: "yellow",
                    subtext: `${completedPayments.length} completed payments`,
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
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Category Stats */}
              {categoryStats && categoryStats.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Services by Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categoryStats.map((stat) => (
                      <div key={stat._id} className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-600 capitalize">{stat._id}</p>
                        <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                        <p className="text-xs text-gray-500">
                          ${stat.minPrice} - ${stat.maxPrice}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Users */}
              {localStats.recentUsers && localStats.recentUsers.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {localStats.recentUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-indigo-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
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
              {garages && garages.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Garages</h3>
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
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <HiOutlineBuildingOffice className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{garage.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {garage.address?.street || "No address"} • Owner:{" "}
                              {garage.owner?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex-shrink-0">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Services */}
              {services && services.filter(s => s.isAvailable !== false).length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Services</h3>
                    <button
                      onClick={() => setActiveTab("services")}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {services
                      .filter(s => s.isAvailable !== false)
                      .slice(0, 5)
                      .map((service) => (
                        <div
                          key={service._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <HiOutlineWrench className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{service.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {service.category} • ${service.price}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {service.isAvailable ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Recent Payments */}
              {payments && payments.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Payments</h3>
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
                    Active ({garages?.length || 0})
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
                    Trash ({deletedGarages?.length || 0})
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

                  {garageView === "deleted" && deletedGarages?.length > 0 && (
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
                showUnverified={showUnverified}
                showComplete={showComplete}
                onViewChange={handleViewChange}
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

          {activeTab === "services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Service Management</h2>

                {/* View Toggle */}
                <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setServiceView("active")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      serviceView === "active"
                        ? "bg-orange-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <HiOutlineWrench className="w-4 h-4" />
                    Active ({services.filter(s => s.isAvailable !== false).length})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setServiceView("deleted")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      serviceView === "deleted"
                        ? "bg-red-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                    Trash ({services.filter(s => s.isAvailable === false).length})
                  </motion.button>
                </div>
              </div>

              {/* Category Stats */}
              {categoryStats && categoryStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {categoryStats.map((stat) => (
                    <div key={stat._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-sm text-orange-600 capitalize">{stat._id}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Min: ${stat.minPrice}</span>
                        <span>Max: ${stat.maxPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Service Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">Total Services</p>
                  <p className="text-2xl font-bold text-gray-800">{serviceStats.totalServices}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">Active Services</p>
                  <p className="text-2xl font-bold text-green-600">{serviceStats.activeServices}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-2xl font-bold text-green-600">{serviceStats.availableServices}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">Avg Price</p>
                  <p className="text-2xl font-bold text-gray-800">${serviceStats.avgPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search services by name..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Garage Filter */}
                  <select
                    value={selectedGarage}
                    onChange={(e) => setSelectedGarage(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Garages</option>
                    {garages?.map((garage) => (
                      <option key={garage._id} value={garage._id}>{garage.name}</option>
                    ))}
                  </select>

                  {/* Price Range */}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min $"
                      value={priceRange.min || ''}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={priceRange.max || ''}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Clear Filters */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex justify-end gap-2 mb-6">
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
                  onClick={handleExportServiceData}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  title="Export to CSV"
                >
                  <HiOutlineDownload className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>

                {serviceView === "deleted" && services.filter(s => !s.isAvailable).length > 0 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkRestoreServices}
                      className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                      title="Restore all"
                    >
                      <HiOutlineRefresh className="w-4 h-4" />
                      <span className="hidden sm:inline">Restore All</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEmptyServiceTrash}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                      title="Empty trash"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      <span className="hidden sm:inline">Empty Trash</span>
                    </motion.button>
                  </>
                )}
              </div>

              {/* Service Table */}
              <ServiceTable
                services={filteredServices}
                categoryStats={categoryStats}
                pagination={servicePagination}
                loading={servicesLoading}
                error={servicesError}
                showDeleted={serviceView === "deleted"}
                onEdit={handleEditService}
                onDelete={handleDeleteService}
                onRestore={handleRestoreService}
                onPermanentDelete={handlePermanentDeleteService}
                onToggleAvailability={handleToggleAvailability}
                onViewDetails={handleViewServiceDetails}
                onPageChange={handleServicePageChange}
                onRetry={() => fetchServices(serviceFilters)}
              />

              {/* Pagination */}
              {servicePagination && servicePagination.pages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {(servicePagination.page - 1) * servicePagination.limit + 1} -{" "}
                    {Math.min(servicePagination.page * servicePagination.limit, servicePagination.total)} of{" "}
                    {servicePagination.total} services
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleServicePageChange(servicePagination.page - 1)}
                      disabled={servicePagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </motion.button>
                    <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg">
                      Page {servicePagination.page} of {servicePagination.pages}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleServicePageChange(servicePagination.page + 1)}
                      disabled={servicePagination.page === servicePagination.pages}
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
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
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

              {/* Pagination */}
              {paymentPagination && paymentPagination.pages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {(paymentPagination.page - 1) * paymentPagination.limit + 1} -{" "}
                    {Math.min(paymentPagination.page * paymentPagination.limit, paymentPagination.total)} of{" "}
                    {paymentPagination.total} payments
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaymentPageChange(paymentPagination.page - 1)}
                      disabled={paymentPagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </motion.button>
                    <span className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg">
                      Page {paymentPagination.page} of {paymentPagination.pages}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaymentPageChange(paymentPagination.page + 1)}
                      disabled={paymentPagination.page === paymentPagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab === "bookings" || activeTab === "verifications" || activeTab === "settings") && (
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