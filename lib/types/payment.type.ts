// src/types/payment.types.ts

// ==================== ENUMS ====================
export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentType {
  GARAGE_CREATION = "garage_creation",
  BOOKING = "BOOKING",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export enum PaymentMethod {
  CARD = "card",
}

export enum GarageCreationStatus {
  PENDING = "pending",
  USED = "used",
  FAILED = "failed",
}

// ==================== CORE INTERFACES ====================

export interface PaymentUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface GarageAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface GarageInfo {
  _id: string;
  name: string;
  address: GarageAddress;
  id: string;
}

export interface GarageCreation {
  status: GarageCreationStatus;
  garage?: GarageInfo;
}

export interface ChapaResponseData {
  checkout_url: string;
}

export interface ChapaResponse {
  message: string;
  status: string;
  data: ChapaResponseData;
}

export interface PaymentProvider {
  name: string;
  reference: string;
  checkoutUrl: string;
  response: ChapaResponse;
}

export interface Payment {
  _id: string;
  user: PaymentUser;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  provider: PaymentProvider;
  garageCreation: GarageCreation;
  paidAt: string | null;
  notes: string;
  receipts?: unknown[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== REQUEST TYPES ====================

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  type?: PaymentType;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface GetStatisticsParams {
  period?: "day" | "week" | "month" | "year" | "custom";
  startDate?: string;
  endDate?: string;
}

export interface RefundPaymentRequest {
  reason: string;
  amount?: number;
  notifyCustomer?: boolean;
}

// ==================== RESPONSE TYPES ====================

export interface PaymentsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaymentsStats {
  totalAmount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
}

export interface GetAllPaymentsResponse {
  success: boolean;
  data: {
    payments: Payment[];
    stats: PaymentsStats;
    pagination: PaymentsPagination;
  };
}

export interface GetPaymentResponse {
  success: boolean;
  data: { payment: Payment };
}

export interface RefundPaymentResponse {
  success: boolean;
  data: { payment: Payment };
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: { payment: Payment };
}

export interface PaymentStatistics {
  period: "day" | "week" | "month" | "year" | "custom";
  stats: {
    totalRevenue: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
  };
}

export interface GetPaymentStatisticsResponse {
  success: boolean;
  data: PaymentStatistics;
}