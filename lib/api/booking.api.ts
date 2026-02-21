import { api } from "./api";
import {
  BookingResponse,
  Booking,
  CreateBookingRequest,
} from "../types/booking.types";

export const bookingApi = {
  // Create a new booking
  createBooking: async (
    data: CreateBookingRequest
  ): Promise<BookingResponse> => {
    return api.post<BookingResponse>(
      "/bookings/bookings",
      data
    );
  },

  // Get a booking by ID
  getBookingById: async (
    id: string
  ): Promise<BookingResponse> => {
    return api.get<BookingResponse>(
      `/bookings/bookings/${id}`
    );
  },

  getBookings: async (params?: {
    userId?: string;
    garageId?: string;
  }): Promise<{
    success: boolean;
    bookings: Booking[];
  }> => {
    return api.get<{
      success: boolean;
      bookings: Booking[];
    }>("/bookings/bookings", {
      params,
    });
  },
};
