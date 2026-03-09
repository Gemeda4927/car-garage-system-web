import { useUserStore } from "../store/user.store";
import { User, UserStats, PaymentStats } from "../types/user.types";

export const useUser = () => {
  const {
    users,
    deletedUsers,
    selectedUser,
    pagination,
    loading,
    error,
    stats,

    fetchUsers,
    fetchDeletedUsers,
    fetchUserById,
    fetchUserStats,
    updateUser,
    softDeleteUser,
    restoreUser,
    hardDeleteUser,
    grantGarageCreation,
    revokeGarageCreation,
  } = useUserStore();

  // Safe getters with proper error handling
  const safeUsers = Array.isArray(users) ? users : [];
  const safeDeletedUsers = Array.isArray(deletedUsers) ? deletedUsers : [];

  const getUserById = (userId: string): User | undefined => {
    return safeUsers.find((u) => u._id === userId) ||
      safeDeletedUsers.find((u) => u._id === userId);
  };

  const getUsersByRole = (role: string): User[] => {
    return safeUsers.filter((u) => u.role === role && !u.isDeleted);
  };

  const getUsersWithGarageCreation = (): User[] => {
    return safeUsers.filter((u) => u.canCreateGarage && !u.isDeleted);
  };

  const getPaymentStats = (): PaymentStats => {
    try {
      const usersWithPayments = safeUsers.filter(
        (u) => u.garageCreationPayments && u.garageCreationPayments.length > 0
      );

      const totalPayments = usersWithPayments.reduce(
        (sum, user) => sum + (user.garageCreationPayments?.length || 0),
        0
      );

      const totalAmount = usersWithPayments.reduce(
        (sum, user) =>
          sum +
          (user.garageCreationPayments?.reduce(
            (paymentSum, payment) => paymentSum + (payment.payment?.amount || 0),
            0
          ) || 0),
        0
      );

      const completedPayments = usersWithPayments.filter((u) =>
        u.garageCreationPayments?.some((p) => p.status === "completed")
      ).length;

      const pendingPayments = usersWithPayments.filter((u) =>
        u.garageCreationPayments?.some((p) => p.status === "pending")
      ).length;

      return {
        usersWithPayments: usersWithPayments.length,
        totalPayments,
        totalAmount,
        completedPayments,
        pendingPayments,
      };
    } catch (error) {
      console.error("Error calculating payment stats:", error);
      return {
        usersWithPayments: 0,
        totalPayments: 0,
        totalAmount: 0,
        completedPayments: 0,
        pendingPayments: 0,
      };
    }
  };

  const getLocalStats = (): UserStats => {
    try {
      const allUsers = [...safeUsers, ...safeDeletedUsers];
      const activeUsers = safeUsers.filter(u => !u.isDeleted);
      
      const garageOwners = allUsers.filter((u) => u?.role === "garage_owner").length;
      const carOwners = allUsers.filter((u) => u?.role === "car_owner").length;
      
      const usersWithGarageCreation = safeUsers.filter((u) => u?.canCreateGarage).length;
      
      const recentUsers = [...activeUsers]
        .sort((a, b) => 
          new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
        )
        .slice(0, 5);

      const paymentStats = getPaymentStats();

      return {
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        deletedUsers: safeDeletedUsers.length,
        garageOwners,
        carOwners,
        usersWithGarageCreation,
        totalPayments: paymentStats.totalPayments,
        totalPaymentAmount: paymentStats.totalAmount,
        recentUsers,
      };
    } catch (error) {
      console.error("Error calculating local stats:", error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        deletedUsers: 0,
        garageOwners: 0,
        carOwners: 0,
        usersWithGarageCreation: 0,
        totalPayments: 0,
        totalPaymentAmount: 0,
        recentUsers: [],
      };
    }
  };

  const getUsersWithPendingPayments = (): User[] => {
    return safeUsers.filter((u) =>
      u.garageCreationPayments?.some((p) => p.status === "pending")
    );
  };

  const getUsersWithCompletedPayments = (): User[] => {
    return safeUsers.filter((u) =>
      u.garageCreationPayments?.some((p) => p.status === "completed")
    );
  };

  const getUserPaymentSummary = (userId: string) => {
    const user = getUserById(userId);
    if (!user) return null;

    const payments = user.garageCreationPayments || [];
    const totalAmount = payments.reduce(
      (sum, p) => sum + (p.payment?.amount || 0),
      0
    );
    const completedCount = payments.filter((p) => p.status === "completed").length;
    const pendingCount = payments.filter((p) => p.status === "pending").length;

    return {
      totalPayments: payments.length,
      totalAmount,
      completedCount,
      pendingCount,
      lastPaymentDate: payments[0]?.createdAt || null,
    };
  };

  return {
    // State
    users: safeUsers,
    deletedUsers: safeDeletedUsers,
    selectedUser,
    pagination: pagination || { page: 1, limit: 10, total: 0, pages: 0 },
    loading,
    error,
    stats,

    // API Actions
    fetchUsers,
    fetchDeletedUsers,
    fetchUserById,
    fetchUserStats,
    updateUser,
    softDeleteUser,
    restoreUser,
    hardDeleteUser,
    grantGarageCreation,
    revokeGarageCreation,

    // Helpers
    getUserById,
    getUsersByRole,
    getUsersWithGarageCreation,
    getUsersWithPendingPayments,
    getUsersWithCompletedPayments,
    getUserPaymentSummary,
    getPaymentStats,
    getLocalStats,
  };
};