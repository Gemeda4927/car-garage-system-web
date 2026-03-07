// types/payment.types.ts
export interface InitializeGaragePaymentRequest {
  amount: number;
}

export interface InitializeGaragePaymentResponse {
  paymentId: string;
  checkoutUrl: string;
  tx_ref: string;
  expiresAt: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'expired';
  amount?: number;
  paymentMethod?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface PaymentApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}