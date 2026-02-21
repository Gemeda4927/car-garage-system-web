import { create } from "zustand";
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
} from "../types/booking.types";
import { bookingApi } from "../api/booking.api";

// Helper to safely get error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error)
    return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

interface BookingState {
  bookings: Booking[];
  userBookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;

  // Fetch methods
  fetchAllBookings: () => Promise<void>; // Admin only
  fetchUserBookings: () => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;

  // CRUD operations
  createBooking: (
    data: CreateBookingRequest
  ) => Promise<Booking | null>;
  updateBooking: (
    id: string,
    data: UpdateBookingRequest
  ) => Promise<Booking | null>;
  cancelBooking: (id: string) => Promise<boolean>;

  // State management
  clearSelectedBooking: () => void;
  clearError: () => void;
}

export const useBookingStore =
  create<BookingState>((set, get) => ({
    bookings: [],
    userBookings: [],
    selectedBooking: null,
    loading: false,
    error: null,

    // ✅ Fetch all bookings (admin only)
    fetchAllBookings: async () => {
      set({ loading: true, error: null });
      try {
        const response =
          await bookingApi.getAllBookings();
        set({
          bookings: response.bookings,
          loading: false,
        });
      } catch (error: unknown) {
        set({
          error: getErrorMessage(error),
          loading: false,
        });
      }
    },

    // ✅ Fetch current user's bookings
    fetchUserBookings: async () => {
      set({ loading: true, error: null });
      try {
        const response =
          await bookingApi.getMyBookings();
        set({
          userBookings: response.bookings,
          loading: false,
        });
      } catch (error: unknown) {
        set({
          error: getErrorMessage(error),
          loading: false,
        });
      }
    },

    // ✅ Fetch single booking
    fetchBookingById: async (id) => {
      set({ loading: true, error: null });
      try {
        const response =
          await bookingApi.getBookingById(id);
        set({
          selectedBooking: response.booking,
          loading: false,
        });
      } catch (error: unknown) {
        set({
          error: getErrorMessage(error),
          loading: false,
        });
      }
    },

    // ✅ Create booking + auto update lists
    createBooking: async (data) => {
      set({ loading: true, error: null });

      try {
        const response =
          await bookingApi.createBooking(data);
        const newBooking = response.booking;

        // Add to user bookings list only (regular users don't see all bookings)
        set((state) => ({
          userBookings: [
            newBooking,
            ...state.userBookings,
          ],
          selectedBooking: newBooking,
          loading: false,
        }));

        return newBooking;
      } catch (error: unknown) {
        set({
          error: getErrorMessage(error),
          loading: false,
        });
        return null;
      }
    },

    // ✅ Update booking + update in user bookings list
    updateBooking: async (id, data) => {
      set({ loading: true, error: null });

      try {
        const response =
          await bookingApi.updateBooking(
            id,
            data
          );
        const updatedBooking = response.booking;

        // Update in user bookings list
        set((state) => ({
          userBookings: state.userBookings.map(
            (b) =>
              b._id === id ? updatedBooking : b
          ),
          selectedBooking:
            state.selectedBooking?._id === id
              ? updatedBooking
              : state.selectedBooking,
          loading: false,
        }));

        return updatedBooking;
      } catch (error: unknown) {
        set({
          error: getErrorMessage(error),
          loading: false,
        });
        return null;
      }
    },

    // ✅ Cancel booking (soft delete)
    cancelBooking: async (id) => {
      set({ loading: true, error: null });

      try {
        const response =
          await bookingApi.cancelBooking(id);

        if (response.success) {
          // Remove from user bookings list or mark as cancelled
          set((state) => ({
            userBookings: state.userBookings.map(
              (b) =>
                b._id === id
                  ? {
                      ...b,
                      status: "cancelled",
                      isDeleted: true,
                    }
                  : b
            ),
            selectedBooking:
              state.selectedBooking?._id === id
                ? {
                    ...state.selectedBooking,
                    status: "cancelled",
                    isDeleted: true,
                  }
                : state.selectedBooking,
            loading: false,
          }));

          return true;
        } else {
          throw new Error(
            response.message ||
              "Failed to cancel booking"
          );
        }
      } catch (error: unknown) {
        set({
          error: getErrorMessage(error),
          loading: false,
        });
        return false;
      }
    },

    // ✅ Clear selected booking
    clearSelectedBooking: () =>
      set({ selectedBooking: null }),

    // ✅ Clear error manually
    clearError: () => set({ error: null }),
  }));
