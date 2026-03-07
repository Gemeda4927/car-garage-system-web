// components/PaymentModal.tsx
import { usePayment } from "@/lib/hooks/usePayment";
import React, {
  useState,
  useEffect,
} from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  garageData: any;
  amount: number;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<
  PaymentModalProps
> = ({
  isOpen,
  onClose,
  garageData,
  amount,
  onSuccess,
}) => {
  const {
    payForGarageListing,
    loading,
    error,
    clearError,
  } = usePayment();

  const [termsAccepted, setTermsAccepted] =
    useState(false);
  const [paymentInitiated, setPaymentInitiated] =
    useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTermsAccepted(false);
      setPaymentInitiated(false);
      clearError();
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!termsAccepted) {
      alert(
        "Please accept the terms and conditions"
      );
      return;
    }

    setPaymentInitiated(true);
    await payForGarageListing(amount, garageData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          Complete Payment
        </h2>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Garage Listing Fee:
          </p>
          <p className="text-3xl font-bold">
            ETB {amount}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            One-time payment for garage listing
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-2">
            What you get:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Lifetime garage listing
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Receive booking requests from car
              owners
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Manage services and pricing
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Get customer reviews and ratings
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) =>
                setTermsAccepted(e.target.checked)
              }
              className="mt-1 mr-2"
              disabled={paymentInitiated}
            />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <a
                href="/terms"
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                terms and conditions
              </a>{" "}
              and understand that this payment is
              non-refundable once the garage is
              listed.
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePayment}
            disabled={
              loading ||
              !termsAccepted ||
              paymentInitiated
            }
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing..."
              : `Pay ${amount} ETB`}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          🔒 Secure payment powered by Chapa
        </p>
        <p className="text-xs text-gray-500 text-center">
          You will be redirected to Chapa's secure
          payment page.
        </p>
      </div>
    </div>
  );
};
