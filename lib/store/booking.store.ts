import { create } from "zustand";
import {
  Booking,
  CreateBookingRequest,
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
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;

  fetchBookings: (params?: {
    userId?: string;
    garageId?: string;
  }) => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  createBooking: (
    data: CreateBookingRequest
  ) => Promise<Booking | null>;
  clearSelectedBooking: () => void;
  clearError: () => void;
}

export const useBookingStore =
  create<BookingState>((set, get) => ({
    bookings: [],
    selectedBooking: null,
    loading: false,
    error: null,

    // ✅ Fetch all bookings
    fetchBookings: async (params) => {
      set({ loading: true, error: null });
      try {
        const response =
          await bookingApi.getBookings(params);

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

    // ✅ Create booking + auto update list
    createBooking: async (data) => {
      set({ loading: true, error: null });

      try {
        const response =
          await bookingApi.createBooking(data);
        const newBooking = response.booking;

        // Add newly created booking to state
        set((state) => ({
          bookings: [
            newBooking,
            ...state.bookings,
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

    // ✅ Clear selected booking
    clearSelectedBooking: () =>
      set({ selectedBooking: null }),

    // ✅ Clear error manually
    clearError: () => set({ error: null }),
  }));
