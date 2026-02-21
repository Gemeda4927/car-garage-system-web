import {
  Booking,
  OwnerReference,
} from "./booking.types";

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

// Re-export OwnerReference from booking.types for consistency
export type { OwnerReference };

// --------------------
// Service Type
// --------------------

export interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
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

  // ✅ Add this line - Services array
  services: Service[];

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
// API Response Types
// --------------------

export interface GaragesListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  garages: Garage[];
}

// Single garage response
export interface GarageResponse {
  success: boolean;
  garage: Garage;
}

// --------------------
// Filter and Query Types
// --------------------

export interface GarageFilters {
  city?: string;
  isVerified?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface GarageQueryParams extends GarageFilters {
  lat?: string | number;
  lng?: string | number;
  radius?: number;
}

// --------------------
// Location Search Types
// --------------------

export interface LocationSearchParams {
  lat: string | number;
  lng: string | number;
  radius?: number; // in km
}
