// types/booking-status.types.ts

// Booking Status Enum
export enum BookingStatus {
  PENDING = "pending",
  APPROVED = "approved",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

// ==========================================
// COMMON INTERFACES
// ==========================================

export interface TimeSlot {
  start: string;
  end: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
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
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface GarageStats {
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ==========================================
// REQUEST DTOS
// ==========================================

// Request DTO for updating booking status
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  reason?: string; // Required for rejection/cancellation
}

// Check availability request
export interface CheckAvailabilityRequest {
  garageId: string;
  serviceId?: string;
  date: string;
  timeSlot: TimeSlot;
}

// Create booking request
export interface CreateBookingRequest {
  garageId: string;
  serviceId: string;
  bookingDate: string;
  timeSlot: TimeSlot;
  vehicleInfo: VehicleInfo;
  notes?: string;
}

// ==========================================
// RESPONSE DTOS
// ==========================================

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ==========================================
// BOOKING RESPONSE TYPES
// ==========================================

export interface BookingResponse {
  _id: string;
  id?: string;
  timeSlot: TimeSlot;
  vehicleInfo: VehicleInfo;
  carOwner: {
    _id: string;
    name: string;
    email: string;
    avatar: string | null;
    phone: string;
  };
  garage: {
    _id: string;
    name: string;
    description?: string;
    address: Address;
    contactInfo: ContactInfo;
    businessHours?: BusinessHours;
    stats?: GarageStats;
    owner?: {
      _id: string;
      name: string;
      email: string;
      phone: string;
    };
    images?: string[];
    id: string;
  };
  service: {
    _id: string;
    name: string;
    description: string;
    price?: number;
    duration: number;
    category?: string;
    images?: string[];
    id: string;
  };
  bookingDate: string;
  status: string; // Can be cast to BookingStatus if needed
  notes?: string;
  attachments: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  review: unknown | null;
  statusHistory?: Array<{
    status: string;
    changedBy: string;
    reason?: string;
    changedAt: string;
  }>;
}

// Booking response (simplified for status update)
export type Booking = BookingResponse;

export interface BookingStatusResponse {
  booking: Booking;
}

// Check availability response
export interface CheckAvailabilityResponse {
  available: boolean;
  reason?: string;
  message?: string;
  businessHours?: DayHours;
}

// Create booking response
export interface CreateBookingResponse {
  booking: BookingResponse;
}

// Bookings list response
export interface BookingsListResponse {
  bookings: BookingResponse[];
  stats: BookingStatsSummary;
  pagination: Pagination;
}

export interface BookingStatsSummary {
  _id: null | string;
  totalBookings: number;
  pendingCount: number;
  approvedCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  rejectedCount: number;
}

// Calendar response
export interface BookingCalendarResponse {
  startDate: string;
  endDate: string;
  totalBookings: number;
  bookings: Record<string, BookingCalendarItem[]>;
}

export interface BookingCalendarItem {
  _id: string;
  id: string;
  timeSlot: TimeSlot;
  vehicleInfo: VehicleInfo;
  carOwner: {
    _id: string;
    name: string;
  };
  garage: {
    _id: string;
    name: string;
    id: string;
  };
  service: {
    _id: string;
    name: string;
    duration: number;
    id: string;
  };
  bookingDate: string;
  status: string;
}

// Stats response
export interface BookingStatsResponse {
  overview: {
    _id: null;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    approvedBookings: number;
    inProgressBookings: number;
    rejectedBookings: number;
  };
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  byDate: Array<{
    _id: string;
    count: number;
    completedCount: number;
  }>;
  popularServices: Array<{
    _id: string;
    count: number;
    serviceName: string;
    category: string;
  }>;
  peakHours: Array<{
    _id: string;
    count: number;
  }>;
  period: string;
}

// Timeline response
export interface BookingTimelineResponse {
  bookingId: string;
  currentStatus: string;
  timeline: Array<{
    event: string;
    status: string;
    timestamp: string;
    description: string;
    changedBy?: string;
  }>;
}

// ==========================================
// HOOK PROPS AND RETURN TYPES
// ==========================================

// Props for useBookingStatus hook
export interface UseBookingStatusProps {
  bookingId: string;
  onSuccess?: (booking: Booking) => void;
  onError?: (error: string) => void;
}

// Return type for useBookingStatus hook
export interface UseBookingStatusReturn {
  updateStatus: (
    status: BookingStatus,
    reason?: string
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

// Props for useBookingAvailability hook
export interface UseBookingAvailabilityProps {
  garageId?: string;
  serviceId?: string;
  onSuccess?: (
    data: CheckAvailabilityResponse
  ) => void;
  onError?: (error: string) => void;
}

// Return type for useBookingAvailability hook
export interface UseBookingAvailabilityReturn {
  checkAvailability: (
    date: string,
    timeSlot: TimeSlot
  ) => Promise<
    CheckAvailabilityResponse | undefined
  >;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

// Props for useCreateBooking hook
export interface UseCreateBookingProps {
  onSuccess?: (booking: BookingResponse) => void;
  onError?: (error: string) => void;
}

// Return type for useCreateBooking hook
export interface UseCreateBookingReturn {
  createBooking: (
    data: CreateBookingRequest
  ) => Promise<BookingResponse | undefined>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

// Props for useBookings hook
export interface UseBookingsProps {
  initialFilters?: BookingsFilterParams;
  autoFetch?: boolean;
}

export interface BookingsFilterParams {
  status?: string;
  garageId?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UseBookingsReturn {
  bookings: BookingResponse[];
  stats: BookingStatsSummary | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: (
    filters?: BookingsFilterParams
  ) => Promise<void>;
  setFilters: (
    filters: BookingsFilterParams
  ) => void;
}
