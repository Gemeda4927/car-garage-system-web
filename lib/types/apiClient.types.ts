// ============================================
// API CLIENT TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface RequestConfig<D = unknown> {
  url: string;
  data?: D;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  role: "car_owner" | "garage_owner" | "admin";
  phone?: string;
  avatar?: string;
  canCreateGarage: boolean;
  token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "car_owner" | "garage_owner" | "admin";
  phone?: string;
  avatar?: string;
  canCreateGarage?: boolean;
}

export interface Garage {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
  ownerId: string;
  isApproved: boolean;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  garageId: string;
}

export interface Booking {
  id: string;
  carOwnerId: string;
  garageId: string;
  serviceId: string;
  status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
  date: string;
}

export interface Review {
  id: string;
  garageId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  paymentMethod?: string;
  createdAt: string;
}

export interface ApiError {
  status?: number;
  message?: string;
  validationErrors?: Record<string, string>;
}