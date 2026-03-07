export interface Coordinates {
  type: "Point";
  coordinates: [number, number];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
}

export interface BusinessDay {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  monday: BusinessDay;
  tuesday: BusinessDay;
  wednesday: BusinessDay;
  thursday: BusinessDay;
  friday: BusinessDay;
  saturday: BusinessDay;
  sunday: BusinessDay;
}

export interface GarageStats {
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
}

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string;
}

// Booking Types
export interface TimeSlot {
  start: string;
  end: string;
}

export interface BookingCarOwner {
  _id: string;
  name: string;
  phone: string;
}

export interface ServiceBooking {
  _id: string;
  carOwner: BookingCarOwner;
  service: string;
  bookingDate: string;
  timeSlot: TimeSlot;
  status: "pending" | "approved" | "cancelled" | "completed" | "rejected";
}

export interface GarageService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  images: unknown[];
  isAvailable: boolean;
  bookings?: ServiceBooking[];
}

export interface Garage {
  _id: string;
  name: string;
  description: string;
  coordinates: Coordinates;
  address: Address;
  contactInfo: ContactInfo;
  businessHours: BusinessHours;
  owner: UserSummary;
  creationPayment: string;
  status: "pending" | "active" | "suspended" | "approved";
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
  stats: GarageStats;
  services: GarageService[];
  images: unknown[];
  documents: unknown[];
  verifiedAt?: string;
  verifiedBy?: string;
  reviews: unknown[];
  __v: number;
}

export type PopulatedGarage = Garage

// Price Range Type
export interface PriceRange {
  _id: null;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

// Pagination Type
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Request Payloads
export interface CreateGaragePayload {
  name: string;
  description: string;
  coordinates: [number, number];
  address: Address;
  contactInfo: ContactInfo;
  businessHours: BusinessHours;
}

export interface UpdateGaragePayload {
  name?: string;
  description?: string;
  coordinates?: [number, number];
  address?: Partial<Address>;
  contactInfo?: Partial<ContactInfo>;
  businessHours?: Partial<BusinessHours>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface GaragesListData {
  garages: PopulatedGarage[];
  priceRange: PriceRange;
  pagination: Pagination;
}

export interface GarageSingleData {
  garage: PopulatedGarage;
}

export type GaragesListResponse = ApiResponse<GaragesListData>;
export type GarageSingleResponse = ApiResponse<GarageSingleData>;

// Booking Filter Params
export interface GarageBookingsParams {
  serviceId?: string;
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Nearby Garage Query
export interface NearbyGaragesQuery {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}

export interface NearbyGarage extends PopulatedGarage {
  distance?: {
    value: number;
    unit: string;
  };
  isOpenNow?: boolean;
}