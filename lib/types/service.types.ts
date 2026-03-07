// service.types.ts

// Booking information
export interface ServiceBooking {
  _id: string;
  service: string;
  bookingDate: string; // ISO string
  status: "pending" | "approved" | "cancelled" | "completed" | "rejected";
}

// Garage statistics
export interface GarageStats {
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
}

// Garage address
export interface GarageAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Garage contact info
export interface GarageContactInfo {
  phone: string;
  email: string;
  website: string;
}

// Garage reference (populated)
export interface GarageReference {
  _id: string;
  name: string;
  address: GarageAddress;
  contactInfo: GarageContactInfo;
  status: "pending" | "active" | "suspended" | "approved";
  stats: GarageStats;
  isActive: boolean;
  isVerified: boolean;
}

// Base Service interface
export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  garage: string | GarageReference; // string if unpopulated, GarageReference if populated
  images: string[]; // URLs or paths
  documents: string[]; // URLs or paths
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  __v: number;
  bookings?: ServiceBooking[]; // optional, may not exist
}

// Fully populated service (garage is always populated)
export interface PopulatedService extends Omit<Service, 'garage'> {
  garage: GarageReference;
}

// Category stats
export interface CategoryStats {
  _id: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

// Response for listing services
export interface ServicesResponseData {
  services: PopulatedService[];
  categoryStats: CategoryStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ServicesResponse {
  success: boolean;
  data: ServicesResponseData;
}

// Response for a single service
export interface ServiceResponseData {
  service: PopulatedService;
}

export interface ServiceResponse {
  success: boolean;
  data: ServiceResponseData;
}

// Payloads
export interface CreateServicePayload {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  garageId: string;
  images?: string[];
  documents?: string[];
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  images?: string[];
  documents?: string[];
}

// Filters for querying services
export interface ServiceFilters {
  garageId?: string;
  category?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string; // e.g., "price" | "duration"
  sortOrder?: "asc" | "desc";
}

// Analytics for a service
export interface ServiceAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  monthlyTrend: Array<{
    month: string; // e.g., "2026-03"
    bookings: number;
    revenue: number;
  }>;
}

// Responses
export interface ServiceBookingsResponse {
  success: boolean;
  data: {
    bookings: ServiceBooking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ServiceAnalyticsResponse {
  success: boolean;
  data: ServiceAnalytics;
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: CategoryStats[];
  };
}

// API error
export interface ApiError {
  success: false;
  message: string;
  error?: string;
}