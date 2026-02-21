import { useEffect, useCallback } from "react";
import { useBookingStore } from "../store/booking.store";

interface BookingFilter {
  userId?: string;
  garageId?: string;
}

export const useBookings = (
  params?: BookingFilter
) => {
  const bookings = useBookingStore(
    (s) => s.bookings
  );
  const loading = useBookingStore(
    (s) => s.loading
  );
  const error = useBookingStore((s) => s.error);
  const fetchBookings = useBookingStore(
    (s) => s.fetchBookings
  );

  const stableParams = JSON.stringify(
    params ?? {}
  );

  useEffect(() => {
    fetchBookings(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableParams]);

  const refetch = useCallback(() => {
    fetchBookings(params);
  }, [fetchBookings, params]);

  return {
    bookings,
    loading,
    error,
    refetch,
  };
};
