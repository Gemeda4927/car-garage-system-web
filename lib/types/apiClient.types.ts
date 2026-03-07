// ============================================
// API CLIENT TYPES
// ============================================

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

// Generic request config for API calls
export interface RequestConfig<D = unknown> {
  url: string;
  data?: D;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// Login response includes user info and token
export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  role: "car_owner" | "garage_owner" | "admin";
  phone?: string;
  avatar?: string;
  canCreateGarage: boolean;
  token: string; // authentication token
}

// User type for auth context and API calls
export interface User {
  id: string;
  name: string;
  email: string;
  role: "car_owner" | "garage_owner" | "admin";
  token: string; // authentication token
  phone?: string;
  avatar?: string;
  canCreateGarage?: boolean;
}

// Garage entity
export interface Garage {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
  ownerId: string;
  isApproved: boolean;
}

// Service offered by a garage
export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  garageId: string;
}

// Booking entity
export interface Booking {
  id: string;
  carOwnerId: string;
  garageId: string;
  serviceId: string;
  status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
  date: string; // ISO date string
}

// Review entity
export interface Review {
  id: string;
  garageId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string; // ISO date string
}

// Payment entity
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  paymentMethod?: string;
  createdAt: string; // ISO date string
}

// API error wrapper
export interface ApiError {
  status?: number;
  message?: string;
  validationErrors?: Record<string, string>;
}