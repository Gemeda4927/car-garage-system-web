import { useCallback } from "react";
import {
  BookingStatus,
  UseBookingStatusProps,
  UseBookingStatusReturn,
} from "../types/booking.types";
import { useBookingStatusStore } from "../store/booking.store";

/**
 * Custom hook for updating booking status
 * Only handles the status update endpoint
 */
export const useBookingStatus = ({
  bookingId,
  onSuccess,
  onError,
}: UseBookingStatusProps): UseBookingStatusReturn => {
  const {
    updateBookingStatus,
    isLoading,
    error,
    clearError,
  } = useBookingStatusStore();

  const updateStatus = useCallback(
    async (
      status: BookingStatus,
      reason?: string
    ) => {
      try {
        const updatedBooking =
          await updateBookingStatus(
            bookingId,
            status,
            reason
          );

        if (updatedBooking) {
          onSuccess?.(updatedBooking);
        } else {
          onError?.(
            error ||
              "Failed to update booking status"
          );
        }
      } catch (err: any) {
        onError?.(
          err.message ||
            "Failed to update booking status"
        );
      }
    },
    [
      bookingId,
      updateBookingStatus,
      onSuccess,
      onError,
      error,
    ]
  );

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    updateStatus,
    isLoading,
    error,
    reset,
  };
};
