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

// Booking object (comprehensive)
export interface Booking {
  _id: string;
  user: string | OwnerReference; // Can be user ID or populated user object
  garage: string; // garage ID
  isDeleted: boolean;
  services: BookingService[];
  totalPrice: number;
  appointmentDate: string; // ISO date string
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Owner reference type (reused from garage.types)
export interface OwnerReference {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

// API response for a single booking
export interface BookingResponse {
  success: boolean;
  booking: Booking;
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

// List bookings response
export interface BookingsListResponse {
  success: boolean;
  count: number;
  bookings: Booking[];
}
