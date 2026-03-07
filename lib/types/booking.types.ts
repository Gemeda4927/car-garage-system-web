// types/booking-status.types.ts

// Booking Status Enum
export enum BookingStatus {
  PENDING = "pending",
  APPROVED = "approved",
  IN_PROGRESS = "inProgress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

// Request DTO for updating booking status
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  reason?: string; // Required for rejection/cancellation
}

// Response DTO
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Booking response (simplified for status update)
export interface Booking {
  _id: string;
  status: BookingStatus;
  updatedAt: string;
  garage: {
    _id: string;
    name: string;
  } | null;
  carOwner: {
    _id: string;
    name: string;
  };
  service: {
    _id: string;
    name: string;
  };
  bookingDate: string;
  timeSlot: {
    start: string;
    end: string;
  };
}

export interface BookingStatusResponse {
  booking: Booking;
}

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
