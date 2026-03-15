import { useCallback } from "react";
import {
  BookingStatus,
  BookingResponse,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  CreateBookingRequest,
  BookingsFilterParams,
  BookingStatsResponse,
  BookingCalendarResponse,
  BookingTimelineResponse,
} from "../types/booking.types";
import { useBookingStore } from "../store/booking.store";

// ==========================================
// HOOK: useBookingStatus - Update booking status
// ==========================================
export interface UseBookingStatusProps {
  bookingId: string;
  onSuccess?: (booking: BookingResponse) => void;
  onError?: (error: string) => void;
}

export interface UseBookingStatusReturn {
  updateStatus: (status: BookingStatus, reason?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useBookingStatus = ({
  bookingId,
  onSuccess,
  onError,
}: UseBookingStatusProps): UseBookingStatusReturn => {
  const { updateBookingStatus, isLoading, error, clearError } = useBookingStore();

  const updateStatus = useCallback(
    async (status: BookingStatus, reason?: string) => {
      try {
        const updatedBooking = await updateBookingStatus(bookingId, status, reason);

        if (updatedBooking) {
          onSuccess?.(updatedBooking);
        } else {
          const currentError = useBookingStore.getState().error;
          onError?.(currentError || "Failed to update booking status");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update booking status";
        onError?.(errorMessage);
      }
    },
    [bookingId, updateBookingStatus, onSuccess, onError]
  );

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { updateStatus, isLoading, error, reset };
};

// ==========================================
// HOOK: useCreateBooking - Create a new booking
// ==========================================
export interface UseCreateBookingProps {
  onSuccess?: (booking: BookingResponse) => void;
  onError?: (error: string) => void;
}

export interface UseCreateBookingReturn {
  createBooking: (data: CreateBookingRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useCreateBooking = ({
  onSuccess,
  onError,
}: UseCreateBookingProps = {}): UseCreateBookingReturn => {
  const { createBooking: createBookingAction, isLoading, error, clearError } = useBookingStore();

  const createBooking = useCallback(
    async (data: CreateBookingRequest) => {
      try {
        const newBooking = await createBookingAction(data);

        if (newBooking) {
          onSuccess?.(newBooking);
        } else {
          const currentError = useBookingStore.getState().error;
          onError?.(currentError || "Failed to create booking");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create booking";
        onError?.(errorMessage);
      }
    },
    [createBookingAction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { createBooking, isLoading, error, reset };
};

// ==========================================
// HOOK: useBookingDetail - Get single booking by ID
// ==========================================
export interface UseBookingDetailProps {
  bookingId: string;
  autoFetch?: boolean;
  onSuccess?: (booking: BookingResponse) => void;
  onError?: (error: string) => void;
}

export interface UseBookingDetailReturn {
  booking: BookingResponse | null;
  fetchBooking: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useBookingDetail = ({
  bookingId,
  autoFetch = true,
  onSuccess,
  onError,
}: UseBookingDetailProps): UseBookingDetailReturn => {
  const { getBookingById, currentBooking, isLoading, error, clearError } = useBookingStore();

  const fetchBooking = useCallback(async () => {
    try {
      const booking = await getBookingById(bookingId);

      if (booking) {
        onSuccess?.(booking);
      } else {
        const currentError = useBookingStore.getState().error;
        onError?.(currentError || "Failed to fetch booking");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch booking";
      onError?.(errorMessage);
    }
  }, [bookingId, getBookingById, onSuccess, onError]);

  // Auto-fetch on mount if enabled
  useCallback(() => {
    if (autoFetch && bookingId) {
      fetchBooking();
    }
  }, [autoFetch, bookingId, fetchBooking]);

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { booking: currentBooking, fetchBooking, isLoading, error, reset };
};

// ==========================================
// HOOK: useBookingsList - Get all bookings with filters
// ==========================================
export interface UseBookingsListProps {
  initialFilters?: BookingsFilterParams;
  autoFetch?: boolean;
  onSuccess?: (data: { bookings: BookingResponse[]; total: number }) => void;
  onError?: (error: string) => void;
}

export interface UseBookingsListReturn {
  bookings: BookingResponse[];
  stats: {
    totalBookings: number;
    pendingCount: number;
    approvedCount: number;
    inProgressCount: number;
    completedCount: number;
    cancelledCount: number;
    rejectedCount: number;
  } | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchBookings: (filters?: BookingsFilterParams) => Promise<void>;
  setFilters: (filters: BookingsFilterParams) => void;
  reset: () => void;
}

export const useBookingsList = ({
  initialFilters,
  autoFetch = true,
  onSuccess,
  onError,
}: UseBookingsListProps = {}): UseBookingsListReturn => {
  const { 
    getAllBookings, 
    bookings, 
    bookingsStats, 
    pagination, 
    isLoading, 
    error, 
    clearError 
  } = useBookingStore();

  const fetchBookings = useCallback(
    async (filters?: BookingsFilterParams) => {
      try {
        await getAllBookings(filters || initialFilters);

        if (bookings.length > 0) {
          onSuccess?.({ bookings, total: pagination?.total || 0 });
        } else {
          const currentError = useBookingStore.getState().error;
          if (currentError) onError?.(currentError);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch bookings";
        onError?.(errorMessage);
      }
    },
    [getAllBookings, initialFilters, bookings, pagination, onSuccess, onError]
  );

  const setFilters = useCallback(
    (filters: BookingsFilterParams) => {
      fetchBookings(filters);
    },
    [fetchBookings]
  );

  // Auto-fetch on mount if enabled
  useCallback(() => {
    if (autoFetch) {
      fetchBookings(initialFilters);
    }
  }, [autoFetch, initialFilters, fetchBookings]);

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { 
    bookings, 
    stats: bookingsStats,
    pagination,
    isLoading, 
    error, 
    fetchBookings, 
    setFilters,
    reset 
  };
};

// ==========================================
// HOOK: useCancelBooking - Cancel a booking
// ==========================================
export interface UseCancelBookingProps {
  bookingId: string;
  onSuccess?: (booking: BookingResponse) => void;
  onError?: (error: string) => void;
}

export interface UseCancelBookingReturn {
  cancelBooking: (reason?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useCancelBooking = ({
  bookingId,
  onSuccess,
  onError,
}: UseCancelBookingProps): UseCancelBookingReturn => {
  const { cancelBooking: cancelBookingAction, isLoading, error, clearError } = useBookingStore();

  const cancelBooking = useCallback(
    async (reason?: string) => {
      try {
        const cancelledBooking = await cancelBookingAction(bookingId, reason);

        if (cancelledBooking) {
          onSuccess?.(cancelledBooking);
        } else {
          const currentError = useBookingStore.getState().error;
          onError?.(currentError || "Failed to cancel booking");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to cancel booking";
        onError?.(errorMessage);
      }
    },
    [bookingId, cancelBookingAction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { cancelBooking, isLoading, error, reset };
};

// ==========================================
// HOOK: useDeleteBooking - Delete a booking
// ==========================================
export interface UseDeleteBookingProps {
  bookingId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseDeleteBookingReturn {
  deleteBooking: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useDeleteBooking = ({
  bookingId,
  onSuccess,
  onError,
}: UseDeleteBookingProps): UseDeleteBookingReturn => {
  const { deleteBooking: deleteBookingAction, isLoading, error, clearError } = useBookingStore();

  const deleteBooking = useCallback(async () => {
    try {
      const success = await deleteBookingAction(bookingId);

      if (success) {
        onSuccess?.();
      } else {
        const currentError = useBookingStore.getState().error;
        onError?.(currentError || "Failed to delete booking");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete booking";
      onError?.(errorMessage);
    }
  }, [bookingId, deleteBookingAction, onSuccess, onError]);

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { deleteBooking, isLoading, error, reset };
};

// ==========================================
// HOOK: useCheckAvailability - Check time slot availability
// ==========================================
export interface UseCheckAvailabilityProps {
  garageId?: string;
  serviceId?: string;
  onSuccess?: (data: CheckAvailabilityResponse) => void;
  onError?: (error: string) => void;
}

export interface UseCheckAvailabilityReturn {
  availability: CheckAvailabilityResponse | null;
  checkAvailability: (date: string, timeSlot: { start: string; end: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useCheckAvailability = ({
  garageId,
  serviceId,
  onSuccess,
  onError,
}: UseCheckAvailabilityProps = {}): UseCheckAvailabilityReturn => {
  const { checkAvailability: checkAction, availabilityResult, isLoading, error, clearError } = useBookingStore();

  const checkAvailability = useCallback(
    async (date: string, timeSlot: { start: string; end: string }) => {
      if (!garageId) {
        onError?.("Garage ID is required");
        return;
      }

      try {
        const result = await checkAction({
          garageId,
          serviceId,
          date,
          timeSlot,
        });

        if (result) {
          onSuccess?.(result);
        } else {
          const currentError = useBookingStore.getState().error;
          if (currentError) onError?.(currentError);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to check availability";
        onError?.(errorMessage);
      }
    },
    [garageId, serviceId, checkAction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { availability: availabilityResult, checkAvailability, isLoading, error, reset };
};

// ==========================================
// HOOK: useBookingTimeline - Get booking timeline
// ==========================================
export interface UseBookingTimelineProps {
  bookingId: string;
  autoFetch?: boolean;
  onSuccess?: (timeline: BookingTimelineResponse) => void;
  onError?: (error: string) => void;
}

export interface UseBookingTimelineReturn {
  timeline: BookingTimelineResponse | null;
  fetchTimeline: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useBookingTimeline = ({
  bookingId,
  autoFetch = true,
  onSuccess,
  onError,
}: UseBookingTimelineProps): UseBookingTimelineReturn => {
  const { getBookingTimeline, timeline, isLoading, error, clearError } = useBookingStore();

  const fetchTimeline = useCallback(async () => {
    try {
      const result = await getBookingTimeline(bookingId);

      if (result) {
        onSuccess?.(result);
      } else {
        const currentError = useBookingStore.getState().error;
        onError?.(currentError || "Failed to fetch timeline");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch timeline";
      onError?.(errorMessage);
    }
  }, [bookingId, getBookingTimeline, onSuccess, onError]);

  // Auto-fetch on mount if enabled
  useCallback(() => {
    if (autoFetch && bookingId) {
      fetchTimeline();
    }
  }, [autoFetch, bookingId, fetchTimeline]);

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { timeline, fetchTimeline, isLoading, error, reset };
};

// ==========================================
// HOOK: useBookingCalendar - Get calendar view
// ==========================================
export interface UseBookingCalendarProps {
  initialParams?: {
    startDate: string;
    endDate: string;
    garageId?: string;
  };
  autoFetch?: boolean;
  onSuccess?: (data: BookingCalendarResponse) => void;
  onError?: (error: string) => void;
}

export interface UseBookingCalendarReturn {
  calendarData: BookingCalendarResponse | null;
  fetchCalendar: (params: { startDate: string; endDate: string; garageId?: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useBookingCalendar = ({
  initialParams,
  autoFetch = true,
  onSuccess,
  onError,
}: UseBookingCalendarProps = {}): UseBookingCalendarReturn => {
  const { getBookingsCalendar, calendarBookings, isLoading, error, clearError } = useBookingStore();

  const fetchCalendar = useCallback(
    async (params: { startDate: string; endDate: string; garageId?: string }) => {
      try {
        const result = await getBookingsCalendar(params);

        if (result) {
          onSuccess?.(result);
        } else {
          const currentError = useBookingStore.getState().error;
          if (currentError) onError?.(currentError);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch calendar";
        onError?.(errorMessage);
      }
    },
    [getBookingsCalendar, onSuccess, onError]
  );

  // Auto-fetch on mount if enabled
  useCallback(() => {
    if (autoFetch && initialParams) {
      fetchCalendar(initialParams);
    }
  }, [autoFetch, initialParams, fetchCalendar]);

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { calendarData: calendarBookings, fetchCalendar, isLoading, error, reset };
};

// ==========================================
// HOOK: useBookingAnalytics - Get booking statistics
// ==========================================
export interface UseBookingAnalyticsProps {
  initialParams?: {
    garageId?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  };
  autoFetch?: boolean;
  onSuccess?: (stats: BookingStatsResponse) => void;
  onError?: (error: string) => void;
}

export interface UseBookingAnalyticsReturn {
  stats: BookingStatsResponse | null;
  fetchStats: (params?: { garageId?: string; period?: 'day' | 'week' | 'month' | 'year' }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useBookingAnalytics = ({
  initialParams,
  autoFetch = true,
  onSuccess,
  onError,
}: UseBookingAnalyticsProps = {}): UseBookingAnalyticsReturn => {
  const { getBookingStats, analyticsStats, isLoading, error, clearError } = useBookingStore();

  const fetchStats = useCallback(
    async (params?: { garageId?: string; period?: 'day' | 'week' | 'month' | 'year' }) => {
      try {
        const result = await getBookingStats(params || initialParams);

        if (result) {
          onSuccess?.(result);
        } else {
          const currentError = useBookingStore.getState().error;
          if (currentError) onError?.(currentError);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch stats";
        onError?.(errorMessage);
      }
    },
    [getBookingStats, initialParams, onSuccess, onError]
  );

  // Auto-fetch on mount if enabled
  useCallback(() => {
    if (autoFetch) {
      fetchStats(initialParams);
    }
  }, [autoFetch, initialParams, fetchStats]);

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return { stats: analyticsStats, fetchStats, isLoading, error, reset };
};