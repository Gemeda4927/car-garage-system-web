// Service inside booking
export interface BookingService {
  _id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

// Booking object
export interface Booking {
  _id: string;
  user: string; // user ID
  garage: string; // garage ID
  isDeleted: boolean;
  services: BookingService[];
  totalPrice: number;
  appointmentDate: string; // ISO date string
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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