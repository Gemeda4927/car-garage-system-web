// lib/constants/dashboard.constants.ts
import { 
  Sun, Moon, Clock3, Clock4, Clock5, Clock6, Clock7,
  Building2, CreditCard, Wrench, Calendar, Edit3, 
  CheckCircle2,
  XCircle,
  ThumbsDown,
  ThumbsUp,
  Clock,
  CheckCircle,
  Play,
  AlertTriangle,
  Info,
  Home,
  User,
  Settings,
  Phone
} from "lucide-react";
import { BookingStatus } from "@/lib/types/booking.types";

// ============================================
// TYPES
// ============================================

export type DashboardTab = "dashboard" | "garage" | "bookings" | "services" | "settings" | "profile";
export type ModalType = "create" | "edit" | "create-service" | "edit-service" | "service-details" | "service-analytics" | "booking-details" | "booking-status-update" | null;
export type PaymentStep = "idle" | "processing" | "success" | "failed" | "completed";

export interface GarageFormState {
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

export interface ServiceFormState {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

export interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  price?: string;
  duration?: string;
  category?: string;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface NavItem {
  id: DashboardTab;
  label: string;
  icon: any;
}

// ============================================
// CONSTANTS
// ============================================

export const PAYMENT_AMOUNT = 100;

export const DEFAULT_FORM_STATE: GarageFormState = {
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

export const DEFAULT_SERVICE_FORM: ServiceFormState = {
  name: "",
  description: "",
  price: 0,
  duration: 30,
  category: "maintenance",
};

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "garage", label: "My Garage", icon: Building2 },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "services", label: "Services", icon: Wrench },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

export const QUICK_ACTIONS = {
  createGarage: {
    id: "create-garage",
    title: "Create Garage",
    description: "List your garage and start receiving bookings",
    icon: Building2,
    color: "blue",
  },
  makePayment: {
    id: "make-payment",
    title: "Make Payment",
    description: "Complete payment to unlock garage creation",
    icon: CreditCard,
    color: "yellow",
  },
  editGarage: {
    id: "edit-garage",
    title: "Edit Garage",
    description: "Update your garage information and hours",
    icon: Edit3,
    color: "green",
  },
  manageServices: {
    id: "manage-services",
    title: "Manage Services",
    description: "Add or update your service offerings",
    icon: Wrench,
    color: "purple",
  },
  viewBookings: {
    id: "view-bookings",
    title: "View Bookings",
    description: "Check your upcoming appointments",
    icon: Calendar,
    color: "yellow",
  },
};

export const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday", icon: Sun, color: "yellow" },
  { key: "tuesday", label: "Tuesday", icon: Clock3, color: "orange" },
  { key: "wednesday", label: "Wednesday", icon: Clock4, color: "amber" },
  { key: "thursday", label: "Thursday", icon: Clock5, color: "blue" },
  { key: "friday", label: "Friday", icon: Clock6, color: "indigo" },
  { key: "saturday", label: "Saturday", icon: Clock7, color: "purple" },
  { key: "sunday", label: "Sunday", icon: Moon, color: "gray" },
] as const;

export const TAB_CONFIGS = [
  {
    id: "basic" as const,
    label: "Basic Info",
    icon: Building2,
    color: "blue",
    description: "Update your garage name, description and location",
  },
  {
    id: "contact" as const,
    label: "Contact",
    icon: Phone,
    color: "purple",
    description: "Update your contact details",
  },
  {
    id: "hours" as const,
    label: "Hours",
    icon: Clock,
    color: "green",
    description: "Update your business hours",
  },
];

export const CATEGORIES = [
  { value: "maintenance", label: "Maintenance", color: "blue" },
  { value: "repair", label: "Repair", color: "red" },
  { value: "diagnostic", label: "Diagnostic", color: "purple" },
  { value: "detailing", label: "Detailing", color: "green" },
  { value: "tire", label: "Tire Service", color: "orange" },
  { value: "electrical", label: "Electrical", color: "yellow" },
  { value: "ac", label: "AC Service", color: "cyan" },
  { value: "body", label: "Body Work", color: "pink" },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getStatusColor = (status: BookingStatus): { bg: string; text: string; label: string } => {
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

export const getStatusIcon = (status: BookingStatus) => {
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

export const formatDate = (date: string | Date, format: "full" | "short" | "time" = "full"): string => {
  const d = new Date(date);
  switch (format) {
    case "full":
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "short":
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "time":
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    default:
      return d.toLocaleDateString();
  }
};

export const formatCurrency = (amount: number, currency: string = "ETB"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation - can be customized based on your needs
  return phone.trim().length >= 10;
};

export const validatePrice = (price: number): boolean => {
  return price > 0;
};

export const validateDuration = (duration: number): boolean => {
  return duration >= 5;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};



export const generateTimeSlots = (start: string, end: string, duration: number = 30): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  
  // Use a different variable name (endTimeInMinutes instead of end)
  let current = startHour * 60 + startMin;
  const endTimeInMinutes = endHour * 60 + endMin;
  
  while (current < endTimeInMinutes) {
    const hours = Math.floor(current / 60);
    const mins = current % 60;
    slots.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
    current += duration;
  }
  
  return slots;
};

export const isOpenNow = (businessHours: BusinessHours): boolean => {
  const now = new Date();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = days[now.getDay()] as keyof BusinessHours;
  const todayHours = businessHours[today];
  
  if (!todayHours || todayHours.closed) return false;
  
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTime = currentHour + currentMin / 60;
  
  const [openHour, openMin] = todayHours.open.split(":").map(Number);
  const [closeHour, closeMin] = todayHours.close.split(":").map(Number);
  
  const openTime = openHour + openMin / 60;
  const closeTime = closeHour + closeMin / 60;
  
  return currentTime >= openTime && currentTime < closeTime;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// ============================================
// ANIMATION STYLES
// ============================================

export const animationStyles = `
  @keyframes scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-scale-in {
    animation: scale-in 0.2s ease-out;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeInUp {
    animation: fadeInUp 0.3s ease-out;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideOut {
    from { transform: translateX(0); }
    to { transform: translateX(100%); }
  }
  .animate-slideOut {
    animation: slideOut 0.3s ease-out;
  }
`;

// ============================================
// SCROLLBAR STYLES
// ============================================

export const scrollbarStyles = `
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

// ============================================
// MESSAGES
// ============================================

export const MESSAGES = {
  success: {
    garageCreated: "Garage created successfully!",
    garageUpdated: "Garage updated successfully!",
    serviceCreated: "Service created successfully!",
    serviceUpdated: "Service updated successfully!",
    serviceDeleted: "Service deleted successfully!",
    serviceToggled: (action: "enabled" | "disabled") => 
      `Service ${action} successfully!`,
    paymentSuccess: "Payment successful! You can now create your garage.",
    bookingUpdated: (status: string) => `Booking status updated to ${status}`,
  },
  error: {
    auth: "Authentication error. Please log out and log in again.",
    createGarage: "Failed to create garage: ",
    updateGarage: "Failed to update garage: ",
    createService: "Failed to create service: ",
    updateService: "Failed to update service: ",
    deleteService: "Failed to delete service: ",
    toggleService: "Failed to toggle availability: ",
    loadAnalytics: "Failed to load analytics",
    paymentInit: "Unable to initialize payment. Please try again.",
    paymentVerify: "Error verifying payment. Please try again.",
    popupBlocked: "Popup blocked! Please allow popups for this site.",
  },
  validation: {
    nameRequired: "Garage name is required",
    phoneRequired: "Phone number is required",
    emailRequired: "Email is required",
    emailInvalid: "Email is invalid",
    serviceNameRequired: "Service name is required",
    pricePositive: "Price must be greater than 0",
    durationMin: "Duration must be at least 5 minutes",
    categoryRequired: "Category is required",
  },
  loading: {
    garage: "Loading your garage...",
    creating: "Creating your garage...",
    updating: "Updating your garage...",
    creatingService: "Creating service...",
    updatingService: "Updating service...",
    deletingService: "Deleting service...",
    togglingService: (action: string) => `${action} service...`,
    loadingAnalytics: "Loading analytics...",
    processingPayment: "Processing payment...",
  },
  confirm: {
    deleteService: (name: string) => `Are you sure you want to delete "${name}"?`,
  },
  empty: {
    noGarage: {
      title: "No Garage Yet",
      description: (canCreate: boolean) => 
        canCreate 
          ? "You haven't created a garage yet. Get started now!"
          : "Complete payment to create your garage.",
    },
    noServices: {
      title: "No Services Yet",
      description: "Add your first service to start receiving bookings.",
    },
    noBookings: {
      title: "No Bookings Yet",
      description: "When customers book your services, they'll appear here.",
    },
    noBookingsFound: {
      title: "No bookings found",
      description: "Try adjusting your filters or search terms",
    },
  },
};

// ============================================
// PAYMENT CONFIG
// ============================================

export const PAYMENT_CONFIG = {
  amount: PAYMENT_AMOUNT,
  currency: "ETB",
  checkInterval: 5000, // 5 seconds
  statuses: {
    completed: ["completed", "successful"],
    failed: ["failed", "expired"],
  },
};

// ============================================
// DASHBOARD STATS
// ============================================

export const getDashboardStats = (garage: any) => [
  {
    title: "Total Bookings",
    value: garage?.stats?.totalBookings || 0,
    icon: Calendar,
    color: "blue",
    trend: "12",
  },
  {
    title: "Completed",
    value: garage?.stats?.completedBookings || 0,
    icon: CheckSquare,
    color: "green",
  },
  {
    title: "Average Rating",
    value: garage?.stats?.averageRating?.toFixed(1) || "0.0",
    icon: Star,
    color: "yellow",
  },
  {
    title: "Total Reviews",
    value: garage?.stats?.totalReviews || 0,
    icon: Users,
    color: "purple",
  },
];

// ============================================
// BOOKING STATUS OPTIONS
// ============================================

export const getBookingStatusOptions = (currentStatus: BookingStatus) => {
  const options = [
    {
      status: BookingStatus.APPROVED,
      label: "Approve",
      icon: ThumbsUp,
      color: "green",
      description: "Confirm this booking",
      show: currentStatus === BookingStatus.PENDING,
    },
    {
      status: BookingStatus.REJECTED,
      label: "Reject",
      icon: ThumbsDown,
      color: "red",
      description: "Reject this booking",
      show: currentStatus === BookingStatus.PENDING,
      requiresReason: true,
    },
    {
      status: BookingStatus.IN_PROGRESS,
      label: "Start Service",
      icon: Play,
      color: "blue",
      description: "Mark service as started",
      show: currentStatus === BookingStatus.APPROVED,
    },
    {
      status: BookingStatus.COMPLETED,
      label: "Complete",
      icon: CheckCircle2,
      color: "emerald",
      description: "Mark service as completed",
      show: currentStatus === BookingStatus.IN_PROGRESS,
    },
    {
      status: BookingStatus.CANCELLED,
      label: "Cancel",
      icon: XCircle,
      color: "gray",
      description: "Cancel this booking",
      show: [
        BookingStatus.PENDING,
        BookingStatus.APPROVED,
        BookingStatus.IN_PROGRESS,
      ].includes(currentStatus),
      requiresReason: true,
    },
  ];

  return options.filter(option => option.show);
};