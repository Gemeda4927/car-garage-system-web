import { api } from "./api";
import type {
  InitializeGaragePaymentRequest,
  InitializeGaragePaymentResponse,
  PaymentApiResponse,
  PaymentStatus,
} from "../types/payment.types";

export const paymentApi = {
  initializeGaragePayment: (
    data: InitializeGaragePaymentRequest
  ) => {
    console.log(
      "Payment API: Sending request with data:",
      data
    );
    return api.post<
      PaymentApiResponse<InitializeGaragePaymentResponse>
    >("payments/garage/init", data);
  },

  // Verify payment status
  verifyPayment: (txRef: string) =>
    api.get<PaymentApiResponse<PaymentStatus>>(
      `payments/verify/${txRef}`
    ),
};
