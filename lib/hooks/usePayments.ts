// src/hooks/usePayment.ts
import { useEffect, useCallback, useMemo } from "react";
import { usePaymentStore } from "../store/payment.store";
import {
  GetPaymentsParams,
  Payment,
  PaymentStatus,
  PaymentType,
  RefundPaymentRequest,
} from "../types/payment.type";
import { usePaymentStoress } from "../store/payment.stores";

interface UsePaymentOptions {
  autoFetch?: boolean;
  fetchParams?: GetPaymentsParams;
}

interface UsePaymentReturn {
  payments: Payment[];
  selectedPayment: Payment | null;
  statistics: unknown;
  pagination: unknown;

  isLoading: boolean;
  isLoadingPayment: boolean;
  isLoadingStatistics: boolean;
  isRefunding: boolean;
  isVerifying: boolean;

  error: string | null;

  fetchPayments: (params?: GetPaymentsParams) => Promise<void>;
  fetchPaymentById: (id: string) => Promise<Payment | null>;
  fetchStatistics: (period?: "day" | "week" | "month" | "year") => Promise<void>;
  refundPayment: (id: string, data: RefundPaymentRequest) => Promise<boolean>;
  verifyPayment: (id: string) => Promise<boolean>;

  filters: GetPaymentsParams;
  setFilters: (filters: GetPaymentsParams) => void;
  clearFilters: () => void;
  clearSelectedPayment: () => void;

  completedPayments: Payment[];
  pendingPayments: Payment[];
  totalRevenue: number;
  getPaymentsByUser: (userId: string) => Payment[];
  getPaymentsByType: (type: PaymentType) => Payment[];
  getPaymentsByStatus: (status: PaymentStatus) => Payment[];
}

export const usePayment = (options: UsePaymentOptions = {}): UsePaymentReturn => {
  const { autoFetch = true, fetchParams } = options;

  const {
    payments,
    selectedPayment,
    statistics,
    pagination,
    isLoading,
    isLoadingPayment,
    isLoadingStatistics,
    isRefunding,
    isVerifying,
    error,
    filters,
    fetchPayments: storeFetchPayments,
    fetchPaymentById: storeFetchPaymentById,
    fetchStatistics: storeFetchStatistics,
    refundPayment: storeRefundPayment,
    verifyPayment: storeVerifyPayment,
    setFilters,
    clearFilters,
    clearSelectedPayment,
  } = usePaymentStoress()

  // Auto-fetch payments on mount
  useEffect(() => {
    if (autoFetch) {
      storeFetchPayments(fetchParams);
    }
  }, [autoFetch, fetchParams, storeFetchPayments]);

  const fetchPayments = useCallback(
    (params?: GetPaymentsParams) => storeFetchPayments(params),
    [storeFetchPayments]
  );
  
  const fetchPaymentById = useCallback(
    (id: string) => storeFetchPaymentById(id),
    [storeFetchPaymentById]
  );
  
  const fetchStatistics = useCallback(
    (period?: "day" | "week" | "month" | "year") => storeFetchStatistics(period),
    [storeFetchStatistics]
  );
  
  const refundPayment = useCallback(
    (id: string, data: RefundPaymentRequest) => storeRefundPayment(id, data),
    [storeRefundPayment]
  );
  
  const verifyPayment = useCallback(
    (id: string) => storeVerifyPayment(id),
    [storeVerifyPayment]
  );

  // Computed values
  const completedPayments = useMemo(
    () => payments.filter((p) => p.status === PaymentStatus.COMPLETED),
    [payments]
  );
  
  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === PaymentStatus.PENDING),
    [payments]
  );
  
  const totalRevenue = useMemo(
    () => completedPayments.reduce((sum, p) => sum + p.amount, 0),
    [completedPayments]
  );
  
  const getPaymentsByUser = useCallback(
    (userId: string) => payments.filter((p) => p.user._id === userId),
    [payments]
  );
  
  const getPaymentsByType = useCallback(
    (type: PaymentType) => payments.filter((p) => p.paymentType === type),
    [payments]
  );
  
  const getPaymentsByStatus = useCallback(
    (status: PaymentStatus) => payments.filter((p) => p.status === status),
    [payments]
  );

  return {
    payments,
    selectedPayment,
    statistics,
    pagination,
    isLoading,
    isLoadingPayment,
    isLoadingStatistics,
    isRefunding,
    isVerifying,
    error,
    fetchPayments,
    fetchPaymentById,
    fetchStatistics,
    refundPayment,
    verifyPayment,
    filters,
    setFilters,
    clearFilters,
    clearSelectedPayment,
    completedPayments,
    pendingPayments,
    totalRevenue,
    getPaymentsByUser,
    getPaymentsByType,
    getPaymentsByStatus,
  };
};

// --- Specialized hooks ---
export const usePaymentById = (paymentId: string) => {
  const { selectedPayment, isLoadingPayment, error, fetchPaymentById, clearSelectedPayment } = usePayment({ autoFetch: false });

  useEffect(() => {
    if (paymentId) {
      fetchPaymentById(paymentId);
    }
    return () => {
      clearSelectedPayment();
    };
  }, [paymentId, fetchPaymentById, clearSelectedPayment]);

  return { payment: selectedPayment, isLoading: isLoadingPayment, error };
};

export const usePaymentStats = (period: "day" | "week" | "month" | "year" = "month") => {
  const { statistics, isLoadingStatistics, error, fetchStatistics } = usePayment({ autoFetch: false });

  useEffect(() => {
    fetchStatistics(period);
  }, [period, fetchStatistics]);

  return { statistics, isLoading: isLoadingStatistics, error };
};