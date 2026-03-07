
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Booking } from '../types/apiClient.types';
import { BookingStatus, UpdateBookingStatusRequest } from '../types/booking.types';
import { bookingStatusService } from '../api/booking.api';


interface BookingStatusState {
  // State
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  updateBookingStatus: (
    bookingId: string, 
    status: BookingStatus, 
    reason?: string
  ) => Promise<Booking | null>;
  
  setCurrentBooking: (booking: Booking | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useBookingStatusStore = create<BookingStatusState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentBooking: null,
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Update booking status
      updateBookingStatus: async (bookingId: string, status: BookingStatus, reason?: string) => {
        // Validate reason for rejection
        if (status === BookingStatus.REJECTED && !reason) {
          set({ error: 'Reason is required when rejecting a booking' });
          return null;
        }

        set({ isLoading: true, error: null });
        
        try {
          const requestData: UpdateBookingStatusRequest = { 
            status, 
            ...(reason && { reason }) 
          };
          
          const response = await bookingStatusService.updateStatus(bookingId, requestData);
          
          if (response.success) {
            const updatedBooking = response.data.booking;
            
            set({ 
              currentBooking: updatedBooking,
              isLoading: false,
              lastUpdated: new Date().toISOString()
            });
            
            console.log(`✅ Booking ${bookingId} status updated to: ${status}`);
            return updatedBooking;
          } else {
            set({ 
              error: 'Failed to update booking status',
              isLoading: false 
            });
            return null;
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to update booking status';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          console.error('❌ Status update error:', error);
          return null;
        }
      },

      // Set current booking
      setCurrentBooking: (booking) => set({ currentBooking: booking }),

      // Clear error
      clearError: () => set({ error: null }),

      // Reset store
      reset: () => set({ 
        currentBooking: null, 
        isLoading: false, 
        error: null,
        lastUpdated: null 
      }),
    }),
    { name: 'booking-status-store' }
  )
);