import { api } from "./api";
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  MyBookingsResponse,
  DeleteBookingResponse,
} from "../types/booking.types";

export const bookingApi = {
  // Create a new booking
  createBooking: async (
    data: CreateBookingRequest
  ): Promise<{
    success: boolean;
    booking: Booking;
  }> => {
    return api.post<{
      success: boolean;
      booking: Booking;
    }>("/bookings/bookings", data);
  },

  // Get user's own bookings (my-bookings)
  getMyBookings: async (): Promise<MyBookingsResponse> => {
    return api.get<MyBookingsResponse>("/bookings/bookings/my-bookings");
  },

  // Get a single booking by ID
  getBookingById: async (
    id: string
  ): Promise<{
    success: boolean;
    booking: Booking;
  }> => {
    return api.get<{
      success: boolean;
      booking: Booking;
    }>(`/bookings/bookings/${id}`);
  },

  // Update booking
  updateBooking: async (
    id: string,
    data: UpdateBookingRequest
  ): Promise<{
    success: boolean;
    booking: Booking;
  }> => {
    return api.put<{
      success: boolean;
      booking: Booking;
    }>(`/bookings/bookings/${id}`, data);
  },

  // Cancel booking (soft delete)
 
cancelBooking: async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Make the DELETE request
    const response = await api.delete<{ message: string }>(
      `/bookings/bookings/soft/${id}`
    );
    
    // Since we got a response without throwing an error, it was successful
    // Return in the format your store expects
    return {
      success: true,
      message: response.message || "Booking cancelled successfully"
    };
  } catch (error: unknown) {
    // Handle any errors (like 403, 404, 500)
    console.error("Cancel booking API error:", error);
    
    // Return failure with error message
    return {
      success: false,
      message: error.message || "Failed to cancel booking"
    };
  }
},
  // Get all bookings (admin only)
  getAllBookings: async (): Promise<{
    success: boolean;
    count: number;
    bookings: Booking[];
  }> => {
    return api.get<{
      success: boolean;
      count: number;
      bookings: Booking[];
    }>("/bookings/bookings");
  },

  // Restore booking (admin only)
  restoreBooking: async (
    id: string
  ): Promise<DeleteBookingResponse> => {
    return api.put<DeleteBookingResponse>(
      `/bookings/bookings/restore/${id}`,
      {}
    );
  },

  // Hard delete booking (admin only)
  hardDeleteBooking: async (
    id: string
  ): Promise<DeleteBookingResponse> => {
    return api.delete<DeleteBookingResponse>(
      `/bookings/bookings/hard/${id}`
    );
  },
};