// types/service.types.ts

// Garage Stats
export interface GarageStats {
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
}

// Garage Address
export interface GarageAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Garage Contact Info
export interface GarageContactInfo {
  phone: string;
  email: string;
}

// Populated Garage (when garage details are included)
export interface PopulatedGarage {
  _id: string;
  name: string;
  address: GarageAddress;
  contactInfo: GarageContactInfo;
  status: string;
  stats: GarageStats;
  isActive: boolean;
  isVerified: boolean;
}

// Service with populated garage
export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  garage: PopulatedGarage;  // Garage is always populated in your response
  images: string[];
  documents: string[];
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  bookings?: unknown[];  // Optional array for bookings
  garageId?: string; // Keep for backward compatibility
  id?: string;       // Some APIs return both _id and id
}

// Category Statistics
export interface CategoryStat {
  _id: string;        // category name
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Main response for getting all services
export interface ServicesResponse {
  success: boolean;
  data: {
    services: Service[];
    categoryStats: CategoryStat[];
    pagination: Pagination;
  };
}

// Response for single service
export interface ServiceResponse {
  success: boolean;
  message?: string;
  data: {
    service: Service;
  };
}

// Create service payload
export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  garageId: string;
}

// Update service payload
export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  isAvailable?: boolean;
}

// Categories response
export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: string[];
  };
}

// Service filters for query params
export interface ServiceFilters {
  garageId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  isAvailable?: boolean;
}

// Toggle availability response
export interface ToggleAvailabilityResponse {
  success: boolean;
  data: {
    service: Service;
    message: string;
  };
}

// Delete service response
export interface DeleteServiceResponse {
  success: boolean;
  message: string;
}

// Restore service response
export interface RestoreServiceResponse {
  success: boolean;
  data: {
    service: Service;
  };
}

// Hard delete service response
export interface HardDeleteServiceResponse {
  success: boolean;
  message: string;
}

// Service Analytics
export interface ServiceAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating?: number;
  monthlyStats?: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface ServiceAnalyticsResponse {
  success: boolean;
  data: ServiceAnalytics;
}

// Service Bookings
export interface ServiceBooking {
  _id: string;
  bookingDate: string;
  timeSlot: {
    start: string;
    end: string;
  };
  status: string;
  customer: {
    name: string;
    email: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    licensePlate: string;
  };
}

export interface ServiceBookingsResponse {
  success: boolean;
  data: {
    bookings: ServiceBooking[];
    totalCount: number;
    page: number;
    limit: number;
  };
}

// API Error
export interface ApiError {
  success: false;
  message: string;
  error?: string;
}