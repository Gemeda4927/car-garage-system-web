export type UserRole = "garage_owner" | "car_owner" | "admin";

export interface GarageCreationPayment {
  _id: string;
  status: "pending" | "completed" | "failed";
  payment: {
    _id: string;
    amount: number;
    status: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  phone: string;
  canCreateGarage: boolean;
  isDeleted: boolean;
  garageCreationPayments: GarageCreationPayment[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  deletedUsers: number;
  garageOwners: number;
  carOwners: number;
  usersWithGarageCreation: number;
  totalPayments: number;
  totalPaymentAmount: number;
  recentUsers: User[];
}

export interface PaymentStats {
  usersWithPayments: number;
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
}

export interface UserPaymentSummary {
  totalPayments: number;
  totalAmount: number;
  completedCount: number;
  pendingCount: number;
  lastPaymentDate: string | null;
}