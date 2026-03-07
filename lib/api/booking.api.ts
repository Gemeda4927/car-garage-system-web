import {
  ApiResponse,
  BookingStatusResponse,
  UpdateBookingStatusRequest,
} from "../types/booking.types";
import api from "./api";

class BookingStatusService {
  private readonly basePath = "bookings";

  /**
   * Update booking status
   * PUT /api/bookings/{bookingId}/status
   */
  async updateStatus(
    bookingId: string,
    data: UpdateBookingStatusRequest
  ): Promise<ApiResponse<BookingStatusResponse>> {
    try {
      console.log(
        `📍 Updating booking ${bookingId} status to:`,
        data.status
      );

      const response = await api.put<
        ApiResponse<BookingStatusResponse>,
        UpdateBookingStatusRequest
      >(
        `${this.basePath}/${bookingId}/status`,
        data
      );

      console.log(
        "✅ Booking status updated successfully"
      );
      return response;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to update booking ${bookingId} status:`,
        error
      );

      // Enhance error with more context
      const enhancedError = new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update booking status"
      );
      (enhancedError as any).statusCode =
        error.response?.status;
      (enhancedError as any).originalError =
        error;

      throw enhancedError;
    }
  }
}

// Export singleton instance
export const bookingStatusService =
  new BookingStatusService();
