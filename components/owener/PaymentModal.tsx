// components/dashboard/PaymentModal.tsx
import { Fragment } from "react";
import {
  Dialog,
  Transition,
} from "@headlessui/react";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentStep:
    | "processing"
    | "success"
    | "failed"
    | "completed";
  paymentAmount: number;
  onRetry: () => void;
  onContinue: () => void;
  error?: string;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  paymentStep,
  paymentAmount,
  onRetry,
  onContinue,
  error,
}: PaymentModalProps) => {
  return (
    <Transition
      appear
      show={isOpen}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-white relative flex items-center"
                  >
                    <CreditCard className="h-6 w-6 mr-2" />
                    {paymentStep ===
                      "processing" &&
                      "Processing Payment"}
                    {paymentStep === "success" &&
                      "Payment Initiated"}
                    {paymentStep === "failed" &&
                      "Payment Failed"}
                    {paymentStep ===
                      "completed" &&
                      "Payment Successful!"}
                  </Dialog.Title>
                </div>

                <div className="p-6">
                  {paymentStep ===
                    "processing" && (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        Initializing Payment
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Please wait while we
                        prepare your payment...
                      </p>
                    </div>
                  )}

                  {paymentStep === "success" && (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        Payment Window Opened
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Please complete the
                        payment in the new tab. If
                        you don&apos;t see it,
                        check for pop-up blockers.
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        After completing payment,
                        return here and click
                        &quot;I&apos;ve Completed
                        Payment&quot;.
                      </p>
                      <button
                        onClick={onContinue}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
                      >
                        I&apos;ve Completed
                        Payment
                      </button>
                    </div>
                  )}

                  {paymentStep === "failed" && (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-10 w-10 text-red-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        Payment Failed
                      </h4>
                      <p className="text-gray-600 mb-2">
                        {error ||
                          "Unable to process payment. Please try again."}
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        If the problem persists,
                        contact support.
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={onRetry}
                          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl hover:from-yellow-600 hover:to-amber-700 transition-all font-medium"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={onClose}
                          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentStep ===
                    "completed" && (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        Payment Successful!
                      </h4>
                      <p className="text-gray-600 mb-6">
                        Your payment has been
                        processed successfully.
                        You can now create your
                        garage.
                      </p>
                      <button
                        onClick={onContinue}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
                      >
                        Create Garage Now
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
