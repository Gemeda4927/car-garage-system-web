import { 
  GetAllPaymentsResponse, 
  GetPaymentResponse, 
  GetPaymentsParams, 
  VerifyPaymentResponse, 
  RefundPaymentRequest, 
  RefundPaymentResponse,
  GetPaymentStatisticsResponse,
  GetStatisticsParams
} from "../types/payment.type";
import apiClient from "./api";

class PaymentApi {
  private readonly baseUrl = 'payments';

  /** Verify a payment */
  async verifyPayment(paymentId: string): Promise<VerifyPaymentResponse> {
    const response = await apiClient.post<VerifyPaymentResponse>(
      `${this.baseUrl}/garage/verify/${paymentId}`
    );
    return response.data;
  }

  /** Get all payments with optional filters */
  async getAllPayments(params?: GetPaymentsParams): Promise<GetAllPaymentsResponse> {
    const response = await apiClient.get<GetAllPaymentsResponse>(this.baseUrl, { params });
    return response.data;
  }

  /** Get a payment by ID */
  async getPaymentById(paymentId: string): Promise<GetPaymentResponse> {
    const response = await apiClient.get<GetPaymentResponse>(`${this.baseUrl}/${paymentId}`);
    return response.data;
  }

  /** Refund a payment */
  async refundPayment(
    paymentId: string,
    refundData: RefundPaymentRequest
  ): Promise<RefundPaymentResponse> {
    const response = await apiClient.post<RefundPaymentResponse>(
      `${this.baseUrl}/${paymentId}/refund`,
      refundData
    );
    return response.data;
  }

  /** Get payment statistics */
  async getPaymentStatistics(params?: GetStatisticsParams): Promise<GetPaymentStatisticsResponse> {
    const response = await apiClient.get<GetPaymentStatisticsResponse>(
      `${this.baseUrl}/stats`,
      { params }
    );
    return response.data;
  }
}

// Export singleton instance
export const paymentApi = new PaymentApi();