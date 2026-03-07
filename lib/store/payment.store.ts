// store/payment.store.ts
import { create } from "zustand";
import { paymentApi } from "../api/payment.api";
import type {
  InitializeGaragePaymentResponse,
  PaymentStatus,
} from "../types/payment.types";

interface PaymentState {
  currentPayment: InitializeGaragePaymentResponse | null;
  paymentStatus: PaymentStatus | null;
  loading: boolean;
  error: string | null;

  initializeGaragePayment: (
    amount: number
  ) => Promise<string | null>;
  verifyPayment: (txRef: string) => Promise<void>;
  clearPayment: () => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export const usePaymentStore =
  create<PaymentState>((set) => ({
    currentPayment: null,
    paymentStatus: null,
    loading: false,
    error: null,

    initializeGaragePayment: async (
      amount: number
    ) => {
      try {
        set({ loading: true, error: null });
        console.log(
          "Payment Store: Initializing payment for amount:",
          amount
        );

        const response =
          await paymentApi.initializeGaragePayment(
            { amount }
          );
        console.log(
          "Payment Store: Payment initialized:",
          response
        );

        if (response.success && response.data) {
          set({
            currentPayment: response.data,
            loading: false,
          });

          // Return the checkout URL for redirection
          return response.data.checkoutUrl;
        }

        return null;
      } catch (err) {
        const error = err as ApiError;
        console.error(
          "Payment Store: Error initializing payment:",
          error
        );

        set({
          error:
            error.response?.data?.message ||
            error.message ||
            "Failed to initialize payment",
          loading: false,
        });

        return null;
      }
    },

    verifyPayment: async (txRef: string) => {
      try {
        set({ loading: true, error: null });
        console.log(
          "Payment Store: Verifying payment:",
          txRef
        );

        const response =
          await paymentApi.verifyPayment(txRef);
        console.log(
          "Payment Store: Payment verification:",
          response
        );

        if (response.success && response.data) {
          set({
            paymentStatus: response.data,
            loading: false,
          });
        }
      } catch (err) {
        const error = err as ApiError;
        console.error(
          "Payment Store: Error verifying payment:",
          error
        );

        set({
          error:
            error.response?.data?.message ||
            error.message ||
            "Failed to verify payment",
          loading: false,
        });
      }
    },

    clearPayment: () => {
      set({
        currentPayment: null,
        paymentStatus: null,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  }));
