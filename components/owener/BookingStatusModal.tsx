// components/dashboard/BookingStatusModal.tsx
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { 
  Activity, AlertCircle, Loader2, Save, ThumbsUp, ThumbsDown, 
  Play, CheckCircle2, XCircle, CheckCircle 
} from "lucide-react";
import { BookingStatus } from "@/lib/types/booking.types";
import { getStatusColor, getStatusIcon } from "@/lib/utils/booking.utils";

interface BookingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // Replace with proper type
  bookingId: string;
  onSuccess?: () => void;
  useBookingStatus: (config: any) => {
    updateStatus: (status: BookingStatus, reason?: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    reset: () => void;
  };
}

export const BookingStatusModal = ({
  isOpen,
  onClose,
  booking,
  bookingId,
  onSuccess,
  useBookingStatus,
}: BookingStatusModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  const {
    updateStatus,
    isLoading,
    error,
    reset
  } = useBookingStatus({
    bookingId,
    onSuccess: (updatedBooking) => {
      console.log('✅ Status updated successfully:', updatedBooking);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error('❌ Status update failed:', error);
      alert(`Failed to update status: ${error}`);
    }
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedStatus(null);
      setReason("");
      setShowReasonInput(false);
      reset();
    }
  }, [isOpen, reset]);

  if (!booking) return null;

  const currentStatusColor = getStatusColor(booking.status as BookingStatus);
  const StatusIcon = getStatusIcon(booking.status as BookingStatus);

  const statusOptions = [
    { 
      status: BookingStatus.APPROVED, 
      label: "Approve", 
      icon: ThumbsUp, 
      color: "green", 
      description: "Confirm this booking",
      show: booking.status === BookingStatus.PENDING
    },
    { 
      status: BookingStatus.REJECTED, 
      label: "Reject", 
      icon: ThumbsDown, 
      color: "red", 
      description: "Reject this booking",
      show: booking.status === BookingStatus.PENDING,
      requiresReason: true
    },
    { 
      status: BookingStatus.IN_PROGRESS, 
      label: "Start Service", 
      icon: Play, 
      color: "blue", 
      description: "Mark service as started",
      show: booking.status === BookingStatus.APPROVED
    },
    { 
      status: BookingStatus.COMPLETED, 
      label: "Complete", 
      icon: CheckCircle2, 
      color: "emerald", 
      description: "Mark service as completed",
      show: booking.status === BookingStatus.IN_PROGRESS
    },
    { 
      status: BookingStatus.CANCELLED, 
      label: "Cancel", 
      icon: XCircle, 
      color: "gray", 
      description: "Cancel this booking",
      show: [BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.IN_PROGRESS].includes(booking.status as BookingStatus),
      requiresReason: true
    },
  ].filter(option => option.show);

  const handleStatusSelect = (status: BookingStatus, requiresReason?: boolean) => {
    setSelectedStatus(status);
    setShowReasonInput(!!requiresReason);
    if (!requiresReason) {
      setReason("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    
    if (showReasonInput && !reason.trim()) {
      alert("Please provide a reason");
      return;
    }

    await updateStatus(selectedStatus, reason || undefined);
  };

  const handleCancelSelection = () => {
    setSelectedStatus(null);
    setShowReasonInput(false);
    setReason("");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                  <Dialog.Title className="text-2xl font-bold text-white relative flex items-center">
                    <Activity className="h-6 w-6 mr-2" />
                    Update Booking Status
                  </Dialog.Title>
                  {isLoading && (
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Update Failed</p>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Current Status</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full ${currentStatusColor.bg}`}>
                      <StatusIcon className={`h-4 w-4 mr-2 ${currentStatusColor.text}`} />
                      <span className={`text-sm font-medium ${currentStatusColor.text}`}>
                        {currentStatusColor.label}
                      </span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">{booking.serviceName}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium">{booking.carOwner.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(booking.bookingDate).toLocaleDateString()} at {booking.timeSlot.start}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="font-medium">{booking.servicePrice} ETB</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Vehicle</p>
                        <p className="font-medium">
                          {booking.vehicleInfo?.make} {booking.vehicleInfo?.model}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!selectedStatus && !showReasonInput && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Select New Status</p>
                      <div className="grid grid-cols-2 gap-3">
                        {statusOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.status}
                              onClick={() => handleStatusSelect(option.status, option.requiresReason)}
                              disabled={isLoading}
                              className={`p-4 rounded-xl border-2 border-${option.color}-200 bg-${option.color}-50 hover:bg-${option.color}-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Icon className={`h-5 w-5 mb-2 text-${option.color}-600 mx-auto`} />
                              <p className={`font-medium text-${option.color}-700`}>{option.label}</p>
                              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {showReasonInput && selectedStatus && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason {selectedStatus === BookingStatus.REJECTED ? "for rejection" : "for cancellation"} *
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please provide a reason..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                  )}

                  {selectedStatus && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleCancelSelection}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading || (showReasonInput && !reason.trim())}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update to {selectedStatus}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!selectedStatus && (
                  <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 flex justify-end rounded-b-3xl border-t border-gray-200">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};