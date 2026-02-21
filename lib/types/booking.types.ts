// Service inside booking
export interface BookingService {
  _id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

// Booking status type
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

// Owner reference type (reused from garage.types)
export interface OwnerReference {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

// Booking object (comprehensive)
export interface Booking {
  _id: string;
  user: string | OwnerReference; // Can be user ID or populated user object
  garage:
    | string
    | {
        _id: string;
        name: string;
        address?: unknown;
        location?: unknown;
      }; // Can be garage ID or populated garage object
  isDeleted: boolean;
  deletedAt?: string; // ISO date string when soft deleted
  services: BookingService[];
  totalPrice: number;
  appointmentDate: string; // ISO date string
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// API response for a single booking
export interface BookingResponse {
  success: boolean;
  booking: Booking;
  message?: string;
}

// Request payload when creating booking
export interface CreateBookingRequest {
  garage: string;
  services: {
    name: string;
    price: number;
    duration: number;
  }[];
  totalPrice: number;
  appointmentDate: string;
  notes?: string;
}

// Request payload when updating booking
export interface UpdateBookingRequest {
  services?: {
    name: string;
    price: number;
    duration: number;
  }[];
  totalPrice?: number;
  appointmentDate?: string;
  notes?: string;
  status?: BookingStatus;
}

// List bookings response (for my-bookings endpoint)
export interface MyBookingsResponse {
  success: boolean;
  bookings: Booking[];
}

// List bookings response with pagination (for admin)
export interface BookingsListResponse {
  success: boolean;
  count: number;
  bookings: Booking[];
}

// Admin get all bookings response (including deleted)
export interface AllBookingsResponse {
  success: boolean;
  count: number;
  bookings: Booking[];
}

// Soft delete response
export interface DeleteBookingResponse {
  success: boolean;
  message: string;
}

// Restore booking response
export interface RestoreBookingResponse {
  success: boolean;
  message: string;
}

// Hard delete response
export interface HardDeleteBookingResponse {
  success: boolean;
  message: string;
}

// Status update response (for confirm/complete/cancel)
export interface StatusUpdateResponse {
  success: boolean;
  message: string;
  booking?: Booking;
}

// Query params for filtering bookings
export interface BookingQueryParams {
  userId?: string;
  garageId?: string;
  status?: BookingStatus;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

// Booking statistics
export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

// Garage bookings response (with stats)
export interface GarageBookingsResponse {
  success: boolean;
  stats: BookingStats;
  count: number;
  bookings: Booking[];
}

// User's upcoming booking
export interface UpcomingBooking {
  _id: string;
  garage: {
    _id: string;
    name: string;
    address?: unknown;
  };
  appointmentDate: string;
  status: BookingStatus;
  totalPrice: number;
  services: BookingService[];
}
