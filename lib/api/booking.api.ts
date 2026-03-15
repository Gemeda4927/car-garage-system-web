import {
  ApiResponse,
  BookingStatusResponse,
  UpdateBookingStatusRequest,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  BookingResponse,
  BookingsListResponse,
  BookingStatsResponse,
  BookingCalendarResponse,
} from "../types/booking.types";
import api from "./api";

// Custom error class for API errors
class ApiError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

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
        ApiResponse<BookingStatusResponse>
      >(
        `${this.basePath}/${bookingId}/status`,
        data
      );

      console.log(
        "✅ Booking status updated successfully"
      );
      
      // Return the data property which contains the actual ApiResponse
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to update booking ${bookingId} status:`,
        error
      );

      // Type guard to check if error is an object with response property
      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to update booking status";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Check availability for a time slot
   * POST /api/bookings/check-availability
   */
  async checkAvailability(
    data: CheckAvailabilityRequest
  ): Promise<ApiResponse<CheckAvailabilityResponse>> {
    try {
      console.log(
        `📍 Checking availability for garage: ${data.garageId}, date: ${data.date}, time: ${data.timeSlot.start}`
      );

      const response = await api.post<
        ApiResponse<CheckAvailabilityResponse>
      >(
        `${this.basePath}/check-availability`,
        data
      );

      console.log(
        "✅ Availability check completed:",
        response.data
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to check availability:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to check availability";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Create a new booking
   * POST /api/bookings
   */
  async createBooking(
    data: CreateBookingRequest
  ): Promise<ApiResponse<CreateBookingResponse>> {
    try {
      console.log(
        `📍 Creating new booking for garage: ${data.garageId}, service: ${data.serviceId}`
      );

      const response = await api.post<
        ApiResponse<CreateBookingResponse>
      >(
        `${this.basePath}`,
        data
      );

      console.log(
        "✅ Booking created successfully with ID:",
        response.data.data.booking.id
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to create booking:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to create booking";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Get all bookings (with filters)
   * GET /api/bookings
   */
  async getAllBookings(params?: {
    status?: string;
    garageId?: string;
    serviceId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<BookingsListResponse>> {
    try {
      console.log(
        `📍 Fetching all bookings with params:`,
        params
      );

      const response = await api.get<
        ApiResponse<BookingsListResponse>
      >(`${this.basePath}`, { params });

      console.log(
        `✅ Fetched ${response.data.data.bookings.length} bookings successfully`
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to fetch bookings:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to fetch bookings";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Get single booking by ID
   * GET /api/bookings/{bookingId}
   */
  async getBookingById(
    bookingId: string
  ): Promise<ApiResponse<{ booking: BookingResponse }>> {
    try {
      console.log(
        `📍 Fetching booking with ID: ${bookingId}`
      );

      const response = await api.get<
        ApiResponse<{ booking: BookingResponse }>
      >(`${this.basePath}/${bookingId}`);

      console.log(
        `✅ Booking fetched successfully`
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to fetch booking ${bookingId}:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to fetch booking";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Cancel booking (by car owner)
   * PUT /api/bookings/{bookingId}/cancel
   */
  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<ApiResponse<BookingStatusResponse>> {
    try {
      console.log(
        `📍 Cancelling booking ${bookingId}`
      );

      const response = await api.put<
        ApiResponse<BookingStatusResponse>
      >(
        `${this.basePath}/${bookingId}/cancel`,
        { reason }
      );

      console.log(
        `✅ Booking cancelled successfully`
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to cancel booking ${bookingId}:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to cancel booking";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Get booking timeline/history
   * GET /api/bookings/{bookingId}/timeline
   */
  async getBookingTimeline(
    bookingId: string
  ): Promise<ApiResponse<{
    bookingId: string;
    currentStatus: string;
    timeline: Array<{
      event: string;
      status: string;
      timestamp: string;
      description: string;
      changedBy?: string;
    }>;
  }>> {
    try {
      console.log(
        `📍 Fetching timeline for booking ${bookingId}`
      );

      const response = await api.get<
        ApiResponse<{
          bookingId: string;
          currentStatus: string;
          timeline: Array<{
            event: string;
            status: string;
            timestamp: string;
            description: string;
            changedBy?: string;
          }>;
        }>
      >(`${this.basePath}/${bookingId}/timeline`);

      console.log(
        `✅ Booking timeline fetched successfully`
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to fetch timeline for booking ${bookingId}:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to fetch booking timeline";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Get bookings by date range (calendar view)
   * GET /api/bookings/calendar/range
   */
  async getBookingsCalendar(params: {
    startDate: string;
    endDate: string;
    garageId?: string;
  }): Promise<ApiResponse<BookingCalendarResponse>> {
    try {
      console.log(
        `📍 Fetching calendar bookings from ${params.startDate} to ${params.endDate}`
      );

      const response = await api.get<
        ApiResponse<BookingCalendarResponse>
      >(`${this.basePath}/calendar/range`, { params });

      console.log(
        `✅ Calendar bookings fetched successfully`
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to fetch calendar bookings:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to fetch calendar bookings";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Get booking statistics
   * GET /api/bookings/stats/analytics
   */
  async getBookingStats(params?: {
    garageId?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<ApiResponse<BookingStatsResponse>> {
    try {
      console.log(
        `📍 Fetching booking stats with params:`,
        params
      );

      const response = await api.get<
        ApiResponse<BookingStatsResponse>
      >(`${this.basePath}/stats/analytics`, { params });

      console.log(
        `✅ Booking stats fetched successfully`
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to fetch booking stats:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to fetch booking stats";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }

  /**
   * Soft delete booking
   * DELETE /api/bookings/{bookingId}
   */
  async deleteBooking(
    bookingId: string
  ): Promise<ApiResponse<null>> {
    try {
      console.log(
        `📍 Deleting booking ${bookingId}`
      );

      const response = await api.delete<
        ApiResponse<null>
      >(`${this.basePath}/${bookingId}`);

      console.log(
        `✅ Booking deleted successfully`
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error(
        `❌ Failed to delete booking ${bookingId}:`,
        error
      );

      const isApiError = (err: unknown): err is { response?: { data?: { message?: string }; status?: number } } => {
        return typeof err === 'object' && err !== null;
      };

      let message = "Failed to delete booking";
      let statusCode: number | undefined;

      if (isApiError(error)) {
        message = error.response?.data?.message || message;
        statusCode = error.response?.status;
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new ApiError(message, statusCode, error);
    }
  }
}

// Export singleton instance
export const bookingStatusService =
  new BookingStatusService();