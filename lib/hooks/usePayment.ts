import { useState } from "react";
import { paymentApi } from "../api/payment.api";
import type {
  InitializeGaragePaymentResponse,
  PaymentStatus,
} from "../types/payment.types";
import { AxiosError } from "axios";

export const usePayment = () => {
  const [currentPayment, setCurrentPayment] =
    useState<InitializeGaragePaymentResponse | null>(
      null
    );
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  const initializeGaragePayment = async (
    amount: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Initializing payment with amount:",
        amount
      );

      const response =
        await paymentApi.initializeGaragePayment({
          amount,
        });

      console.log(
        "Payment API response:",
        response
      );

      if (response.success && response.data) {
        setCurrentPayment(response.data);
        return response.data;
      } else {
        setError(
          response.message ||
            "Failed to initialize payment"
        );
        return null;
      }
    } catch (err: unknown) {
      console.error(
        "Payment initialization error:",
        err
      );

      // Type guard for AxiosError
      if (err instanceof AxiosError) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to initialize payment";
        setError(errorMsg);
      }
      // Type guard for Error
      else if (err instanceof Error) {
        setError(err.message);
      }
      // Fallback for unknown error types
      else {
        setError("An unknown error occurred");
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCallback = async (
    txRef: string,
    status: "success" | "cancel" | "failed"
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (status === "success") {
        // Call your verify payment endpoint
        const response =
          await paymentApi.verifyPayment(txRef);

        if (response.success && response.data) {
          setPaymentStatus(response.data);
          return response.data;
        } else {
          setError(
            response.message ||
              "Payment verification failed"
          );
          return null;
        }
      } else {
        setError(`Payment ${status}`);
        return null;
      }
    } catch (err: unknown) {
      console.error(
        "Payment callback error:",
        err
      );

      // Type guard for AxiosError
      if (err instanceof AxiosError) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Payment verification failed";
        setError(errorMsg);
      }
      // Type guard for Error
      else if (err instanceof Error) {
        setError(err.message);
      }
      // Fallback for unknown error types
      else {
        setError("An unknown error occurred");
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearPayment = () => {
    setCurrentPayment(null);
    setPaymentStatus(null);
    setError(null);
  };

  const getExpiryTimeLeft = () => {
    if (!currentPayment?.expiresAt) return null;

    const expiry = new Date(
      currentPayment.expiresAt
    );
    const now = new Date();
    const diffMs =
      expiry.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor(
      (diffMs % 60000) / 1000
    );

    return `${diffMins}m ${diffSecs}s`;
  };

  return {
    currentPayment,
    paymentStatus,
    loading,
    error,
    initializeGaragePayment,
    handlePaymentCallback,
    clearPayment,
    getExpiryTimeLeft,
  };
};
