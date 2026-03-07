
"use client";

import {
  JSX,
  useEffect,
  useState,
  useCallback,
  Fragment,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGarage } from "@/lib/hooks/useGarage";
import { usePayment } from "@/lib/hooks/usePayment";
import { useService } from "@/lib/hooks/useService";
import { useBookingStatus } from "@/lib/hooks/useBooking";
import {
  Dialog,
  Transition,
  Menu,
} from "@headlessui/react";
import {
  Home,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  CreditCard,
  Calendar,
  Settings,
  User,
  LogOut,
  Bell,
  Star,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Building2,
  PhoneCall,
  Sun,
  Moon,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Sparkles,
  Car,
  TrendingUp,
  Users,
  CheckSquare,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  BarChart,
  Filter,
  RefreshCw,
  Download,
  Printer,
  MoreVertical,
  Copy,
  Archive,
  Power,
  DollarSign,
  Clock as ClockIcon,
  Tag,
  Layers,
  PieChart,
  Activity,
  CalendarDays,
  ChevronDown,
  Search,
  ThumbsUp,
  ThumbsDown,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import type {
  PopulatedGarage,
  CreateGaragePayload,
  UpdateGaragePayload,
  GarageService,
  ServiceBooking,
} from "@/lib/types/garage.types";
import type {
  Service,
  PopulatedService,
  CreateServicePayload,
  UpdateServicePayload,
  ServiceFilters,
  ServiceAnalytics,
} from "@/lib/types/service.types";
import {
  setTokenGetter,
  getAccessToken,
} from "@/lib/api/api";
import { DateTime } from "luxon";
import { BookingStatus, Booking } from "@/lib/types/booking.types";

interface GarageFormState {
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  mondayOpen: string;
  mondayClose: string;
  mondayClosed: boolean;
  tuesdayOpen: string;
  tuesdayClose: string;
  tuesdayClosed: boolean;
  wednesdayOpen: string;
  wednesdayClose: string;
  wednesdayClosed: boolean;
  thursdayOpen: string;
  thursdayClose: string;
  thursdayClosed: boolean;
  fridayOpen: string;
  fridayClose: string;
  fridayClosed: boolean;
  saturdayOpen: string;
  saturdayClose: string;
  saturdayClosed: boolean;
  sundayOpen: string;
  sundayClose: string;
  sundayClosed: boolean;
}

interface ServiceFormState {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  price?: string;
  duration?: string;
  category?: string;
}

const PAYMENT_AMOUNT = 100;

type DashboardTab =
  | "dashboard"
  | "garage"
  | "bookings"
  | "services"
  | "settings"
  | "profile";
type ModalType =
  | "create"
  | "edit"
  | "create-service"
  | "edit-service"
  | "service-details"
  | "service-analytics"
  | "booking-details"
  | "booking-status-update"
  | null;

const DEFAULT_FORM_STATE: GarageFormState = {
  name: "",
  description: "",
  phone: "",
  email: "",
  website: "",
  street: "",
  city: "",
  state: "",
  country: "Ethiopia",
  zipCode: "",
  mondayOpen: "09:00",
  mondayClose: "18:00",
  mondayClosed: false,
  tuesdayOpen: "09:00",
  tuesdayClose: "18:00",
  tuesdayClosed: false,
  wednesdayOpen: "09:00",
  wednesdayClose: "18:00",
  wednesdayClosed: false,
  thursdayOpen: "09:00",
  thursdayClose: "18:00",
  thursdayClosed: false,
  fridayOpen: "09:00",
  fridayClose: "18:00",
  fridayClosed: false,
  saturdayOpen: "09:00",
  saturdayClose: "15:00",
  saturdayClosed: false,
  sundayOpen: "09:00",
  sundayClose: "15:00",
  sundayClosed: true,
};

const DEFAULT_SERVICE_FORM: ServiceFormState = {
  name: "",
  description: "",
  price: 0,
  duration: 30,
  category: "maintenance",
};

const CATEGORIES = [
  {
    value: "maintenance",
    label: "Maintenance",
    color: "blue",
  },
  {
    value: "repair",
    label: "Repair",
    color: "red",
  },
  {
    value: "diagnostic",
    label: "Diagnostic",
    color: "purple",
  },
  {
    value: "detailing",
    label: "Detailing",
    color: "green",
  },
  {
    value: "tire",
    label: "Tire Service",
    color: "orange",
  },
  {
    value: "electrical",
    label: "Electrical",
    color: "yellow",
  },
  {
    value: "ac",
    label: "AC Service",
    color: "cyan",
  },
  {
    value: "body",
    label: "Body Work",
    color: "pink",
  },
];

const getStatusColor = (status: BookingStatus): { bg: string; text: string; label: string } => {
  const colors = {
    [BookingStatus.PENDING]: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
    [BookingStatus.APPROVED]: { bg: "bg-green-100", text: "text-green-700", label: "Approved" },
    [BookingStatus.IN_PROGRESS]: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
    [BookingStatus.COMPLETED]: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
    [BookingStatus.CANCELLED]: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
    [BookingStatus.REJECTED]: { bg: "bg-gray-100", text: "text-gray-700", label: "Rejected" },
  };
  return colors[status] || colors[BookingStatus.PENDING];
};

const getStatusIcon = (status: BookingStatus) => {
  const icons = {
    [BookingStatus.PENDING]: Clock,
    [BookingStatus.APPROVED]: CheckCircle,
    [BookingStatus.IN_PROGRESS]: Play,
    [BookingStatus.COMPLETED]: CheckCircle2,
    [BookingStatus.CANCELLED]: XCircle,
    [BookingStatus.REJECTED]: AlertTriangle,
  };
  return icons[status] || Info;
};

const ContentLoadingSpinner = ({
  message,
}: {
  message: string;
}) => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
        </div>
        <p className="text-gray-800 text-lg font-medium mt-4">
          {message}
        </p>
      </div>
    </div>
  </div>
);

const GlobalLoadingSpinner = ({
  message,
}: {
  message: string;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
        </div>
        <p className="text-gray-800 text-lg font-medium mt-4">
          {message}
        </p>
      </div>
    </div>
  </div>
);

const SuccessModal = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20 transform animate-scale-in">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Success!
        </h3>
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);

const PaymentModal = ({
  isOpen,
  onClose,
  paymentStep,
  paymentAmount,
  onRetry,
  onContinue,
  error,
}: {
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
}) => {
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
                        you don't see it, check
                        for pop-up blockers.
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        After completing payment,
                        return here and click
                        "I've Completed Payment".
                      </p>
                      <button
                        onClick={onContinue}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
                      >
                        I've Completed Payment
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


// Booking Status Update Modal

// Booking Status Update Modal
const BookingStatusModal = ({
  isOpen,
  onClose,
  booking,
  bookingId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking: (ServiceBooking & { serviceName?: string; servicePrice?: number }) | null;
  bookingId: string;
  onSuccess?: () => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  // Use the actual hook
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

  // Reset state when modal opens/closes
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
  ].filter(option => option.show); // Only show available options

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
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Update Failed</p>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Current Status */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Current Status</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full ${currentStatusColor.bg}`}>
                      <StatusIcon className={`h-4 w-4 mr-2 ${currentStatusColor.text}`} />
                      <span className={`text-sm font-medium ${currentStatusColor.text}`}>
                        {currentStatusColor.label}
                      </span>
                    </div>
                  </div>

                  {/* Booking Info */}
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

                  {/* Status Selection - Only show if no status selected yet */}
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

                  {/* Reason Input - Show when status requires reason */}
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

                  {/* Confirmation Buttons - Show when status is selected */}
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

                {/* Footer with close button - Only show when no status selected */}
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

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </Transition>
  );
};

// Booking Details Modal
const BookingDetailsModal = ({
  isOpen,
  onClose,
  booking,
  onStatusUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking: (ServiceBooking & { serviceName?: string; servicePrice?: number }) | null;
  onStatusUpdate: (booking: any) => void;
}) => {
  if (!booking) return null;

  const statusColor = getStatusColor(booking.status as BookingStatus);
  const StatusIcon = getStatusIcon(booking.status as BookingStatus);

  const canUpdateStatus = ![
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
    BookingStatus.REJECTED
  ].includes(booking.status as BookingStatus);

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                  <Dialog.Title className="text-2xl font-bold text-white relative flex items-center">
                    <Calendar className="h-6 w-6 mr-2" />
                    Booking Details
                  </Dialog.Title>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${statusColor.bg}`}>
                      <StatusIcon className={`h-5 w-5 mr-2 ${statusColor.text}`} />
                      <span className={`font-medium ${statusColor.text}`}>
                        {statusColor.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ID: {booking._id.slice(-8)}
                    </span>
                  </div>

                  {/* Service Info */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-100">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Wrench className="h-5 w-5 text-purple-600 mr-2" />
                      Service Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-medium text-gray-900">{booking.serviceName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium text-gray-900">{booking.servicePrice} ETB</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">
                          {booking.timeSlot.start} - {booking.timeSlot.end}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{booking.carOwner.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{booking.carOwner.phone || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  {booking.vehicleInfo && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-100">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Car className="h-5 w-5 text-green-600 mr-2" />
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Make</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.make}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Model</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">License Plate</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.licensePlate}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {booking.notes && (
                    <div className="bg-gray-50 p-5 rounded-2xl">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Edit3 className="h-5 w-5 text-gray-600 mr-2" />
                        Notes
                      </h3>
                      <p className="text-gray-700">{booking.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {canUpdateStatus && (
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={() => {
                          onClose();
                          onStatusUpdate(booking);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center"
                      >
                        <Activity className="h-5 w-5 mr-2" />
                        Update Status
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 flex justify-end rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Edit Garage Modal
const EditGarageModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: GarageFormState;
  setFormData: (data: GarageFormState) => void;
  formErrors: FormErrors;
  onSubmit: () => void;
  isLoading: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "contact" | "hours"
  >("basic");
  const [changedFields, setChangedFields] =
    useState<Set<string>>(new Set());
  const [initialData, setInitialData] =
    useState<GarageFormState>(formData);

  // Reset when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setInitialData(formData);
      setChangedFields(new Set());
    }
  }, [isOpen, formData]);

  const handleFieldChange = (
    field: string,
    value: any
  ) => {
    setFormData({ ...formData, [field]: value });

    const initialValue =
      initialData[field as keyof GarageFormState];
    const currentValue = value;

    let isChanged = false;

    if (
      typeof initialValue === "boolean" &&
      typeof currentValue === "boolean"
    ) {
      isChanged = initialValue !== currentValue;
    } else if (
      typeof initialValue === "string" &&
      typeof currentValue === "string"
    ) {
      isChanged =
        initialValue.trim() !==
        currentValue.trim();
    } else {
      isChanged =
        JSON.stringify(initialValue) !==
        JSON.stringify(currentValue);
    }

    if (isChanged) {
      setChangedFields((prev) =>
        new Set(prev).add(field)
      );
    } else {
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const tabs = [
    {
      id: "basic",
      label: "Basic Info",
      icon: Building2,
      color: "blue",
      description:
        "Update your garage name, description and location",
    },
    {
      id: "contact",
      label: "Contact",
      icon: PhoneCall,
      color: "purple",
      description: "Update your contact details",
    },
    {
      id: "hours",
      label: "Hours",
      icon: Clock,
      color: "green",
      description: "Update your business hours",
    },
  ] as const;

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Building2 className="h-4 w-4 text-blue-600 mr-2" />
          Garage Name{" "}
          <span className="text-red-500 ml-1">
            *
          </span>
          {changedFields.has("name") && (
            <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />{" "}
              Modified
            </span>
          )}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            handleFieldChange(
              "name",
              e.target.value
            )
          }
          placeholder="e.g., Premium Auto Care"
          className={`w-full px-5 py-4 border-2 ${formErrors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400`}
        />
        {formErrors.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.name}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Edit3 className="h-4 w-4 text-green-600 mr-2" />
          Description
          {changedFields.has("description") && (
            <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />{" "}
              Modified
            </span>
          )}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            handleFieldChange(
              "description",
              e.target.value
            )
          }
          placeholder="Describe your garage, services, and specialties..."
          rows={4}
          className="w-full px-5 py-4 border-2 border-gray-200 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="h-5 w-5 text-purple-600 mr-2" />
          Address Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                handleFieldChange(
                  "city",
                  e.target.value
                )
              }
              placeholder="Addis Ababa"
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {changedFields.has("city") && (
              <span className="mt-1 text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />{" "}
                Modified
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) =>
                handleFieldChange(
                  "state",
                  e.target.value
                )
              }
              placeholder="Addis Ababa"
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {changedFields.has("state") && (
              <span className="mt-1 text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />{" "}
                Modified
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Street Address
          </label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) =>
              handleFieldChange(
                "street",
                e.target.value
              )
            }
            placeholder="Bole Road, Near Mexico Square"
            className="w-full px-5 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {changedFields.has("street") && (
            <span className="mt-1 text-xs text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />{" "}
              Modified
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                handleFieldChange(
                  "country",
                  e.target.value
                )
              }
              placeholder="Ethiopia"
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {changedFields.has("country") && (
              <span className="mt-1 text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />{" "}
                Modified
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Zip Code
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) =>
                handleFieldChange(
                  "zipCode",
                  e.target.value
                )
              }
              placeholder="1000"
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {changedFields.has("zipCode") && (
              <span className="mt-1 text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />{" "}
                Modified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Phone className="h-4 w-4 text-purple-600 mr-2" />
          Phone{" "}
          <span className="text-red-500 ml-1">
            *
          </span>
          {changedFields.has("phone") && (
            <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />{" "}
              Modified
            </span>
          )}
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              handleFieldChange(
                "phone",
                e.target.value
              )
            }
            placeholder="+251 911 234 567"
            className={`w-full pl-12 pr-5 py-4 border-2 ${formErrors.phone ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"} rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700`}
          />
        </div>
        {formErrors.phone && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.phone}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-5 rounded-2xl border-2 border-pink-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Mail className="h-4 w-4 text-pink-600 mr-2" />
          Email{" "}
          <span className="text-red-500 ml-1">
            *
          </span>
          {changedFields.has("email") && (
            <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />{" "}
              Modified
            </span>
          )}
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              handleFieldChange(
                "email",
                e.target.value
              )
            }
            placeholder="garage@example.com"
            className={`w-full pl-12 pr-5 py-4 border-2 ${formErrors.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"} rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-700`}
          />
        </div>
        {formErrors.email && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.email}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-2xl border-2 border-indigo-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Globe className="h-4 w-4 text-indigo-600 mr-2" />
          Website
          {changedFields.has("website") && (
            <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />{" "}
              Modified
            </span>
          )}
        </label>
        <div className="relative">
          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="url"
            value={formData.website}
            onChange={(e) =>
              handleFieldChange(
                "website",
                e.target.value
              )
            }
            placeholder="https://example.com"
            className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700"
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessHours = () => {
    const days = [
      {
        key: "monday",
        label: "Monday",
        icon: Sun,
        color: "yellow",
      },
      {
        key: "tuesday",
        label: "Tuesday",
        icon: Clock3,
        color: "orange",
      },
      {
        key: "wednesday",
        label: "Wednesday",
        icon: Clock4,
        color: "amber",
      },
      {
        key: "thursday",
        label: "Thursday",
        icon: Clock5,
        color: "blue",
      },
      {
        key: "friday",
        label: "Friday",
        icon: Clock6,
        color: "indigo",
      },
      {
        key: "saturday",
        label: "Saturday",
        icon: Clock7,
        color: "purple",
      },
      {
        key: "sunday",
        label: "Sunday",
        icon: Moon,
        color: "gray",
      },
    ] as const;

    return (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {days.map(
          ({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className={`bg-gradient-to-r from-${color}-50 to-white p-5 rounded-2xl border-2 border-${color}-200 hover:border-${color}-300 transition-all shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 bg-${color}-100 rounded-xl`}
                  >
                    <Icon
                      className={`h-5 w-5 text-${color}-600`}
                    />
                  </div>
                  <span className="font-semibold text-gray-800">
                    {label}
                  </span>
                  {(changedFields.has(
                    `${key}Open`
                  ) ||
                    changedFields.has(
                      `${key}Close`
                    ) ||
                    changedFields.has(
                      `${key}Closed`
                    )) && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />{" "}
                      Modified
                    </span>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      formData[`${key}Closed`]
                    }
                    onChange={(e) => {
                      const newValue =
                        e.target.checked;
                      handleFieldChange(
                        `${key}Closed`,
                        newValue
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {formData[`${key}Closed`]
                      ? "Closed"
                      : "Open"}
                  </span>
                </label>
              </div>

              {!formData[`${key}Closed`] && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Open
                    </label>
                    <input
                      type="time"
                      value={
                        formData[`${key}Open`]
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          `${key}Open`,
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Close
                    </label>
                    <input
                      type="time"
                      value={
                        formData[`${key}Close`]
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          `${key}Close`,
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    );
  };

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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-white relative flex items-center"
                  >
                    <Edit3 className="h-6 w-6 mr-2" />
                    Edit Garage
                  </Dialog.Title>
                  <p className="text-blue-100 text-sm mt-1 relative flex items-center">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Update your garage information
                  </p>
                </div>

                <div className="border-b border-gray-200 px-8 pt-4">
                  <nav className="flex space-x-6">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() =>
                            setActiveTab(tab.id)
                          }
                          className={`relative pb-3 px-1 font-medium text-sm transition-all group ${
                            activeTab === tab.id
                              ? `text-${tab.color}-600`
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            <Icon
                              className={`h-5 w-5 ${
                                activeTab ===
                                tab.id
                                  ? `text-${tab.color}-600`
                                  : "text-gray-400"
                              }`}
                            />
                            <span>
                              {tab.label}
                            </span>
                          </span>
                          {activeTab ===
                            tab.id && (
                            <span
                              className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-600 rounded-full`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                  <p className="text-xs text-gray-500 mt-2 mb-2">
                    {
                      tabs.find(
                        (t) => t.id === activeTab
                      )?.description
                    }
                  </p>
                </div>

                <div className="px-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {activeTab === "basic" &&
                    renderBasicInfo()}
                  {activeTab === "contact" &&
                    renderContactInfo()}
                  {activeTab === "hours" &&
                    renderBusinessHours()}
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end space-x-4 rounded-b-3xl border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium flex items-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={
                      isLoading ||
                      changedFields.size === 0
                    }
                    className={`px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium flex items-center ${
                      changedFields.size === 0
                        ? "cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        <span>
                          Save{" "}
                          {changedFields.size > 0
                            ? `(${changedFields.size} changes)`
                            : ""}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const CreateGarageModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: GarageFormState;
  setFormData: (data: GarageFormState) => void;
  formErrors: FormErrors;
  onSubmit: () => void;
  isLoading: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "contact" | "hours"
  >("basic");

  const tabs = [
    {
      id: "basic",
      label: "Basic Info",
      icon: Building2,
      color: "blue",
    },
    {
      id: "contact",
      label: "Contact",
      icon: Phone,
      color: "purple",
    },
    {
      id: "hours",
      label: "Hours",
      icon: Clock,
      color: "green",
    },
  ] as const;

  const renderBasicInfo = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Building2 className="h-4 w-4 text-blue-600 mr-2" />
          Garage Name{" "}
          <span className="text-red-500 ml-1">
            *
          </span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          placeholder="e.g., Premium Auto Care"
          className={`w-full px-5 py-4 border-2 ${formErrors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {formErrors.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Edit3 className="h-4 w-4 text-green-600 mr-2" />
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
          placeholder="Describe your garage..."
          rows={4}
          className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                city: e.target.value,
              })
            }
            placeholder="Addis Ababa"
            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) =>
              setFormData({
                ...formData,
                state: e.target.value,
              })
            }
            placeholder="Addis Ababa"
            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Street Address
        </label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) =>
            setFormData({
              ...formData,
              street: e.target.value,
            })
          }
          placeholder="Bole Road, Near Mexico Square"
          className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) =>
              setFormData({
                ...formData,
                country: e.target.value,
              })
            }
            placeholder="Ethiopia"
            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Zip Code
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({
                ...formData,
                zipCode: e.target.value,
              })
            }
            placeholder="1000"
            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl"
          />
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            placeholder="+251 911 234 567"
            className={`w-full pl-12 pr-5 py-4 border-2 ${formErrors.phone ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
        </div>
        {formErrors.phone && (
          <p className="mt-2 text-sm text-red-600">
            {formErrors.phone}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            placeholder="garage@example.com"
            className={`w-full pl-12 pr-5 py-4 border-2 ${formErrors.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500`}
          />
        </div>
        {formErrors.email && (
          <p className="mt-2 text-sm text-red-600">
            {formErrors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Website
        </label>
        <div className="relative">
          <Globe className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
          <input
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData({
                ...formData,
                website: e.target.value,
              })
            }
            placeholder="https://example.com"
            className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessHours = () => {
    const days = [
      {
        key: "monday",
        label: "Monday",
        icon: Sun,
      },
      {
        key: "tuesday",
        label: "Tuesday",
        icon: Clock3,
      },
      {
        key: "wednesday",
        label: "Wednesday",
        icon: Clock4,
      },
      {
        key: "thursday",
        label: "Thursday",
        icon: Clock5,
      },
      {
        key: "friday",
        label: "Friday",
        icon: Clock6,
      },
      {
        key: "saturday",
        label: "Saturday",
        icon: Clock7,
      },
      {
        key: "sunday",
        label: "Sunday",
        icon: Moon,
      },
    ] as const;

    return (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {days.map(
          ({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-800">
                    {label}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      formData[`${key}Closed`]
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`${key}Closed`]:
                          e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {formData[`${key}Closed`]
                      ? "Closed"
                      : "Open"}
                  </span>
                </label>
              </div>

              {!formData[`${key}Closed`] && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Open
                    </label>
                    <input
                      type="time"
                      value={
                        formData[`${key}Open`]
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`${key}Open`]:
                            e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Close
                    </label>
                    <input
                      type="time"
                      value={
                        formData[`${key}Close`]
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`${key}Close`]:
                            e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    );
  };

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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-white relative flex items-center"
                  >
                    <Car className="h-6 w-6 mr-2" />
                    Create New Garage
                  </Dialog.Title>
                  <p className="text-emerald-100 text-sm mt-1 relative">
                    Fill in the details to list
                    your garage
                  </p>
                </div>

                <div className="border-b border-gray-200 px-8 pt-4">
                  <nav className="flex space-x-6">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() =>
                            setActiveTab(tab.id)
                          }
                          className={`relative pb-3 px-1 font-medium text-sm transition-all ${
                            activeTab === tab.id
                              ? `text-${tab.color}-600`
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            <Icon
                              className={`h-5 w-5 ${
                                activeTab ===
                                tab.id
                                  ? `text-${tab.color}-600`
                                  : "text-gray-400"
                              }`}
                            />
                            <span>
                              {tab.label}
                            </span>
                          </span>
                          {activeTab ===
                            tab.id && (
                            <span
                              className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-600 rounded-full`}
                            ></span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="px-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {activeTab === "basic" &&
                    renderBasicInfo()}
                  {activeTab === "contact" &&
                    renderContactInfo()}
                  {activeTab === "hours" &&
                    renderBusinessHours()}
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end space-x-4 rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        <span>Create Garage</span>
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const CreateServiceModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isLoading,
  garageId,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: ServiceFormState;
  setFormData: (data: ServiceFormState) => void;
  formErrors: FormErrors;
  onSubmit: () => void;
  isLoading: boolean;
  garageId: string;
}) => {
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-white relative flex items-center"
                  >
                    <Wrench className="h-6 w-6 mr-2" />
                    Add New Service
                  </Dialog.Title>
                  <p className="text-purple-100 text-sm mt-1 relative">
                    Create a new service for your
                    garage
                  </p>
                </div>

                <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Tag className="h-4 w-4 text-purple-600 mr-2" />
                      Service Name{" "}
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g., Premium Oil Change"
                      className={`w-full px-5 py-4 border-2 ${
                        formErrors.name
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                    />
                    {formErrors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Edit3 className="h-4 w-4 text-green-600 mr-2" />
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description:
                            e.target.value,
                        })
                      }
                      placeholder="Describe what this service includes..."
                      rows={3}
                      className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Price & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                        Price (ETB){" "}
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>
                      <input
                        type="number"
                        value={
                          formData.price || ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(
                              e.target.value
                            ),
                          })
                        }
                        placeholder="1500"
                        min="0"
                        className={`w-full px-5 py-4 border-2 ${
                          formErrors.price
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      {formErrors.price && (
                        <p className="mt-2 text-sm text-red-600">
                          {formErrors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                        Duration (mins){" "}
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>
                      <input
                        type="number"
                        value={
                          formData.duration || ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: Number(
                              e.target.value
                            ),
                          })
                        }
                        placeholder="30"
                        min="5"
                        step="5"
                        className={`w-full px-5 py-4 border-2 ${
                          formErrors.duration
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      {formErrors.duration && (
                        <p className="mt-2 text-sm text-red-600">
                          {formErrors.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Layers className="h-4 w-4 text-orange-600 mr-2" />
                      Category{" "}
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category:
                            e.target.value,
                        })
                      }
                      className={`w-full px-5 py-4 border-2 ${
                        formErrors.category
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option
                          key={cat.value}
                          value={cat.value}
                        >
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="mt-2 text-sm text-red-600">
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end space-x-4 rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        <span>
                          Create Service
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const EditServiceModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isLoading,
  service,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: ServiceFormState;
  setFormData: (data: ServiceFormState) => void;
  formErrors: FormErrors;
  onSubmit: () => void;
  isLoading: boolean;
  service: GarageService | null;
}) => {
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-white relative flex items-center"
                  >
                    <Edit3 className="h-6 w-6 mr-2" />
                    Edit Service
                  </Dialog.Title>
                  <p className="text-blue-100 text-sm mt-1 relative">
                    Update your service details
                  </p>
                </div>

                <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Tag className="h-4 w-4 text-blue-600 mr-2" />
                      Service Name{" "}
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      className={`w-full px-5 py-4 border-2 ${
                        formErrors.name
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {formErrors.name && (
                      <p className="mt-2 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description:
                            e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Price & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price (ETB){" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="number"
                        value={
                          formData.price || ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(
                              e.target.value
                            ),
                          })
                        }
                        min="0"
                        className={`w-full px-5 py-4 border-2 ${
                          formErrors.price
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors.price && (
                        <p className="mt-2 text-sm text-red-600">
                          {formErrors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration (mins){" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="number"
                        value={
                          formData.duration || ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: Number(
                              e.target.value
                            ),
                          })
                        }
                        min="5"
                        step="5"
                        className={`w-full px-5 py-4 border-2 ${
                          formErrors.duration
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors.duration && (
                        <p className="mt-2 text-sm text-red-600">
                          {formErrors.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category:
                            e.target.value,
                        })
                      }
                      className={`w-full px-5 py-4 border-2 ${
                        formErrors.category
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option
                          key={cat.value}
                          value={cat.value}
                        >
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="mt-2 text-sm text-red-600">
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end space-x-4 rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const ServiceDetailsModal = ({
  isOpen,
  onClose,
  service,
  onEdit,
  onToggleAvailability,
  onDelete,
  onViewAnalytics,
}: {
  isOpen: boolean;
  onClose: () => void;
  service: GarageService | null;
  onEdit: () => void;
  onToggleAvailability: () => void;
  onDelete: () => void;
  onViewAnalytics: () => void;
}) => {
  if (!service) return null;

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div
                  className={`relative bg-gradient-to-r ${
                    service.isAvailable
                      ? "from-green-600 to-emerald-600"
                      : "from-gray-600 to-slate-600"
                  } px-8 py-6`}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-white relative flex items-center"
                  >
                    <Wrench className="h-6 w-6 mr-2" />
                    {service.name}
                  </Dialog.Title>
                  <p className="text-white/80 text-sm mt-1 relative">
                    Service Details
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        service.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {service.isAvailable
                        ? "● Available"
                        : "○ Unavailable"}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(
                        service.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Edit3 className="h-4 w-4 mr-2 text-gray-600" />
                      Description
                    </h4>
                    <p className="text-gray-700">
                      {service.description ||
                        "No description provided."}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Price
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {service.price} ETB
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                      <ClockIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Duration
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {service.duration} min
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                      <Layers className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Category
                      </p>
                      <p className="text-xl font-bold text-gray-900 capitalize">
                        {service.category}
                      </p>
                    </div>
                  </div>

                  {/* Bookings Summary */}
                  {service.bookings &&
                    service.bookings.length >
                      0 && (
                      <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                          Upcoming Bookings (
                          {
                            service.bookings
                              .length
                          }
                          )
                        </h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {service.bookings.map(
                            (booking) => {
                              const statusColor = getStatusColor(booking.status as BookingStatus);
                              const StatusIcon = getStatusIcon(booking.status as BookingStatus);
                              return (
                                <div
                                  key={booking._id}
                                  className="bg-white p-3 rounded-xl border border-gray-200"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {
                                          booking
                                            .carOwner
                                            .name
                                        }
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {new Date(
                                          booking.bookingDate
                                        ).toLocaleDateString()}{" "}
                                        at{" "}
                                        {
                                          booking
                                            .timeSlot
                                            .start
                                        }
                                      </p>
                                    </div>
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColor.bg} ${statusColor.text}`}
                                    >
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {statusColor.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-3 pt-4">
                    <button
                      onClick={onEdit}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={
                        onToggleAvailability
                      }
                      className={`px-4 py-3 ${
                        service.isAvailable
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white rounded-xl transition-all flex items-center justify-center gap-2`}
                    >
                      {service.isAvailable ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Enable
                        </>
                      )}
                    </button>
                    <button
                      onClick={onViewAnalytics}
                      className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart className="h-4 w-4" />
                      Analytics
                    </button>
                    <button
                      onClick={onDelete}
                      className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const ServiceAnalyticsModal = ({
  isOpen,
  onClose,
  service,
  analytics,
}: {
  isOpen: boolean;
  onClose: () => void;
  service: GarageService | null;
  analytics: ServiceAnalytics | null;
}) => {
  if (!service) return null;

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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-white relative flex items-center"
                  >
                    <BarChart className="h-6 w-6 mr-2" />
                    {service.name} - Analytics
                  </Dialog.Title>
                </div>

                <div className="p-8">
                  {analytics ? (
                    <div className="space-y-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                          <p className="text-sm text-gray-600">
                            Total Bookings
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              analytics.totalBookings
                            }
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl text-center">
                          <p className="text-sm text-gray-600">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              analytics.completedBookings
                            }
                          </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl text-center">
                          <p className="text-sm text-gray-600">
                            Cancelled
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              analytics.cancelledBookings
                            }
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl text-center">
                          <p className="text-sm text-gray-600">
                            Revenue
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              analytics.totalRevenue
                            }{" "}
                            ETB
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="bg-yellow-50 p-6 rounded-2xl">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Star className="h-5 w-5 text-yellow-600 mr-2" />
                          Average Rating
                        </h4>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-bold text-gray-900">
                            {analytics.averageRating.toFixed(
                              1
                            )}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(
                              (star) => (
                                <Star
                                  key={star}
                                  className={`h-6 w-6 ${
                                    star <=
                                    Math.round(
                                      analytics.averageRating
                                    )
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Monthly Trend */}
                      {analytics.monthlyTrend &&
                        analytics.monthlyTrend
                          .length > 0 && (
                          <div className="bg-gray-50 p-6 rounded-2xl">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                              Monthly Trend
                            </h4>
                            <div className="space-y-3">
                              {analytics.monthlyTrend.map(
                                (month) => (
                                  <div
                                    key={
                                      month.month
                                    }
                                    className="flex items-center gap-4"
                                  >
                                    <span className="w-24 text-sm text-gray-600">
                                      {
                                        month.month
                                      }
                                    </span>
                                    <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                        style={{
                                          width: `${(month.bookings / Math.max(...analytics.monthlyTrend.map((m) => m.bookings))) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {
                                        month.bookings
                                      }{" "}
                                      bookings
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {
                                        month.revenue
                                      }{" "}
                                      ETB
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No analytics data
                        available yet.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: any) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}
      >
        <Icon
          className={`h-6 w-6 text-${color}-600`}
        />
      </div>
      {trend && (
        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">
      {title}
    </h3>
    <p className="text-3xl font-bold text-gray-900">
      {value}
    </p>
  </div>
);

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  disabled = false,
}: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left w-full group ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : ""
    }`}
  >
    <div
      className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
    >
      <Icon
        className={`h-6 w-6 text-${color}-600`}
      />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 text-sm">
      {description}
    </p>
  </button>
);

const ServicesList = ({
  garage,
  onEdit,
  onToggleAvailability,
  onDelete,
  onViewDetails,
  onViewAnalytics,
}: {
  garage: PopulatedGarage;
  onEdit: (service: GarageService) => void;
  onToggleAvailability: (
    service: GarageService
  ) => void;
  onDelete: (service: GarageService) => void;
  onViewDetails: (service: GarageService) => void;
  onViewAnalytics: (
    service: GarageService
  ) => void;
}) => {
  const [filter, setFilter] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [categoryFilter, setCategoryFilter] =
    useState<string>("all");
  const [searchTerm, setSearchTerm] =
    useState("");

  if (
    !garage.services ||
    garage.services.length === 0
  ) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="h-10 w-10 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No Services Yet
        </h3>
        <p className="text-gray-600">
          Add your first service to start
          receiving bookings.
        </p>
      </div>
    );
  }

  const filteredServices = garage.services.filter(
    (service) => {
      if (
        filter === "available" &&
        !service.isAvailable
      )
        return false;
      if (
        filter === "unavailable" &&
        service.isAvailable
      )
        return false;
      if (
        categoryFilter !== "all" &&
        service.category !== categoryFilter
      )
        return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          service.name
            .toLowerCase()
            .includes(term) ||
          service.description
            ?.toLowerCase()
            .includes(term)
        );
      }
      return true;
    }
  );

  const categories = [
    "all",
    ...new Set(
      garage.services.map((s) => s.category)
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Your Services ({filteredServices.length}{" "}
          of {garage.services.length})
        </h3>

        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all"
                  ? "All Categories"
                  : cat}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <div className="flex gap-2">
            {(
              [
                "all",
                "available",
                "unavailable",
              ] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-xl text-sm capitalize ${
                  filter === status
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service._id}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group cursor-pointer"
            onClick={() => onViewDetails(service)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {service.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {service.category}
                </p>
              </div>
              <Menu as="div" className="relative">
                <Menu.Button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(service);
                            }}
                            className={`${
                              active
                                ? "bg-gray-100"
                                : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleAvailability(
                                service
                              );
                            }}
                            className={`${
                              active
                                ? "bg-gray-100"
                                : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                          >
                            {service.isAvailable ? (
                              <>
                                <EyeOff className="h-4 w-4" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                Enable
                              </>
                            )}
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewAnalytics(
                                service
                              );
                            }}
                            className={`${
                              active
                                ? "bg-gray-100"
                                : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                          >
                            <BarChart className="h-4 w-4" />
                            Analytics
                          </button>
                        )}
                      </Menu.Item>
                      <hr className="my-1" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(service);
                            }}
                            className={`${
                              active
                                ? "bg-gray-100"
                                : ""
                            } block w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2`}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {service.description}
            </p>

            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-gray-900">
                {service.price} ETB
              </span>
              <span className="text-sm text-gray-500">
                {service.duration} min
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {service.isAvailable
                  ? "Available"
                  : "Unavailable"}
              </span>

              {service.bookings &&
                service.bookings.length > 0 && (
                  <span className="text-sm text-purple-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {service.bookings.length}{" "}
                    booking
                    {service.bookings.length > 1
                      ? "s"
                      : ""}
                  </span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Updated BookingsList with status management
const BookingsList = ({
  garage,
  onBookingSelect,
  onStatusUpdate,
}: {
  garage: PopulatedGarage;
  onBookingSelect: (booking: any) => void;
  onStatusUpdate: (booking: any) => void;
}) => {
  const [selectedBooking, setSelectedBooking] =
    useState<any | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "inProgress" | "completed" | "cancelled" | "rejected"
  >("all");
  const [dateFilter, setDateFilter] =
    useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Flatten all bookings from all services
  const allBookings =
    garage.services?.reduce(
      (acc: any[], service) => {
        if (service.bookings) {
          return [
            ...acc,
            ...service.bookings.map(
              (booking) => ({
                ...booking,
                serviceName: service.name,
                serviceId: service._id,
                servicePrice: service.price,
              })
            ),
          ];
        }
        return acc;
      },
      []
    ) || [];

  const filteredBookings = allBookings.filter(
    (booking) => {
      if (
        filter !== "all" &&
        booking.status !== filter
      )
        return false;
      if (dateFilter) {
        const bookingDate = new Date(
          booking.bookingDate
        )
          .toISOString()
          .split("T")[0];
        if (bookingDate !== dateFilter)
          return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          booking.carOwner.name.toLowerCase().includes(term) ||
          booking.serviceName.toLowerCase().includes(term) ||
          booking.vehicleInfo?.licensePlate?.toLowerCase().includes(term)
        );
      }
      return true;
    }
  );

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      all: allBookings.length,
      pending: 0,
      approved: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    };
    allBookings.forEach((booking) => {
      if (counts[booking.status] !== undefined) {
        counts[booking.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (allBookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="h-10 w-10 text-yellow-600" />
        </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No Bookings Yet
        </h3>
        <p className="text-gray-600">
          When customers book your services,
          they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            All Bookings ({filteredBookings.length})
          </h3>
          <div className="flex gap-2 mt-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              if (status === 'all') return null;
              const statusColor = getStatusColor(status as BookingStatus);
              return (
                <span key={status} className={`text-xs px-2 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                  {status}: {count}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
            />
          </div>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Status filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking) => {
          const statusColor = getStatusColor(booking.status as BookingStatus);
          const StatusIcon = getStatusIcon(booking.status as BookingStatus);
          
          return (
            <div
              key={booking._id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4"
              style={{ borderLeftColor: `var(--${statusColor.text.split('-')[1]}-600)` }}
              onClick={() => onBookingSelect(booking)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left side - Main info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {booking.carOwner.name}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColor.bg} ${statusColor.text}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusColor.label}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {booking.serviceName}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.timeSlot.start} - {booking.timeSlot.end}
                    </div>
                    {booking.vehicleInfo && (
                      <div className="flex items-center text-gray-500">
                        <Car className="h-4 w-4 mr-1" />
                        {booking.vehicleInfo.make} {booking.vehicleInfo.model}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Price and actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-xl font-bold text-gray-900">
                      {booking.servicePrice} ETB
                    </p>
                  </div>
                  
                  {booking.status === BookingStatus.PENDING && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusUpdate(booking);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium"
                    >
                      Update Status
                    </button>
                  )}
                  
                  {booking.status === BookingStatus.APPROVED && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusUpdate(booking);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all text-sm font-medium"
                    >
                      Start Service
                    </button>
                  )}
                  
                  {booking.status === BookingStatus.IN_PROGRESS && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusUpdate(booking);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Customer contact info */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <Phone className="h-3 w-3 mr-1" />
                  {booking.carOwner.phone || "No phone"}
                </div>
                {booking.notes && (
                  <div className="flex items-center text-gray-500">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {booking.notes.substring(0, 50)}
                    {booking.notes.length > 50 && "..."}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state for filters */}
      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No bookings found
          </h4>
          <p className="text-gray-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
};

export default function OwnerDashboardPage(): JSX.Element {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    refreshUser,
  } = useAuth();
  const {
    garage,
    fetchMyGarage,
    createGarage,
    updateGarage,
    loading: garageLoading,
    error: garageError,
    clearError,
  } = useGarage();
  const {
    loading: paymentLoading,
    error: paymentError,
    initializeGaragePayment,
    verifyPayment,
    clearPayment,
  } = usePayment();
  const {
    services: serviceServices,
    currentService,
    analytics,
    loading: serviceLoading,
    error: serviceError,
    createService,
    updateService,
    toggleAvailability,
    deleteService,
    fetchServiceAnalytics,
    fetchServicesByGarage,
    refreshServices,
  } = useService();

  // Booking status management
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingStatusModal, setShowBookingStatusModal] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState<any | null>(null);

  const [showDeleted, setShowDeleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(true);
  const [isLoading, setIsLoading] =
    useState(false);
  const [loadingMessage, setLoadingMessage] =
    useState("");
  const [showSuccessModal, setShowSuccessModal] =
    useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");
  const [activeModal, setActiveModal] =
    useState<ModalType>(null);
  const [formData, setFormData] =
    useState<GarageFormState>(DEFAULT_FORM_STATE);
  const [serviceForm, setServiceForm] =
    useState<ServiceFormState>(
      DEFAULT_SERVICE_FORM
    );
  const [formErrors, setFormErrors] =
    useState<FormErrors>({});
  const [selectedService, setSelectedService] =
    useState<GarageService | null>(null);
  const [paymentStep, setPaymentStep] = useState<
    | "idle"
    | "processing"
    | "success"
    | "failed"
    | "completed"
  >("idle");
  const [paymentErrorMsg, setPaymentErrorMsg] =
    useState<string>("");
  const [debugLogs, setDebugLogs] = useState<
    string[]
  >([]);
  const [
    paymentCheckInterval,
    setPaymentCheckInterval,
  ] = useState<NodeJS.Timeout | null>(null);
  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  // Use the booking status hook
  const {
    updateStatus,
    isLoading: statusUpdating,
    error: statusError,
    reset: resetStatusError
  } = useBookingStatus({
    bookingId: updatingBooking?._id || "",
    onSuccess: (updatedBooking) => {
      showSuccess(`Booking status updated to ${updatedBooking.status}`);
      refreshServices(); // Refresh to get updated bookings
      setShowBookingStatusModal(false);
      setUpdatingBooking(null);
    },
    onError: (error) => {
      alert(`Failed to update status: ${error}`);
    }
  });

  const addDebugLog = (
    message: string,
    data?: any
  ) => {
    const timestamp =
      new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ""}`;
    console.log(log, data || "");
    setDebugLogs((prev) =>
      [...prev, log].slice(-10)
    );
  };

  const showLoading = (message: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage("");
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  useEffect(() => {
    if (authLoading) return;

    if (
      !isAuthenticated ||
      user?.role !== "garage_owner"
    ) {
      router.push("/login");
      return;
    }

    if (user?.token) {
      setTokenGetter(() => user.token);
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    router,
  ]);

  useEffect(() => {
    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [paymentCheckInterval]);

  const loadUserGarage = useCallback(async () => {
    if (!user?.id) return;

    try {
      showLoading("Loading your garage...");
      const result = await fetchMyGarage(user.id);

      if (result) {
        const typedGarage =
          result as PopulatedGarage;

        setFormData({
          name: typedGarage.name || "",
          description:
            typedGarage.description || "",
          phone:
            typedGarage.contactInfo?.phone || "",
          email:
            typedGarage.contactInfo?.email || "",
          website:
            typedGarage.contactInfo?.website ||
            "",
          street:
            typedGarage.address?.street || "",
          city: typedGarage.address?.city || "",
          state: typedGarage.address?.state || "",
          country:
            typedGarage.address?.country ||
            "Ethiopia",
          zipCode:
            typedGarage.address?.zipCode || "",
          mondayOpen:
            typedGarage.businessHours?.monday
              ?.open || "09:00",
          mondayClose:
            typedGarage.businessHours?.monday
              ?.close || "18:00",
          mondayClosed:
            typedGarage.businessHours?.monday
              ?.closed || false,
          tuesdayOpen:
            typedGarage.businessHours?.tuesday
              ?.open || "09:00",
          tuesdayClose:
            typedGarage.businessHours?.tuesday
              ?.close || "18:00",
          tuesdayClosed:
            typedGarage.businessHours?.tuesday
              ?.closed || false,
          wednesdayOpen:
            typedGarage.businessHours?.wednesday
              ?.open || "09:00",
          wednesdayClose:
            typedGarage.businessHours?.wednesday
              ?.close || "18:00",
          wednesdayClosed:
            typedGarage.businessHours?.wednesday
              ?.closed || false,
          thursdayOpen:
            typedGarage.businessHours?.thursday
              ?.open || "09:00",
          thursdayClose:
            typedGarage.businessHours?.thursday
              ?.close || "18:00",
          thursdayClosed:
            typedGarage.businessHours?.thursday
              ?.closed || false,
          fridayOpen:
            typedGarage.businessHours?.friday
              ?.open || "09:00",
          fridayClose:
            typedGarage.businessHours?.friday
              ?.close || "18:00",
          fridayClosed:
            typedGarage.businessHours?.friday
              ?.closed || false,
          saturdayOpen:
            typedGarage.businessHours?.saturday
              ?.open || "09:00",
          saturdayClose:
            typedGarage.businessHours?.saturday
              ?.close || "15:00",
          saturdayClosed:
            typedGarage.businessHours?.saturday
              ?.closed || false,
          sundayOpen:
            typedGarage.businessHours?.sunday
              ?.open || "09:00",
          sundayClose:
            typedGarage.businessHours?.sunday
              ?.close || "15:00",
          sundayClosed:
            typedGarage.businessHours?.sunday
              ?.closed || true,
        });

        // Load services for this garage
        await fetchServicesByGarage(
          typedGarage._id
        );
      }
    } catch (error: any) {
      addDebugLog("Error fetching garage", {
        error: error.message,
      });
    } finally {
      hideLoading();
    }
  }, [
    user,
    fetchMyGarage,
    fetchServicesByGarage,
  ]);

  useEffect(() => {
    if (user?.id) {
      loadUserGarage();
    }
  }, [user, loadUserGarage]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Garage name is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {
      errors.email = "Email is invalid";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateServiceForm = (): boolean => {
    const errors: FormErrors = {};

    if (!serviceForm.name.trim()) {
      errors.name = "Service name is required";
    }

    if (
      !serviceForm.price ||
      serviceForm.price <= 0
    ) {
      errors.price =
        "Price must be greater than 0";
    }

    if (
      !serviceForm.duration ||
      serviceForm.duration < 5
    ) {
      errors.duration =
        "Duration must be at least 5 minutes";
    }

    if (!serviceForm.category) {
      errors.category = "Category is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createGaragePayload =
    (): CreateGaragePayload => {
      return {
        name: formData.name,
        description:
          formData.description ||
          "No description",
        coordinates: [38.7578, 9.0054],
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website || undefined,
        },
        businessHours: {
          monday: {
            open: formData.mondayOpen,
            close: formData.mondayClose,
            closed: formData.mondayClosed,
          },
          tuesday: {
            open: formData.tuesdayOpen,
            close: formData.tuesdayClose,
            closed: formData.tuesdayClosed,
          },
          wednesday: {
            open: formData.wednesdayOpen,
            close: formData.wednesdayClose,
            closed: formData.wednesdayClosed,
          },
          thursday: {
            open: formData.thursdayOpen,
            close: formData.thursdayClose,
            closed: formData.thursdayClosed,
          },
          friday: {
            open: formData.fridayOpen,
            close: formData.fridayClose,
            closed: formData.fridayClosed,
          },
          saturday: {
            open: formData.saturdayOpen,
            close: formData.saturdayClose,
            closed: formData.saturdayClosed,
          },
          sunday: {
            open: formData.sundayOpen,
            close: formData.sundayClose,
            closed: formData.sundayClosed,
          },
        },
      };
    };

  const updateGaragePayload =
    (): UpdateGaragePayload => {
      return {
        name: formData.name,
        description: formData.description,
        address: {
          street: formData.street || "",
          city: formData.city || "",
          state: formData.state || "",
          country: formData.country || "Ethiopia",
          zipCode: formData.zipCode || "",
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website || undefined,
        },
        businessHours: {
          monday: {
            open: formData.mondayOpen,
            close: formData.mondayClose,
            closed: formData.mondayClosed,
          },
          tuesday: {
            open: formData.tuesdayOpen,
            close: formData.tuesdayClose,
            closed: formData.tuesdayClosed,
          },
          wednesday: {
            open: formData.wednesdayOpen,
            close: formData.wednesdayClose,
            closed: formData.wednesdayClosed,
          },
          thursday: {
            open: formData.thursdayOpen,
            close: formData.thursdayClose,
            closed: formData.thursdayClosed,
          },
          friday: {
            open: formData.fridayOpen,
            close: formData.fridayClose,
            closed: formData.fridayClosed,
          },
          saturday: {
            open: formData.saturdayOpen,
            close: formData.saturdayClose,
            closed: formData.saturdayClosed,
          },
          sunday: {
            open: formData.sundayOpen,
            close: formData.sundayClose,
            closed: formData.sundayClosed,
          },
        },
      };
    };

  const startPaymentStatusCheck = (
    txRef: string
  ) => {
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
    }

    const interval = setInterval(async () => {
      try {
        addDebugLog("Checking payment status", {
          txRef,
        });
        const status = await verifyPayment(txRef);

        addDebugLog("Payment status response", {
          status,
        });

        if (
          status === "completed" ||
          status === "successful"
        ) {
          setPaymentStep("completed");
          clearInterval(interval);
          setPaymentCheckInterval(null);
          await refreshUser();
          addDebugLog(
            "User refreshed, canCreateGarage should now be true"
          );
        } else if (
          status === "failed" ||
          status === "expired"
        ) {
          setPaymentStep("failed");
          setPaymentErrorMsg(
            "Payment failed or expired"
          );
          clearInterval(interval);
          setPaymentCheckInterval(null);
        }
      } catch (error: any) {
        addDebugLog("Payment check error", error);
      }
    }, 5000);

    setPaymentCheckInterval(interval);
  };

  const handleCreateGarageClick = () => {
    if (!user) return;

    if (user.canCreateGarage === true) {
      setActiveModal("create");
      setFormData(DEFAULT_FORM_STATE);
      setFormErrors({});
    } else {
      setShowPaymentModal(true);
      setPaymentStep("processing");
      handleInitializePayment();
    }
  };

  const handleCreateGarageSubmit = async () => {
    if (!validateForm()) {
      addDebugLog(
        "Form validation failed",
        formErrors
      );
      return;
    }

    if (!user) {
      addDebugLog("No user found");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert(
        "Authentication error. Please log out and log in again."
      );
      return;
    }

    const garagePayload = createGaragePayload();
    addDebugLog(
      "Creating garage with payload:",
      garagePayload
    );

    try {
      showLoading("Creating your garage...");
      addDebugLog(
        "Sending create garage request"
      );

      const created = await createGarage(
        garagePayload
      );
      addDebugLog(
        "Create garage response:",
        created
      );

      if (created) {
        setActiveModal(null);
        showSuccess(
          "Garage created successfully!"
        );
        await loadUserGarage();
        setFormData(DEFAULT_FORM_STATE);
      }
    } catch (error: any) {
      addDebugLog("Error in garage creation:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Please try again.";
      alert(
        `Failed to create garage: ${errorMessage}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleEditGarageClick = () => {
    if (!garage) return;

    const typedGarage = garage as PopulatedGarage;

    setFormData({
      name: typedGarage.name || "",
      description: typedGarage.description || "",
      phone: typedGarage.contactInfo?.phone || "",
      email: typedGarage.contactInfo?.email || "",
      website:
        typedGarage.contactInfo?.website || "",
      street: typedGarage.address?.street || "",
      city: typedGarage.address?.city || "",
      state: typedGarage.address?.state || "",
      country:
        typedGarage.address?.country ||
        "Ethiopia",
      zipCode: typedGarage.address?.zipCode || "",
      mondayOpen:
        typedGarage.businessHours?.monday?.open ||
        "09:00",
      mondayClose:
        typedGarage.businessHours?.monday
          ?.close || "18:00",
      mondayClosed:
        typedGarage.businessHours?.monday
          ?.closed || false,
      tuesdayOpen:
        typedGarage.businessHours?.tuesday
          ?.open || "09:00",
      tuesdayClose:
        typedGarage.businessHours?.tuesday
          ?.close || "18:00",
      tuesdayClosed:
        typedGarage.businessHours?.tuesday
          ?.closed || false,
      wednesdayOpen:
        typedGarage.businessHours?.wednesday
          ?.open || "09:00",
      wednesdayClose:
        typedGarage.businessHours?.wednesday
          ?.close || "18:00",
      wednesdayClosed:
        typedGarage.businessHours?.wednesday
          ?.closed || false,
      thursdayOpen:
        typedGarage.businessHours?.thursday
          ?.open || "09:00",
      thursdayClose:
        typedGarage.businessHours?.thursday
          ?.close || "18:00",
      thursdayClosed:
        typedGarage.businessHours?.thursday
          ?.closed || false,
      fridayOpen:
        typedGarage.businessHours?.friday?.open ||
        "09:00",
      fridayClose:
        typedGarage.businessHours?.friday
          ?.close || "18:00",
      fridayClosed:
        typedGarage.businessHours?.friday
          ?.closed || false,
      saturdayOpen:
        typedGarage.businessHours?.saturday
          ?.open || "09:00",
      saturdayClose:
        typedGarage.businessHours?.saturday
          ?.close || "15:00",
      saturdayClosed:
        typedGarage.businessHours?.saturday
          ?.closed || false,
      sundayOpen:
        typedGarage.businessHours?.sunday?.open ||
        "09:00",
      sundayClose:
        typedGarage.businessHours?.sunday
          ?.close || "15:00",
      sundayClosed:
        typedGarage.businessHours?.sunday
          ?.closed || true,
    });

    setFormErrors({});
    setActiveModal("edit");
  };

  const handleUpdateGarage = async () => {
    if (!validateForm()) return;
    if (!garage?._id) return;

    try {
      showLoading("Updating your garage...");
      const payload = updateGaragePayload();
      addDebugLog("Updating garage", {
        id: garage._id,
        payload,
      });

      const updated = await updateGarage(
        garage._id,
        payload
      );
      addDebugLog(
        "Update garage response",
        updated
      );

      if (updated) {
        setActiveModal(null);
        showSuccess(
          "Garage updated successfully!"
        );
        await loadUserGarage();
      }
    } catch (error: any) {
      addDebugLog("Error updating garage", error);
      alert(
        `Failed to update garage: ${error?.response?.data?.message || error.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleCreateServiceClick = () => {
    setServiceForm(DEFAULT_SERVICE_FORM);
    setFormErrors({});
    setActiveModal("create-service");
  };

  const handleCreateServiceSubmit = async () => {
    if (!validateServiceForm()) return;
    if (!garage?._id) return;

    try {
      showLoading("Creating service...");
      const payload: CreateServicePayload = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: serviceForm.price,
        duration: serviceForm.duration,
        category: serviceForm.category,
        garageId: garage._id,
      };

      const created =
        await createService(payload);
      addDebugLog(
        "Create service response",
        created
      );

      if (created) {
        setActiveModal(null);
        showSuccess(
          "Service created successfully!"
        );
        await refreshServices();
        setServiceForm(DEFAULT_SERVICE_FORM);
      }
    } catch (error: any) {
      addDebugLog(
        "Error creating service",
        error
      );
      alert(
        `Failed to create service: ${error?.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleEditService = (
    service: GarageService
  ) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      category: service.category,
    });
    setFormErrors({});
    setActiveModal("edit-service");
  };

  const handleUpdateService = async () => {
    if (!validateServiceForm()) return;
    if (!selectedService) return;

    try {
      showLoading("Updating service...");
      const payload: UpdateServicePayload = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: serviceForm.price,
        duration: serviceForm.duration,
        category: serviceForm.category,
      };

      const updated = await updateService(
        selectedService._id,
        payload
      );
      addDebugLog(
        "Update service response",
        updated
      );

      if (updated) {
        setActiveModal(null);
        showSuccess(
          "Service updated successfully!"
        );
        await refreshServices();
        setSelectedService(null);
        setServiceForm(DEFAULT_SERVICE_FORM);
      }
    } catch (error: any) {
      addDebugLog(
        "Error updating service",
        error
      );
      alert(
        `Failed to update service: ${error?.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleToggleAvailability = async (
    service: GarageService
  ) => {
    try {
      showLoading(
        `${service.isAvailable ? "Disabling" : "Enabling"} service...`
      );
      const updated = await toggleAvailability(
        service._id
      );
      addDebugLog(
        "Toggle availability response",
        updated
      );

      showSuccess(
        `Service ${service.isAvailable ? "disabled" : "enabled"} successfully!`
      );
      await refreshServices();
    } catch (error: any) {
      addDebugLog(
        "Error toggling availability",
        error
      );
      alert(
        `Failed to toggle availability: ${error?.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleDeleteService = async (
    service: GarageService
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${service.name}"?`
      )
    )
      return;

    try {
      showLoading("Deleting service...");
      await deleteService(service._id);
      addDebugLog("Delete service response");

      showSuccess(
        "Service deleted successfully!"
      );
      await refreshServices();
      if (selectedService?._id === service._id) {
        setSelectedService(null);
        setActiveModal(null);
      }
    } catch (error: any) {
      addDebugLog(
        "Error deleting service",
        error
      );
      alert(
        `Failed to delete service: ${error?.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleViewServiceDetails = (
    service: GarageService
  ) => {
    setSelectedService(service);
    setActiveModal("service-details");
  };

  const handleViewServiceAnalytics = async (
    service: GarageService
  ) => {
    try {
      showLoading("Loading analytics...");
      await fetchServiceAnalytics(service._id);
      setSelectedService(service);
      setActiveModal("service-analytics");
    } catch (error: any) {
      addDebugLog(
        "Error fetching analytics",
        error
      );
      alert("Failed to load analytics");
    } finally {
      hideLoading();
    }
  };

  const handleInitializePayment = async () => {
    try {
      setPaymentStep("processing");
      addDebugLog("Initializing payment", {
        amount: PAYMENT_AMOUNT,
      });

      const paymentResponse =
        await initializeGaragePayment(
          PAYMENT_AMOUNT
        );
      addDebugLog(
        "Payment initialization response",
        paymentResponse
      );

      if (paymentResponse?.checkoutUrl) {
        sessionStorage.setItem(
          "pendingTxRef",
          paymentResponse.tx_ref
        );

        const newWindow = window.open(
          paymentResponse.checkoutUrl,
          "_blank"
        );

        if (newWindow) {
          setPaymentStep("success");
          startPaymentStatusCheck(
            paymentResponse.tx_ref
          );
        } else {
          alert(
            "Popup blocked! Please allow popups for this site."
          );
          setPaymentStep("success");
          startPaymentStatusCheck(
            paymentResponse.tx_ref
          );
        }
      } else {
        setPaymentStep("failed");
        setPaymentErrorMsg(
          "Unable to initialize payment. Please try again."
        );
      }
    } catch (error: any) {
      addDebugLog(
        "Payment initialization error",
        error
      );
      setPaymentStep("failed");
      setPaymentErrorMsg(
        error?.message ||
          "Payment initialization failed"
      );
    }
  };

  const handlePaymentComplete = async () => {
    if (paymentStep === "completed") {
      await refreshUser();
      setShowPaymentModal(false);
      setPaymentStep("idle");
      sessionStorage.removeItem("pendingTxRef");
      showSuccess(
        "Payment successful! You can now create your garage."
      );
    } else {
      const txRef = sessionStorage.getItem(
        "pendingTxRef"
      );

      if (txRef) {
        try {
          const status =
            await verifyPayment(txRef);
          if (
            status === "completed" ||
            status === "successful"
          ) {
            setPaymentStep("completed");
          } else {
            alert(
              "Payment not completed yet. Please complete the payment in the new tab."
            );
          }
        } catch (error) {
          alert(
            "Error verifying payment. Please try again."
          );
        }
      }
    }
  };

  const resetPayment = () => {
    setPaymentStep("idle");
    setPaymentErrorMsg("");
    setShowPaymentModal(false);
    clearPayment();
    sessionStorage.removeItem("pendingTxRef");

    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Booking handlers
  const handleBookingSelect = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleStatusUpdateClick = (booking: any) => {
    setUpdatingBooking(booking);
    setShowBookingStatusModal(true);
    setShowBookingDetails(false);
  };

  const handleStatusUpdate = async (status: BookingStatus, reason?: string) => {
    if (!updatingBooking) return;
    await updateStatus(status, reason);
  };

  const typedGarage =
    garage as PopulatedGarage | null;

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #2563eb, #7c3aed);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex">
        <div className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl"></div>
        <div className="flex-1 p-8">
          <ContentLoadingSpinner message="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {isLoading && (
        <GlobalLoadingSpinner
          message={loadingMessage}
        />
      )}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() =>
            setShowSuccessModal(false)
          }
        />
      )}

      {activeModal === "edit" && (
        <EditGarageModal
          isOpen={activeModal === "edit"}
          onClose={() => setActiveModal(null)}
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          onSubmit={handleUpdateGarage}
          isLoading={isLoading}
        />
      )}

      {activeModal === "create" && (
        <CreateGarageModal
          isOpen={activeModal === "create"}
          onClose={() => {
            setActiveModal(null);
            setFormData(DEFAULT_FORM_STATE);
            setFormErrors({});
          }}
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          onSubmit={handleCreateGarageSubmit}
          isLoading={isLoading}
        />
      )}

      {activeModal === "create-service" &&
        typedGarage && (
          <CreateServiceModal
            isOpen={
              activeModal === "create-service"
            }
            onClose={() => {
              setActiveModal(null);
              setServiceForm(
                DEFAULT_SERVICE_FORM
              );
              setFormErrors({});
            }}
            formData={serviceForm}
            setFormData={setServiceForm}
            formErrors={formErrors}
            onSubmit={handleCreateServiceSubmit}
            isLoading={isLoading}
            garageId={typedGarage._id}
          />
        )}

      {activeModal === "edit-service" && (
        <EditServiceModal
          isOpen={activeModal === "edit-service"}
          onClose={() => {
            setActiveModal(null);
            setSelectedService(null);
            setServiceForm(DEFAULT_SERVICE_FORM);
            setFormErrors({});
          }}
          formData={serviceForm}
          setFormData={setServiceForm}
          formErrors={formErrors}
          onSubmit={handleUpdateService}
          isLoading={isLoading}
          service={selectedService}
        />
      )}

      {activeModal === "service-details" &&
        selectedService && (
          <ServiceDetailsModal
            isOpen={
              activeModal === "service-details"
            }
            onClose={() => {
              setActiveModal(null);
              setSelectedService(null);
            }}
            service={selectedService}
            onEdit={() => {
              setActiveModal("edit-service");
            }}
            onToggleAvailability={() => {
              setActiveModal(null);
              handleToggleAvailability(
                selectedService
              );
            }}
            onDelete={() => {
              setActiveModal(null);
              handleDeleteService(
                selectedService
              );
            }}
            onViewAnalytics={() => {
              setActiveModal("service-analytics");
              handleViewServiceAnalytics(
                selectedService
              );
            }}
          />
        )}

      {activeModal === "service-analytics" &&
        selectedService && (
          <ServiceAnalyticsModal
            isOpen={
              activeModal === "service-analytics"
            }
            onClose={() => {
              setActiveModal(null);
              setSelectedService(null);
            }}
            service={selectedService}
            analytics={analytics}
          />
        )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={showBookingDetails}
          onClose={() => {
            setShowBookingDetails(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onStatusUpdate={handleStatusUpdateClick}
        />
      )}

  

{updatingBooking && (
  <BookingStatusModal
    isOpen={showBookingStatusModal}
    onClose={() => {
      setShowBookingStatusModal(false);
      setUpdatingBooking(null);
    }}
    booking={updatingBooking}
    bookingId={updatingBooking._id} // Pass the booking ID directly
    onSuccess={() => {
      // Refresh your bookings/services after successful update
      refreshServices();
    }}
  />
)}


      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={resetPayment}
          paymentStep={paymentStep}
          paymentAmount={PAYMENT_AMOUNT}
          onRetry={handleInitializePayment}
          onContinue={handlePaymentComplete}
          error={paymentErrorMsg}
        />
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50 w-80 p-3 bg-gray-900 text-green-400 text-xs rounded-lg overflow-auto max-h-40 font-mono">
          <p className="text-white font-bold mb-1">
            🔍 DEBUG LOGS:
          </p>
          <p className="text-yellow-400">
            canCreateGarage:{" "}
            {user?.canCreateGarage
              ? "true"
              : "false"}
          </p>
          {debugLogs.map((log, i) => (
            <div
              key={i}
              className="border-b border-gray-700 pb-1 mb-1 last:border-0"
            >
              {log}
            </div>
          ))}
        </div>
      )}

      <div className="flex">
        <aside
          className={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-xl shadow-2xl transition-all duration-300 z-40 ${isSidebarOpen ? "w-72" : "w-24"}`}
        >
          <div className="flex flex-col h-full">
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200">
              {isSidebarOpen ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    GarageFlow
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                  <Car className="h-5 w-5 text-white" />
                </div>
              )}
              <button
                onClick={() =>
                  setIsSidebarOpen(!isSidebarOpen)
                }
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {user?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full flex items-center w-fit ${
                          user?.canCreateGarage
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user?.canCreateGarage ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />{" "}
                            Can Create
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3 w-3 mr-1" />{" "}
                            Payment Required
                          </>
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-3">
                {[
                  {
                    id: "dashboard",
                    label: "Dashboard",
                    icon: Home,
                  },
                  {
                    id: "garage",
                    label: "My Garage",
                    icon: Building2,
                  },
                  {
                    id: "bookings",
                    label: "Bookings",
                    icon: Calendar,
                  },
                  {
                    id: "services",
                    label: "Services",
                    icon: Wrench,
                  },
                  {
                    id: "profile",
                    label: "Profile",
                    icon: User,
                  },
                  {
                    id: "settings",
                    label: "Settings",
                    icon: Settings,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() =>
                          setActiveTab(
                            item.id as DashboardTab
                          )
                        }
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                          activeTab === item.id
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : "mx-auto"}`}
                        />
                        {isSidebarOpen && (
                          <span className="font-medium">
                            {item.label}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {!isSidebarOpen && (
              <div className="px-3 py-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto ${
                    user?.canCreateGarage
                      ? "bg-green-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {user?.canCreateGarage ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
              >
                <LogOut
                  className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : "mx-auto"}`}
                />
                {isSidebarOpen && (
                  <span>Logout</span>
                )}
              </button>
            </div>
          </div>
        </aside>

        <main
          className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-24"}`}
        >
          <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="px-8 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {activeTab === "dashboard" &&
                      "Dashboard Overview"}
                    {activeTab === "garage" &&
                      "My Garage"}
                    {activeTab === "bookings" &&
                      "Bookings Management"}
                    {activeTab === "services" &&
                      "Services Management"}
                    {activeTab === "profile" &&
                      "Profile Settings"}
                    {activeTab === "settings" &&
                      "System Settings"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {!user?.canCreateGarage &&
                    !typedGarage && (
                      <div
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 cursor-pointer hover:bg-yellow-200 flex items-center"
                        onClick={
                          handleCreateGarageClick
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Payment Required
                      </div>
                    )}
                  <button className="p-2 hover:bg-gray-100 rounded-full relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <Menu
                    as="div"
                    className="relative"
                  >
                    <Menu.Button className="flex items-center space-x-3 focus:outline-none">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {user?.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() =>
                                  setActiveTab(
                                    "profile"
                                  )
                                }
                                className={`${
                                  active
                                    ? "bg-gray-100"
                                    : ""
                                } block px-4 py-2 text-sm text-gray-700 w-full text-left flex items-center`}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Your Profile
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() =>
                                  setActiveTab(
                                    "settings"
                                  )
                                }
                                className={`${
                                  active
                                    ? "bg-gray-100"
                                    : ""
                                } block px-4 py-2 text-sm text-gray-700 w-full text-left flex items-center`}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </button>
                            )}
                          </Menu.Item>
                          <hr className="my-1" />
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={
                                  handleLogout
                                }
                                className={`${
                                  active
                                    ? "bg-gray-100"
                                    : ""
                                } block px-4 py-2 text-sm text-red-600 w-full text-left flex items-center`}
                              >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8">
            {garageLoading && !garage ? (
              <ContentLoadingSpinner message="Loading your garage..." />
            ) : (
              <>
                {activeTab === "dashboard" && (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full transform -translate-x-24 translate-y-24"></div>
                      <div className="relative">
                        <h2 className="text-3xl font-bold mb-2 flex items-center">
                          Welcome back,{" "}
                          {user?.name}!{" "}
                          <Sparkles className="h-6 w-6 ml-2 text-yellow-300" />
                        </h2>
                        <p className="text-blue-100 text-lg max-w-2xl">
                          {typedGarage
                            ? `Here's what's happening with your garage today. You have ${typedGarage?.stats?.totalBookings || 0} total bookings and ${typedGarage?.stats?.completedBookings || 0} completed services.`
                            : user?.canCreateGarage
                              ? "You're ready to create your garage! Click the button below to get started."
                              : "Complete a one-time payment to unlock garage creation and start receiving bookings."}
                        </p>
                      </div>
                    </div>

                    {typedGarage && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                          title="Total Bookings"
                          value={
                            typedGarage?.stats
                              ?.totalBookings || 0
                          }
                          icon={Calendar}
                          color="blue"
                          trend="12"
                        />
                        <StatCard
                          title="Completed"
                          value={
                            typedGarage?.stats
                              ?.completedBookings ||
                            0
                          }
                          icon={CheckSquare}
                          color="green"
                        />
                        <StatCard
                          title="Average Rating"
                          value={
                            typedGarage?.stats?.averageRating?.toFixed(
                              1
                            ) || "0.0"
                          }
                          icon={Star}
                          color="yellow"
                        />
                        <StatCard
                          title="Total Reviews"
                          value={
                            typedGarage?.stats
                              ?.totalReviews || 0
                          }
                          icon={Users}
                          color="purple"
                        />
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {!typedGarage ? (
                          <QuickActionCard
                            title={
                              user?.canCreateGarage
                                ? "Create Garage"
                                : "Make Payment"
                            }
                            description={
                              user?.canCreateGarage
                                ? "List your garage and start receiving bookings"
                                : "Complete payment to unlock garage creation"
                            }
                            icon={
                              user?.canCreateGarage
                                ? Building2
                                : CreditCard
                            }
                            color={
                              user?.canCreateGarage
                                ? "blue"
                                : "yellow"
                            }
                            onClick={
                              handleCreateGarageClick
                            }
                          />
                        ) : (
                          <>
                            <QuickActionCard
                              title="Edit Garage"
                              description="Update your garage information and hours"
                              icon={Edit3}
                              color="green"
                              onClick={
                                handleEditGarageClick
                              }
                            />
                            <QuickActionCard
                              title="Manage Services"
                              description="Add or update your service offerings"
                              icon={Wrench}
                              color="purple"
                              onClick={
                                handleCreateServiceClick
                              }
                            />
                            <QuickActionCard
                              title="View Bookings"
                              description="Check your upcoming appointments"
                              icon={Calendar}
                              color="yellow"
                              onClick={() =>
                                setActiveTab(
                                  "bookings"
                                )
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {typedGarage && (
                      <div className="bg-white rounded-3xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Garage Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Status
                            </p>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  typedGarage.status ===
                                  "active"
                                    ? "bg-green-500"
                                    : typedGarage.status ===
                                        "pending"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                              ></div>
                              <span className="font-medium text-gray-900 capitalize">
                                {
                                  typedGarage.status
                                }
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Verification
                            </p>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${typedGarage.isVerified ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span className="font-medium text-gray-900">
                                {typedGarage.isVerified
                                  ? "Verified"
                                  : "Not Verified"}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Active
                            </p>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${typedGarage.isActive ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span className="font-medium text-gray-900">
                                {typedGarage.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Paid On
                            </p>
                            <p className="font-medium text-gray-900">
                              {typedGarage.paidAt
                                ? new Date(
                                    typedGarage.paidAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "garage" && (
                  <div className="max-w-6xl mx-auto space-y-10">
                    {typedGarage ? (
                      <div className="rounded-3xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm">
                        {/* Header */}
                        <div className="relative h-56 bg-gradient-to-br from-indigo-600/90 via-blue-600/80 to-purple-600/90">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <button
                            onClick={
                              handleEditGarageClick
                            }
                            className="absolute top-5 right-5 bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
                          >
                            <Edit3 size={16} />
                            Edit
                          </button>
                        </div>

                        {/* Content */}
                        <div className="px-8 pb-10 relative">
                          {/* Icon */}
                          <div className="absolute -top-12 left-8 w-24 h-24 rounded-2xl bg-white/90 backdrop-blur shadow-xl flex items-center justify-center">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                              <Car
                                size={28}
                                className="text-white"
                              />
                            </div>
                          </div>

                          {/* Title */}
                          <div className="ml-32 pt-6">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                              {typedGarage.name}
                            </h2>
                            <p className="text-gray-500 mt-2 leading-relaxed max-w-xl">
                              {
                                typedGarage.description
                              }
                            </p>
                          </div>

                          {/* Grid */}
                          <div className="grid md:grid-cols-2 gap-6 mt-10">
                            {/* Contact */}
                            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 backdrop-blur border border-white/40 shadow-sm">
                              <h3 className="flex items-center gap-2 text-gray-800 font-semibold mb-5">
                                <Phone
                                  size={18}
                                  className="text-blue-600"
                                />
                                Contact Information
                              </h3>
                              <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3">
                                  <Phone
                                    size={16}
                                    className="text-blue-500/70"
                                  />
                                  <span className="text-gray-500 w-20">
                                    Phone
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {
                                      typedGarage
                                        .contactInfo
                                        ?.phone
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Mail
                                    size={16}
                                    className="text-indigo-500/70"
                                  />
                                  <span className="text-gray-500 w-20">
                                    Email
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {
                                      typedGarage
                                        .contactInfo
                                        ?.email
                                    }
                                  </span>
                                </div>
                                {typedGarage
                                  .contactInfo
                                  ?.website && (
                                  <div className="flex items-center gap-3">
                                    <Globe
                                      size={16}
                                      className="text-purple-500/70"
                                    />
                                    <span className="text-gray-500 w-20">
                                      Website
                                    </span>
                                    <a
                                      href={
                                        typedGarage
                                          .contactInfo
                                          .website
                                      }
                                      target="_blank"
                                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                      Visit
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Address */}
                            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-50/80 to-indigo-50/60 border border-white/40 shadow-sm">
                              <h3 className="flex items-center gap-2 text-gray-800 font-semibold mb-5">
                                <MapPin
                                  size={18}
                                  className="text-purple-600"
                                />
                                Address
                              </h3>
                              <div className="space-y-2 text-gray-700 leading-relaxed">
                                <p>
                                  {
                                    typedGarage
                                      .address
                                      ?.street
                                  }
                                </p>
                                <p>
                                  {
                                    typedGarage
                                      .address
                                      ?.city
                                  }
                                  ,{" "}
                                  {
                                    typedGarage
                                      .address
                                      ?.state
                                  }{" "}
                                  {
                                    typedGarage
                                      .address
                                      ?.zipCode
                                  }
                                </p>
                                <p className="text-gray-500">
                                  {
                                    typedGarage
                                      .address
                                      ?.country
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Business Hours */}
                          <div className="mt-8 max-w-6xl mx-auto px-4">
                            {/* Compact Header */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                                    <Clock
                                      className="text-white"
                                      size={18}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-slate-800">
                                    Weekly Hours
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono">
                                      UTC+3
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      Ethiopian Time
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Live Time */}
                              {(() => {
                                const now =
                                  DateTime.now().setZone(
                                    "Africa/Addis_Ababa"
                                  );
                                const today = now
                                  .toFormat(
                                    "cccc"
                                  )
                                  .toLowerCase();
                                const todayHours =
                                  typedGarage
                                    .businessHours?.[
                                    today
                                  ];

                                const isOpenNow =
                                  todayHours &&
                                  !todayHours.closed &&
                                  todayHours.open &&
                                  todayHours.close &&
                                  now.hour >=
                                    parseInt(
                                      todayHours.open.split(
                                        ":"
                                      )[0]
                                    ) &&
                                  now.hour <
                                    parseInt(
                                      todayHours.close.split(
                                        ":"
                                      )[0]
                                    );

                                return (
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                                      <span className="text-xs font-mono text-slate-600">
                                        {now.toFormat(
                                          "hh:mm:ss a"
                                        )}
                                      </span>
                                    </div>
                                    <div
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                        isOpenNow
                                          ? "bg-green-50 border border-green-200"
                                          : "bg-red-50 border border-red-200"
                                      }`}
                                    >
                                      <div className="relative">
                                        <div
                                          className={`absolute inset-0 rounded-full ${
                                            isOpenNow
                                              ? "bg-green-400"
                                              : "bg-red-400"
                                          } blur-sm animate-ping opacity-75`}
                                        />
                                        <div
                                          className={`relative w-2 h-2 rounded-full ${
                                            isOpenNow
                                              ? "bg-green-500"
                                              : "bg-red-500"
                                          }`}
                                        />
                                      </div>
                                      <span
                                        className={`text-xs font-medium ${
                                          isOpenNow
                                            ? "text-green-700"
                                            : "text-red-700"
                                        }`}
                                      >
                                        {isOpenNow
                                          ? "Open Now"
                                          : "Closed Now"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                              {typedGarage.businessHours &&
                                Object.entries(
                                  typedGarage.businessHours
                                ).map(
                                  ([
                                    day,
                                    hours,
                                  ]) => {
                                    const ethiopianNow =
                                      DateTime.now().setZone(
                                        "Africa/Addis_Ababa"
                                      );
                                    const todayName =
                                      ethiopianNow
                                        .toFormat(
                                          "cccc"
                                        )
                                        .toLowerCase();
                                    const isToday =
                                      todayName ===
                                      day;
                                    const isClosed =
                                      hours.closed;

                                    const now =
                                      ethiopianNow;
                                    const currentHour =
                                      now.hour;
                                    const currentMinute =
                                      now.minute;
                                    const currentTimeValue =
                                      currentHour +
                                      currentMinute /
                                        60;

                                    const openHour =
                                      hours.open
                                        ? parseInt(
                                            hours.open.split(
                                              ":"
                                            )[0]
                                          ) +
                                          parseInt(
                                            hours.open.split(
                                              ":"
                                            )[1]
                                          ) /
                                            60
                                        : 0;
                                    const closeHour =
                                      hours.close
                                        ? parseInt(
                                            hours.close.split(
                                              ":"
                                            )[0]
                                          ) +
                                          parseInt(
                                            hours.close.split(
                                              ":"
                                            )[1]
                                          ) /
                                            60
                                        : 0;

                                    const isCurrentlyOpen =
                                      isToday &&
                                      !isClosed &&
                                      hours.open &&
                                      hours.close &&
                                      currentTimeValue >=
                                        openHour &&
                                      currentTimeValue <
                                        closeHour;

                                    let openTime =
                                      null;
                                    let closeTime =
                                      null;

                                    if (
                                      !isClosed &&
                                      hours.open &&
                                      hours.close
                                    ) {
                                      try {
                                        openTime =
                                          DateTime.fromFormat(
                                            hours.open,
                                            "HH:mm",
                                            {
                                              zone: "Africa/Addis_Ababa",
                                            }
                                          ).toFormat(
                                            "h:mm"
                                          );
                                        closeTime =
                                          DateTime.fromFormat(
                                            hours.close,
                                            "HH:mm",
                                            {
                                              zone: "Africa/Addis_Ababa",
                                            }
                                          ).toFormat(
                                            "h:mm a"
                                          );
                                      } catch (e) {}
                                    }

                                    return (
                                      <div
                                        key={day}
                                        className={`relative rounded-xl p-3 transition-all ${
                                          isToday
                                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg ring-2 ring-amber-200 ring-offset-2"
                                            : "bg-white border border-slate-200 hover:border-slate-300"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <p
                                            className={`text-sm font-semibold capitalize ${
                                              isToday
                                                ? "text-white"
                                                : "text-slate-700"
                                            }`}
                                          >
                                            {day.slice(
                                              0,
                                              3
                                            )}
                                          </p>
                                          <div className="relative">
                                            {isCurrentlyOpen && (
                                              <>
                                                <div className="absolute -inset-1 bg-green-400 rounded-full blur-sm animate-ping opacity-75" />
                                                <div className="absolute -inset-1 bg-green-300 rounded-full blur-md animate-pulse opacity-50" />
                                                <div className="relative w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                  <span className="text-white text-[8px] font-bold">
                                                    OPEN
                                                  </span>
                                                </div>
                                              </>
                                            )}
                                            {isToday &&
                                              isClosed && (
                                                <>
                                                  <div className="absolute -inset-1 bg-red-400 rounded-full blur-sm animate-ping opacity-75" />
                                                  <div className="absolute -inset-1 bg-red-300 rounded-full blur-md animate-pulse opacity-50" />
                                                  <div className="relative w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-white text-[8px] font-bold">
                                                      OFF
                                                    </span>
                                                  </div>
                                                </>
                                              )}
                                            {isToday &&
                                              !isCurrentlyOpen &&
                                              !isClosed && (
                                                <>
                                                  <div className="absolute -inset-1 bg-amber-400 rounded-full blur-sm animate-pulse opacity-50" />
                                                  <div className="relative w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-white text-[8px] font-bold">
                                                      TODAY
                                                    </span>
                                                  </div>
                                                </>
                                              )}
                                            {!isToday &&
                                              !isClosed && (
                                                <div className="relative w-4 h-4 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                </div>
                                              )}
                                            {!isToday &&
                                              isClosed && (
                                                <div className="relative w-4 h-4 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
                                                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                                                </div>
                                              )}
                                          </div>
                                        </div>

                                        {/* Time Display */}
                                        {isClosed ? (
                                          <div className="text-center py-1">
                                            <p
                                              className={`text-xs ${isToday ? "text-white/70" : "text-slate-400"}`}
                                            >
                                              Rest day 😴
                                            </p>
                                            {isToday && (
                                              <p className="text-[10px] text-white/50 mt-1">
                                                Closed all day
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                              <span
                                                className={
                                                  isToday
                                                    ? "text-white/70"
                                                    : "text-slate-400"
                                                }
                                              >
                                                Open
                                              </span>
                                              <span
                                                className={`font-mono font-medium ${
                                                  isToday
                                                    ? "text-white"
                                                    : "text-slate-700"
                                                }`}
                                              >
                                                {
                                                  openTime
                                                }
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span
                                                className={
                                                  isToday
                                                    ? "text-white/70"
                                                    : "text-slate-400"
                                                }
                                              >
                                                Close
                                              </span>
                                              <span
                                                className={`font-mono font-medium ${
                                                  isToday
                                                    ? "text-white"
                                                    : "text-slate-700"
                                                }`}
                                              >
                                                {
                                                  closeTime
                                                }
                                              </span>
                                            </div>
                                            {isCurrentlyOpen && (
                                              <p className="text-[10px] text-green-300 mt-1 animate-pulse text-center">
                                                ● Open Now
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="mt-10 grid md:grid-cols-3 gap-5">
                            <div className="rounded-xl p-4 bg-blue-50/80 border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium mb-1">
                                Created
                              </p>
                              <p className="font-semibold text-gray-800">
                                {new Date(
                                  typedGarage.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="rounded-xl p-4 bg-green-50/80 border border-green-100">
                              <p className="text-xs text-green-600 font-medium mb-1">
                                Updated
                              </p>
                              <p className="font-semibold text-gray-800">
                                {new Date(
                                  typedGarage.updatedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="rounded-xl p-4 bg-purple-50/80 border border-purple-100">
                              <p className="text-xs text-purple-600 font-medium mb-1">
                                Verification
                              </p>
                              <p className="font-semibold text-gray-800">
                                {typedGarage.verifiedAt
                                  ? new Date(
                                      typedGarage.verifiedAt
                                    ).toLocaleDateString()
                                  : "Not verified"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Building2 className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          No Garage Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {user?.canCreateGarage
                            ? "You haven't created a garage yet. Get started now!"
                            : "Complete payment to create your garage."}
                        </p>
                        <button
                          onClick={
                            handleCreateGarageClick
                          }
                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium"
                        >
                          {user?.canCreateGarage
                            ? "Create Garage"
                            : "Make Payment"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "bookings" &&
                  (typedGarage ? (
                    <BookingsList
                      garage={typedGarage}
                      onBookingSelect={handleBookingSelect}
                      onStatusUpdate={handleStatusUpdateClick}
                    />
                  ) : (
                    <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                      <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="h-10 w-10 text-yellow-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        No Garage Yet
                      </h3>
                      <p className="text-gray-600">
                        Create a garage first to
                        start receiving bookings.
                      </p>
                    </div>
                  ))}

                {activeTab === "services" && typedGarage && (
                  <ServicesList
                    garage={typedGarage}
                    onEdit={handleEditService}
                    onToggleAvailability={handleToggleAvailability}
                    onDelete={handleDeleteService}
                    onViewDetails={handleViewServiceDetails}
                    onViewAnalytics={handleViewServiceAnalytics}
                  />
                )}

                {activeTab === "profile" && (
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Profile Settings
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                          {user?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {user?.name}
                          </h4>
                          <p className="text-gray-600">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={
                              user?.name || ""
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={
                              user?.email || ""
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                          </label>
                          <input
                            type="text"
                            value={
                              user?.role || ""
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Garage Creation Status
                          </label>
                          <div
                            className={`w-full px-4 py-3 border-2 rounded-xl flex items-center ${
                              user?.canCreateGarage
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-yellow-200 bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {user?.canCreateGarage ? (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2" />{" "}
                                Enabled
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-5 w-5 mr-2" />{" "}
                                Payment Required
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      System Settings
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Notification Preferences
                        </h4>
                        <div className="space-y-3">
                          <label className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 mr-3 h-5 w-5"
                            />
                            <span className="text-gray-700">
                              Email notifications
                              for new bookings
                            </span>
                          </label>
                          <label className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 mr-3 h-5 w-5"
                            />
                            <span className="text-gray-700">
                              SMS notifications
                              for booking updates
                            </span>
                          </label>
                          <label className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 mr-3 h-5 w-5"
                            />
                            <span className="text-gray-700">
                              Weekly report emails
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}