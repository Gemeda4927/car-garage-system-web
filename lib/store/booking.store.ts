import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  BookingResponse, 
  BookingStatus,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  CreateBookingRequest,
  BookingsFilterParams,
  BookingStatsResponse,
  BookingCalendarResponse,
  BookingTimelineResponse
} from '../types/booking.types';
import { bookingStatusService } from '../api/booking.api';

interface BookingStoreState {
  // State - Single Booking
  currentBooking: BookingResponse | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // State - Bookings List
  bookings: BookingResponse[];
  bookingsStats: {
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

  // State - Availability
  availabilityResult: CheckAvailabilityResponse | null;

  // State - Timeline
  timeline: BookingTimelineResponse | null;

  // State - Calendar
  calendarBookings: BookingCalendarResponse | null;

  // State - Stats
  analyticsStats: BookingStatsResponse | null;

  // Actions - Status Management
  updateBookingStatus: (
    bookingId: string, 
    status: BookingStatus, 
    reason?: string
  ) => Promise<BookingResponse | null>;
  
  // Actions - Booking CRUD
  createBooking: (
    data: CreateBookingRequest
  ) => Promise<BookingResponse | null>;
  
  getBookingById: (
    bookingId: string
  ) => Promise<BookingResponse | null>;
  
  getAllBookings: (
    params?: BookingsFilterParams
  ) => Promise<void>;
  
  cancelBooking: (
    bookingId: string,
    reason?: string
  ) => Promise<BookingResponse | null>;
  
  deleteBooking: (
    bookingId: string
  ) => Promise<boolean>;

  // Actions - Availability & Info
  checkAvailability: (
    data: CheckAvailabilityRequest
  ) => Promise<CheckAvailabilityResponse | null>;
  
  getBookingTimeline: (
    bookingId: string
  ) => Promise<BookingTimelineResponse | null>;
  
  getBookingsCalendar: (
    params: {
      startDate: string;
      endDate: string;
      garageId?: string;
    }
  ) => Promise<BookingCalendarResponse | null>;
  
  getBookingStats: (
    params?: {
      garageId?: string;
      period?: 'day' | 'week' | 'month' | 'year';
    }
  ) => Promise<BookingStatsResponse | null>;

  // State Management Actions
  setCurrentBooking: (booking: BookingResponse | null) => void;
  clearError: () => void;
  reset: () => void;
  resetBookingsList: () => void;
}

export const useBookingStore = create<BookingStoreState>()(
  devtools(
    (set, get) => ({
      // ==========================================
      // INITIAL STATE
      // ==========================================
      currentBooking: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
      bookings: [],
      bookingsStats: null,
      pagination: null,
      availabilityResult: null,
      timeline: null,
      calendarBookings: null,
      analyticsStats: null,

      // ==========================================
      // STATUS MANAGEMENT
      // ==========================================
      updateBookingStatus: async (bookingId: string, status: BookingStatus, reason?: string) => {
        // Validate reason for rejection or cancellation
        if ((status === BookingStatus.REJECTED || status === BookingStatus.CANCELLED) && !reason) {
          const errorMessage = `Reason is required when ${status === BookingStatus.REJECTED ? 'rejecting' : 'cancelling'} a booking`;
          set({ error: errorMessage });
          return null;
        }

        set({ isLoading: true, error: null });
        
        try {
          const requestData = { 
            status, 
            ...(reason && { reason }) 
          };
          
          const response = await bookingStatusService.updateStatus(bookingId, requestData);
          
          if (response.success && response.data) {
            const updatedBooking = response.data.booking;
            
            // Update in bookings list if present
            const currentBookings = get().bookings;
            const updatedBookings = currentBookings.map(booking => 
              booking._id === bookingId ? updatedBooking : booking
            );
            
            set({ 
              currentBooking: updatedBooking,
              bookings: updatedBookings,
              isLoading: false,
              lastUpdated: new Date().toISOString(),
              error: null
            });
            
            console.log(`✅ Booking ${bookingId} status updated to: ${status}`);
            return updatedBooking;
          } else {
            const errorMessage = response.message || 'Failed to update booking status';
            set({ 
              error: errorMessage,
              isLoading: false 
            });
            return null;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update booking status';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Status update error:', error);
          return null;
        }
      },

      // ==========================================
      // BOOKING CRUD
      // ==========================================
      createBooking: async (data: CreateBookingRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.createBooking(data);
          
          if (response.success && response.data) {
            const newBooking = response.data.booking;
            
            set({ 
              currentBooking: newBooking,
              isLoading: false,
              lastUpdated: new Date().toISOString(),
              error: null
            });
            
            // Optionally add to bookings list
            const currentBookings = get().bookings;
            set({ bookings: [newBooking, ...currentBookings] });
            
            console.log(`✅ Booking created successfully with ID: ${newBooking.id}`);
            return newBooking;
          } else {
            const errorMessage = response.message || 'Failed to create booking';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Create booking error:', error);
          return null;
        }
      },

      getBookingById: async (bookingId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.getBookingById(bookingId);
          
          if (response.success && response.data) {
            const booking = response.data.booking;
            
            set({ 
              currentBooking: booking,
              isLoading: false,
              lastUpdated: new Date().toISOString(),
              error: null
            });
            
            console.log(`✅ Booking ${bookingId} fetched successfully`);
            return booking;
          } else {
            const errorMessage = response.message || 'Failed to fetch booking';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Get booking error:', error);
          return null;
        }
      },

      getAllBookings: async (params?: BookingsFilterParams) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.getAllBookings(params);
          
          if (response.success && response.data) {
            const { bookings, stats, pagination } = response.data;
            
            set({ 
              bookings,
              bookingsStats: stats,
              pagination,
              isLoading: false,
              lastUpdated: new Date().toISOString(),
              error: null
            });
            
            console.log(`✅ Fetched ${bookings.length} bookings successfully`);
          } else {
            const errorMessage = response.message || 'Failed to fetch bookings';
            set({ error: errorMessage, isLoading: false });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Get all bookings error:', error);
        }
      },

      cancelBooking: async (bookingId: string, reason?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.cancelBooking(bookingId, reason);
          
          if (response.success && response.data) {
            const cancelledBooking = response.data.booking;
            
            // Update in bookings list if present
            const currentBookings = get().bookings;
            const updatedBookings = currentBookings.map(booking => 
              booking._id === bookingId ? cancelledBooking : booking
            );
            
            set({ 
              currentBooking: cancelledBooking,
              bookings: updatedBookings,
              isLoading: false,
              lastUpdated: new Date().toISOString(),
              error: null
            });
            
            console.log(`✅ Booking ${bookingId} cancelled successfully`);
            return cancelledBooking;
          } else {
            const errorMessage = response.message || 'Failed to cancel booking';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Cancel booking error:', error);
          return null;
        }
      },

      deleteBooking: async (bookingId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.deleteBooking(bookingId);
          
          if (response.success) {
            // Remove from bookings list if present
            const currentBookings = get().bookings;
            const updatedBookings = currentBookings.filter(booking => booking._id !== bookingId);
            
            set({ 
              bookings: updatedBookings,
              currentBooking: get().currentBooking?._id === bookingId ? null : get().currentBooking,
              isLoading: false,
              lastUpdated: new Date().toISOString(),
              error: null
            });
            
            console.log(`✅ Booking ${bookingId} deleted successfully`);
            return true;
          } else {
            const errorMessage = response.message || 'Failed to delete booking';
            set({ error: errorMessage, isLoading: false });
            return false;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete booking';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Delete booking error:', error);
          return false;
        }
      },

      // ==========================================
      // AVAILABILITY & INFO
      // ==========================================
      checkAvailability: async (data: CheckAvailabilityRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.checkAvailability(data);
          
          if (response.success && response.data) {
            set({ 
              availabilityResult: response.data,
              isLoading: false,
              error: null
            });
            
            console.log(`✅ Availability check completed:`, response.data);
            return response.data;
          } else {
            const errorMessage = response.message || 'Failed to check availability';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to check availability';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Check availability error:', error);
          return null;
        }
      },

      getBookingTimeline: async (bookingId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.getBookingTimeline(bookingId);
          
          if (response.success && response.data) {
            set({ 
              timeline: response.data,
              isLoading: false,
              error: null
            });
            
            console.log(`✅ Timeline fetched for booking ${bookingId}`);
            return response.data;
          } else {
            const errorMessage = response.message || 'Failed to fetch timeline';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch timeline';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Get timeline error:', error);
          return null;
        }
      },

      getBookingsCalendar: async (params: { startDate: string; endDate: string; garageId?: string }) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.getBookingsCalendar(params);
          
          if (response.success && response.data) {
            set({ 
              calendarBookings: response.data,
              isLoading: false,
              error: null
            });
            
            console.log(`✅ Calendar bookings fetched successfully`);
            return response.data;
          } else {
            const errorMessage = response.message || 'Failed to fetch calendar bookings';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch calendar bookings';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Get calendar error:', error);
          return null;
        }
      },

      getBookingStats: async (params?: { garageId?: string; period?: 'day' | 'week' | 'month' | 'year' }) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await bookingStatusService.getBookingStats(params);
          
          if (response.success && response.data) {
            set({ 
              analyticsStats: response.data,
              isLoading: false,
              error: null
            });
            
            console.log(`✅ Booking stats fetched successfully`);
            return response.data;
          } else {
            const errorMessage = response.message || 'Failed to fetch booking stats';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking stats';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Get stats error:', error);
          return null;
        }
      },

      // ==========================================
      // STATE MANAGEMENT ACTIONS
      // ==========================================
      setCurrentBooking: (booking) => set({ currentBooking: booking }),

      clearError: () => set({ error: null }),

      reset: () => set({ 
        currentBooking: null, 
        isLoading: false, 
        error: null,
        lastUpdated: null,
        bookings: [],
        bookingsStats: null,
        pagination: null,
        availabilityResult: null,
        timeline: null,
        calendarBookings: null,
        analyticsStats: null
      }),

      resetBookingsList: () => set({ 
        bookings: [],
        bookingsStats: null,
        pagination: null
      }),
    }),
    { name: 'booking-store' }
  )
);