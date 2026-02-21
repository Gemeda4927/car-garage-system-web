// Base types
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface OwnerReference {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

// --------------------
// Booking Types
// --------------------

export interface BookingService {
  _id: string;
  name: string;
  price: number;
  duration: number; // minutes
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Booking {
  _id: string;
  user: OwnerReference;
  garage: string;
  services: BookingService[];
  totalPrice: number;
  appointmentDate: string;
  status: BookingStatus;
}

// --------------------
// Review Type
// --------------------

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
  };
}

// --------------------
// Main Garage Interface
// --------------------

export interface Garage {
  _id: string;
  id: string;
  owner: OwnerReference;
  name: string;
  description: string;
  address: Address;
  location: Location;
  googlePlaceId?: string;
  formattedAddress: string;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations returned from backend
  bookings: Booking[];
  reviews: Review[];
}

// --------------------
// API Response
// --------------------

export interface GaragesListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  garages: Garage[];
}
