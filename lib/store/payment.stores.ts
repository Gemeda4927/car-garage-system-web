// src/store/payment.store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  GetPaymentsParams,
  Payment,
  PaymentStatistics,
  PaymentStatus,
  PaymentType,
  RefundPaymentRequest,
} from "../types/payment.type";
import { paymentApi } from "../api/payment.apis";

interface PaymentState {
  // State
  payments: Payment[];
  selectedPayment: Payment | null;
  statistics: PaymentStatistics | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  isLoading: boolean;
  isLoadingPayment: boolean;
  isLoadingStatistics: boolean;
  isRefunding: boolean;
  isVerifying: boolean;
  error: string | null;
  filters: GetPaymentsParams;

  // Actions
  fetchPayments: (params?: GetPaymentsParams) => Promise<void>;
  fetchPaymentById: (paymentId: string) => Promise<Payment | null>;
  fetchStatistics: (period?: "day" | "week" | "month" | "year") => Promise<void>;
  refundPayment: (paymentId: string, data: RefundPaymentRequest) => Promise<boolean>;
  verifyPayment: (paymentId: string) => Promise<boolean>;
  setFilters: (filters: GetPaymentsParams) => void;
  clearFilters: () => void;
  clearSelectedPayment: () => void;
  reset: () => void;
}

// Define initial state WITHOUT functions
const initialState = {
  payments: [],
  selectedPayment: null,
  statistics: null,
  pagination: null,
  isLoading: false,
  isLoadingPayment: false,
  isLoadingStatistics: false,
  isRefunding: false,
  isVerifying: false,
  error: null,
  filters: { page: 1, limit: 20 },
};

export const usePaymentStoress = create<PaymentState>()(
  devtools(
    persist(
      (set, get) => ({
        // Spread the initial state
        ...initialState,

        // Actions
        fetchPayments: async (params?: GetPaymentsParams) => {
          set({ isLoading: true, error: null });
          try {
            const merged = {
              ...get().filters,
              ...params,
            };
            const res = await paymentApi.getAllPayments(merged);
            set({
              payments: res.data.payments,
              pagination: res.data.pagination,
              filters: merged,
              isLoading: false,
            });
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : "Failed to fetch payments",
              isLoading: false,
            });
          }
        },

        fetchPaymentById: async (paymentId: string) => {
          set({ isLoadingPayment: true, error: null });
          try {
            const res = await paymentApi.getPaymentById(paymentId);
            set({
              selectedPayment: res.data.payment,
              isLoadingPayment: false,
            });
            return res.data.payment;
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : "Failed to fetch payment",
              isLoadingPayment: false,
            });
            return null;
          }
        },

        fetchStatistics: async (period: "day" | "week" | "month" | "year" = "month") => {
          set({ isLoadingStatistics: true, error: null });
          try {
            const res = await paymentApi.getPaymentStatistics({ period });
            set({
              statistics: res.data,
              isLoadingStatistics: false,
            });
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : "Failed to fetch statistics",
              isLoadingStatistics: false,
            });
          }
        },

        refundPayment: async (paymentId: string, data: RefundPaymentRequest) => {
          set({ isRefunding: true, error: null });
          try {
            const res = await paymentApi.refundPayment(paymentId, data);
            set((state) => ({
              payments: state.payments.map((p) =>
                p._id === paymentId ? res.data.payment : p
              ),
              selectedPayment:
                state.selectedPayment?._id === paymentId
                  ? res.data.payment
                  : state.selectedPayment,
              isRefunding: false,
            }));
            return true;
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : "Failed to refund payment",
              isRefunding: false,
            });
            return false;
          }
        },

        verifyPayment: async (paymentId: string) => {
          set({ isVerifying: true, error: null });
          try {
            const res = await paymentApi.verifyPayment(paymentId);
            set((state) => ({
              payments: state.payments.map((p) =>
                p._id === paymentId ? res.data.payment : p
              ),
              selectedPayment:
                state.selectedPayment?._id === paymentId
                  ? res.data.payment
                  : state.selectedPayment,
              isVerifying: false,
            }));
            return true;
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : "Failed to verify payment",
              isVerifying: false,
            });
            return false;
          }
        },

        setFilters: (filters: GetPaymentsParams) => {
          set({
            filters: {
              ...get().filters,
              ...filters,
              page: filters.page ?? 1,
            },
          });
        },

        clearFilters: () => {
          set({ filters: { page: 1, limit: 20 } });
        },

        clearSelectedPayment: () => {
          set({ selectedPayment: null });
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: "payment-storage",
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    { name: "PaymentStore" }
  )
);