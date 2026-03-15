"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useBookingStore } from "@/lib/store/booking.store";
import { useGarageStore } from "@/lib/store/garage.store";
import { useServiceStore } from "@/lib/store/service.store";
import {
  CreateBookingRequest,
  CheckAvailabilityRequest,
  TimeSlot,
  VehicleInfo,
  BookingResponse,
  BookingStatus,
} from "@/lib/types/booking.types";
import { PopulatedGarage, GarageService, BusinessHours, NearbyGarage } from "@/lib/types/garage.types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  MapPin,
  Star,
  Clock,
  Wrench,
  Car,
  Calendar,
  DollarSign,
  Users,
  Phone,
  Navigation,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Mail,
  Shield,
  Award,
  ThumbsUp,
  BookOpen,
  Fuel,
  Gauge,
  Wind,
  Battery,
  Settings,
  ArrowLeft,
  Sparkles,
  Zap,
  Heart,
  Share2,
  Info,
  ExternalLink,
  Globe,
  Camera,
  ThumbsUp as ThumbsUpIcon,
  Check,
  AlertTriangle,
  Loader2,
  Droplets,
  Filter as FilterIcon,
  Eye,
  EyeOff,
  Home,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Copy,
  Download,
  Upload,
  RefreshCw,
  RotateCw,
  Trash2,
  Edit,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Move,
  ZoomIn,
  ZoomOut,
  Layers,
  Compass,
  Locate,
  LocateFixed,
  Route,
  Navigation2,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsDown,
  Circle,
  CircleDot,
  CircleDashed,
  CircleSlashed,
  Square,
  SquareDot,
  SquareSlashed,
  Triangle,
  TriangleAlert,
  Hexagon,
  Octagon,
  Pentagon,
  Diamond,
  Gem,
  BadgeCheck,
  BadgeInfo,
  BadgeAlert,
  BadgeX,
  BadgeDollarSign,
  BadgePercent,
  BadgePlus,
  BadgeMinus,
  History,
  Filter,
  SortAsc,
  SortDesc,
  Bookmark,
  BookmarkX,
  BookmarkCheck,
  Ban,
  CheckCheck,
  XCircle,
  Clock3,
  Clock4,
  Clock8,
  Clock12,
  AlarmClock,
  AlarmClockCheck,
  AlarmClockMinus,
  AlarmClockPlus,
  AlarmClockOff,
  Timer,
  TimerReset,
  TimerOff,
  Hourglass,
  HourglassIcon,
} from "lucide-react";

// Dynamically import Leaflet to avoid SSR issues
let L: any;
if (typeof window !== "undefined") {
  import("leaflet").then((leaflet) => {
    L = leaflet;
    import("leaflet/dist/leaflet.css");

    // Fix Leaflet icon issues in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  });
}

// ==========================================
// CUSTOM ANIMATIONS CSS
// ==========================================
const animationsStyles = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes pulse-glow {
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.8; filter: brightness(1.2); }
}
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-slide-in { animation: slide-in 0.3s ease-out; }
.animate-slide-up { animation: slide-up 0.4s ease-out; }
.animate-scale-in { animation: scale-in 0.3s ease-out; }
.animate-rotate { animation: rotate 1s linear infinite; }
`;

// ==========================================
// SUCCESS MODAL
// ==========================================
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    serviceName: string;
    garageName: string;
    date: string;
    time: string;
    price: number;
    bookingId?: string;
  };
}

const SuccessModal = ({ isOpen, onClose, bookingDetails }: SuccessModalProps) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{animationsStyles}</style>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform animate-scale-in relative overflow-hidden">
          {/* Success Gradient Header */}
          <div className="h-32 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center rotate-45 animate-float">
                <div className="transform -rotate-45">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Sparkles className="w-6 h-6 text-white/50 animate-pulse" />
            </div>
          </div>

          <div className="pt-16 p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h2>
            <p className="text-gray-500 mb-8">Your service has been successfully booked</p>

            {/* Booking Details Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-inner">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Service</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.serviceName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Garage</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.garageName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date & Time</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900 block">{bookingDetails.date}</span>
                    <span className="text-sm text-blue-600">{bookingDetails.time}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">${bookingDetails.price}</span>
                  </div>
                </div>
                {bookingDetails.bookingId && (
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Booking ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">
                        #{bookingDetails.bookingId.slice(-8)}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(bookingDetails.bookingId || "")}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/dashboard?tab=bookings";
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                View My Bookings
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ==========================================
// BOOKINGS LIST COMPONENT
// ==========================================
interface UserBookingsProps {
  bookings: BookingResponse[];
  loading?: boolean;
  onCancelBooking?: (bookingId: string) => void;
  onViewDetails?: (booking: BookingResponse) => void;
}

const UserBookings = ({ bookings, loading, onCancelBooking, onViewDetails }: UserBookingsProps) => {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <Clock3 className="w-4 h-4 text-yellow-500" />;
      case BookingStatus.APPROVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case BookingStatus.IN_PROGRESS:
        return <Timer className="w-4 h-4 text-blue-500" />;
      case BookingStatus.COMPLETED:
        return <CheckCheck className="w-4 h-4 text-green-600" />;
      case BookingStatus.CANCELLED:
        return <Ban className="w-4 h-4 text-red-500" />;
      case BookingStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case BookingStatus.APPROVED:
        return "bg-green-100 text-green-700 border-green-200";
      case BookingStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case BookingStatus.COMPLETED:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case BookingStatus.CANCELLED:
        return "bg-red-100 text-red-700 border-red-200";
      case BookingStatus.REJECTED:
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredBookings = useMemo(() => {
    let filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

    return filtered.sort((a, b) => {
      const dateA = new Date(a.bookingDate).getTime();
      const dateB = new Date(b.bookingDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [bookings, filter, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
      approved: bookings.filter((b) => b.status === BookingStatus.APPROVED).length,
      inProgress: bookings.filter((b) => b.status === BookingStatus.IN_PROGRESS).length,
      completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
      cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length,
      rejected: bookings.filter((b) => b.status === BookingStatus.REJECTED).length,
    };
  }, [bookings]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved + stats.inProgress}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter(BookingStatus.PENDING)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === BookingStatus.PENDING
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter(BookingStatus.APPROVED)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === BookingStatus.APPROVED
                  ? "bg-green-500 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setFilter(BookingStatus.IN_PROGRESS)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === BookingStatus.IN_PROGRESS
                  ? "bg-blue-500 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilter(BookingStatus.COMPLETED)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === BookingStatus.COMPLETED
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>
          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
          >
            {sortOrder === "desc" ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookmarkX className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No bookings found</h3>
          <p className="text-gray-500">You haven't made any bookings yet</p>
          <button
            onClick={() => (window.location.href = "/dashboard?tab=browse")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Garages
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.service.name}</h4>
                      <p className="text-sm text-gray-600">{booking.garage.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {booking.timeSlot.start} - {booking.timeSlot.end}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-green-600">${booking.service.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(booking.status)}
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    {booking.vehicleInfo && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Car className="w-3 h-3" />
                        <span>
                          {booking.vehicleInfo.make} {booking.vehicleInfo.model} ({booking.vehicleInfo.licensePlate})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetails?.(booking)}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Details
                  </button>
                  {booking.status === BookingStatus.PENDING && (
                    <button
                      onClick={() => onCancelBooking?.(booking._id)}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



// ==========================================
// MAP COMPONENT (Leaflet + OpenStreetMap)
// ==========================================
interface GarageMapProps {
  garages: PopulatedGarage[] | NearbyGarage[];
  userLocation: { lat: number; lng: number } | null;
  onGarageSelect?: (garage: PopulatedGarage | NearbyGarage) => void;
  onLocationError?: (error: string) => void;
  onLocationFound?: (location: { lat: number; lng: number }) => void;
}

const GarageMap = ({ garages, userLocation, onGarageSelect, onLocationError, onLocationFound }: GarageMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [validGarages, setValidGarages] = useState<Array<PopulatedGarage | NearbyGarage>>([]);
  const [isClient, setIsClient] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Debug: Component mount - THIS RUNS IMMEDIATELY
  useEffect(() => {
    console.log("🗺️ [GarageMap] Component mounted - setting isClient to true");
    setIsClient(true);
  }, []); // Empty dependency array - runs once on mount

  // Check if Leaflet is loaded
  useEffect(() => {
    if (isClient) {
      const checkLeaflet = () => {
        if (L) {
          console.log("🗺️ [GarageMap] Leaflet L object:", "✅ Loaded");
          console.log("🗺️ [GarageMap] Leaflet version:", L.version);
          setLeafletLoaded(true);
        } else {
          console.log("🗺️ [GarageMap] Leaflet not loaded yet, checking again in 100ms");
          setTimeout(checkLeaflet, 100);
        }
      };
      checkLeaflet();
    }
  }, [isClient]);

  const getGarageLatLng = (garage: PopulatedGarage | NearbyGarage): { lat: number; lng: number } | null => {
    if (!garage.coordinates?.coordinates || garage.coordinates.coordinates.length !== 2) {
      console.log("🗺️ [GarageMap] Garage missing coordinates:", garage._id, garage.name);
      return null;
    }

    // IMPORTANT: Database stores [longitude, latitude]
    const [lng, lat] = garage.coordinates.coordinates;

    console.log("🗺️ [GarageMap] Raw coordinates for", garage.name, ":", { lng, lat });

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      console.log("🗺️ [GarageMap] Invalid coordinates (NaN):", garage.name, { lat, lng });
      return null;
    }

    if (lat < -90 || lat > 90) {
      console.log("🗺️ [GarageMap] Invalid latitude range:", garage.name, lat);
      return null;
    }

    if (lng < -180 || lng > 180) {
      console.log("🗺️ [GarageMap] Invalid longitude range:", garage.name, lng);
      return null;
    }

    return { lat, lng };
  };

  // Debug: Filter garages with valid coordinates
  useEffect(() => {
    if (!isClient) return;
    
    console.log("🗺️ [GarageMap] Filtering garages. Total received:", garages?.length);
    console.log("🗺️ [GarageMap] Garage data sample:", garages[0]
      ? {
          id: garages[0]._id,
          name: garages[0].name,
          hasCoordinates: !!garages[0].coordinates,
          coordinates: garages[0].coordinates?.coordinates,
        }
      : "No garages");

    const valid = garages.filter((garage) => {
      const location = getGarageLatLng(garage);
      return location !== null;
    });

    console.log("🗺️ [GarageMap] Valid garages with coordinates:", valid.length);
    console.log("🗺️ [GarageMap] Invalid garages:", garages.length - valid.length);

    if (valid.length > 0) {
      console.log("🗺️ [GarageMap] First valid garage:", {
        id: valid[0]._id,
        name: valid[0].name,
        location: getGarageLatLng(valid[0]),
      });
    }

    setValidGarages(valid);
  }, [garages, isClient]);

  // Debug: Check container dimensions
  useEffect(() => {
    if (!isClient) return;
    
    if (mapContainer.current) {
      console.log("🗺️ [GarageMap] Container dimensions:", {
        height: mapContainer.current.clientHeight,
        width: mapContainer.current.clientWidth,
        offsetHeight: mapContainer.current.offsetHeight,
        offsetWidth: mapContainer.current.offsetWidth,
        exists: !!mapContainer.current,
      });
    }
  }, [mapContainer.current, mapLoading, isClient]);

  // Initialize map when L is available and we have a user location
  useEffect(() => {
    if (!isClient || !leafletLoaded) {
      console.log("🗺️ [GarageMap] Waiting for client and Leaflet:", { isClient, leafletLoaded });
      return;
    }

    console.log("🗺️ [GarageMap] Map initialization check:", {
      isClient,
      hasContainer: !!mapContainer.current,
      hasLeaflet: !!L,
      hasUserLocation: !!userLocation,
      leafletLoaded,
      retryCount,
    });

    if (!mapContainer.current || !L || !userLocation) {
      if (!userLocation) {
        console.log("🗺️ [GarageMap] Waiting for user location...");
        setMapLoading(false);
      }
      return;
    }

    console.log("🗺️ [GarageMap] Starting map initialization with location:", userLocation);

    const initMap = () => {
      try {
        console.log("🗺️ [GarageMap] initMap started");
        setMapLoading(true);
        setMapError(null);

        // Check if map already exists
        if (map.current) {
          console.log("🗺️ [GarageMap] Removing existing map");
          map.current.remove();
        }

        // Clear existing markers
        if (markers.current) {
          console.log("🗺️ [GarageMap] Clearing", markers.current.length, "existing markers");
          markers.current.forEach((marker) => marker.remove());
          markers.current = [];
        }

        // Initialize map with user location
        console.log("🗺️ [GarageMap] Creating new map with center:", [userLocation.lat, userLocation.lng]);
        map.current = L.map(mapContainer.current).setView([userLocation.lat, userLocation.lng], 13);

        // Add OpenStreetMap tiles
        console.log("🗺️ [GarageMap] Adding tile layer");
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current);

        // Add scale control
        L.control.scale({ imperial: false, metric: true }).addTo(map.current);
        console.log("🗺️ [GarageMap] Scale control added");

        // Custom marker icons
        console.log("🗺️ [GarageMap] Creating marker icons");
        const userIcon = L.divIcon({
          html: `<div class="relative">
            <div class="w-6 h-6 bg-blue-600 rounded-full border-3 border-white shadow-xl animate-pulse"></div>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>`,
          className: "custom-marker",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const garageIcon = L.divIcon({
          html: `<div class="relative group">
            <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
            </div>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>`,
          className: "custom-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // Add user location marker
        console.log("🗺️ [GarageMap] Adding user marker at:", userLocation);
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map.current)
          .bindPopup(`
            <div class="p-3">
              <strong class="text-base block">You are here</strong>
              <p class="text-xs text-gray-600 mt-1">Current location</p>
              <p class="text-xs text-gray-400 mt-1">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(
            4
          )}</p>
            </div>
          `);

        // Add garage markers using the helper function
        const bounds = L.latLngBounds([[userLocation.lat, userLocation.lng]]);
        let hasValidGarages = false;
        let markersAdded = 0;

        console.log("🗺️ [GarageMap] Adding", validGarages.length, "garage markers");

        validGarages.forEach((garage, index) => {
          const location = getGarageLatLng(garage);
          if (location) {
            const { lat, lng } = location;
            console.log(`🗺️ [GarageMap] Adding marker ${index + 1} for`, garage.name, "at:", { lat, lng });

            const marker = L.marker([lat, lng], { icon: garageIcon })
              .addTo(map.current)
              .bindPopup(`
                <div class="p-3 min-w-[220px]">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                    </div>
                    <div>
                      <strong class="text-base block">${garage.name}</strong>
                      <div class="flex items-center gap-1">
                        <span class="text-yellow-500">⭐</span>
                        <span class="text-xs font-medium">${garage.stats?.averageRating?.toFixed(1) || "0.0"}</span>
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 mb-2">${garage.address?.street || ""}, ${garage.address?.city || ""}</p>
                  <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" x2="12" y1="14" y2="14"/></svg>
                    <span>${garage.contactInfo?.phone || "N/A"}</span>
                  </div>
                  ${garage.distance
                  ? `
                    <div class="text-xs text-blue-600 mb-2">
                      📍 ${garage.distance.value} ${garage.distance.unit} away
                    </div>
                  `
                  : ""
                }
                  <div class="text-xs text-gray-400 mb-2">
                    📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}
                  </div>
                  <button 
                    onclick="window.selectGarage('${garage._id}')"
                    class="w-full bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              `);

            if (onGarageSelect) {
              marker.on("click", () => {
                console.log("🗺️ [GarageMap] Garage marker clicked:", garage.name);
                onGarageSelect(garage);
              });
            }

            markers.current.push(marker);
            bounds.extend([lat, lng]);
            hasValidGarages = true;
            markersAdded++;
          }
        });

        console.log(`🗺️ [GarageMap] Successfully added ${markersAdded} garage markers`);

        // Fit map to show all markers if there are valid garages
        if (hasValidGarages) {
          console.log("🗺️ [GarageMap] Fitting bounds to show all markers");
          map.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
          // If no valid garages, just center on user location with reasonable zoom
          console.log("🗺️ [GarageMap] No valid garages, centering on user location");
          map.current.setView([userLocation.lat, userLocation.lng], 12);
        }

        setMapInitialized(true);
        setMapLoading(false);
        console.log("🗺️ [GarageMap] Map initialization complete ✅");

        // Notify parent that map is ready
        if (onLocationFound) {
          console.log("🗺️ [GarageMap] Notifying parent of location found");
          onLocationFound(userLocation);
        }
      } catch (error) {
        console.error("🗺️ [GarageMap] Error initializing map:", error);
        setMapError("Failed to load map. Please try again.");
        setMapLoading(false);

        if (onLocationError) {
          onLocationError("Failed to initialize map");
        }
      }
    };

    // Small delay to ensure DOM is ready
    console.log("🗺️ [GarageMap] Scheduling map initialization with 100ms delay");
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      console.log("🗺️ [GarageMap] Cleanup: clearing timer and removing map");
      clearTimeout(timer);
      if (markers.current) {
        console.log("🗺️ [GarageMap] Removing", markers.current.length, "markers");
        markers.current.forEach((marker) => marker.remove());
        markers.current = [];
      }
      if (map.current) {
        console.log("🗺️ [GarageMap] Removing map instance");
        map.current.remove();
        map.current = null;
      }
      setMapInitialized(false);
    };
  }, [validGarages, userLocation, onGarageSelect, onLocationError, onLocationFound, isClient, leafletLoaded, retryCount]);

  // Add global function for popup buttons
  useEffect(() => {
    if (!isClient) return;
    
    console.log("🗺️ [GarageMap] Setting up global selectGarage function");
    (window as any).selectGarage = (garageId: string) => {
      console.log("🗺️ [GarageMap] Global selectGarage called with ID:", garageId);
      const garage = garages.find((g) => g._id === garageId);
      if (garage && onGarageSelect) {
        console.log("🗺️ [GarageMap] Global selectGarage found garage:", garage.name);
        onGarageSelect(garage);
      } else {
        console.log("🗺️ [GarageMap] Global selectGarage: garage not found or no handler");
      }
    };

    return () => {
      console.log("🗺️ [GarageMap] Cleaning up global selectGarage function");
      delete (window as any).selectGarage;
    };
  }, [garages, onGarageSelect, isClient]);

  // Debug: Log render conditions
  console.log("🗺️ [GarageMap] Rendering with state:", {
    isClient,
    leafletLoaded,
    userLocation,
    mapLoading,
    mapError,
    validGaragesCount: validGarages.length,
    totalGaragesCount: garages.length,
  });

  // Show loading while waiting for client
  if (!isClient) {
    console.log("🗺️ [GarageMap] Showing loading - waiting for client");
    return (
      <div className="h-full min-h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="h-full min-h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Required</h3>
          <p className="text-gray-500 mb-4">Please enable location services to see nearby garages on map</p>
          <button
            onClick={() => {
              console.log("🗺️ [GarageMap] Enable Location button clicked");
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("🗺️ [GarageMap] Geolocation success:", { latitude, longitude });
                    if (onLocationFound) {
                      onLocationFound({ lat: latitude, lng: longitude });
                    }
                  },
                  (error) => {
                    console.error("🗺️ [GarageMap] Geolocation error:", error);
                    if (onLocationError) {
                      onLocationError("Failed to get your location. Please enable location services.");
                    }
                  }
                );
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Enable Location
          </button>
        </div>
      </div>
    );
  }

  if (mapLoading) {
    return (
      <div className="h-full min-h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-full min-h-[500px] bg-red-50 rounded-2xl flex items-center justify-center border-2 border-red-200">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Map Error</h3>
          <p className="text-sm text-red-500 mb-4">{mapError}</p>
          <button
            onClick={() => {
              console.log("🗺️ [GarageMap] Retry button clicked");
              setRetryCount((prev) => prev + 1);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (validGarages.length === 0 && garages.length > 0) {
    return (
      <div className="h-full min-h-[500px] bg-yellow-50 rounded-2xl flex items-center justify-center border-2 border-yellow-200">
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">No Location Data</h3>
          <p className="text-sm text-yellow-600 mb-4">
            {garages.length} garages found but none have valid location coordinates
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => {
            console.log("🗺️ [GarageMap] Center on my location clicked");
            if (map.current && userLocation) {
              map.current.setView([userLocation.lat, userLocation.lng], 15);
            }
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Center on my location"
        >
          <LocateFixed className="w-5 h-5 text-blue-600" />
        </button>
        <button
          onClick={() => {
            console.log("🗺️ [GarageMap] Zoom in clicked");
            if (map.current) {
              map.current.zoomIn();
            }
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => {
            console.log("🗺️ [GarageMap] Zoom out clicked");
            if (map.current) {
              map.current.zoomOut();
            }
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Garage Count */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-medium text-gray-700">
          {validGarages.length} {validGarages.length === 1 ? "garage" : "garages"} on map
        </span>
      </div>
    </div>
  );
};

// ==========================================
// SERVICE DETAILS MODAL
// ==========================================
interface ServiceDetailsModalProps {
  service: GarageService;
  garage: PopulatedGarage;
  onClose: () => void;
  onBookNow: (service: GarageService) => void;
}

const ServiceDetailsModal = ({ service, garage, onClose, onBookNow }: ServiceDetailsModalProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const images = service.images?.length
    ? service.images
    : [
        "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1530046339160-ce3e530f7d2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1557400203-2c1f1e3d0b5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      ];

  const getServiceFeatures = (category: string) => {
    const features: Record<string, Array<{ icon: any; text: string; description: string }>> = {
      "Oil Change": [
        {
          icon: Droplets,
          text: "Synthetic Oil",
          description: "High-quality synthetic oil for better engine performance",
        },
        { icon: FilterIcon, text: "Oil Filter", description: "Premium oil filter replacement included" },
        { icon: Gauge, text: "Multi-point Inspection", description: "Comprehensive 20-point vehicle inspection" },
        { icon: Wind, text: "Fluid Top-up", description: "All essential fluids checked and topped up" },
      ],
      "Brake Service": [
        { icon: Wrench, text: "Brake Pad Replacement", description: "High-quality ceramic brake pads" },
        { icon: Settings, text: "Rotor Inspection", description: "Complete rotor condition assessment" },
        { icon: Droplets, text: "Brake Fluid Check", description: "Brake fluid level and quality check" },
        { icon: Shield, text: "Caliper Service", description: "Brake caliper cleaning and lubrication" },
      ],
      "Tire Service": [
        { icon: RotateCw, text: "Tire Rotation", description: "Even wear distribution for longer tire life" },
        { icon: Gauge, text: "Wheel Balance", description: "Precision wheel balancing" },
        { icon: Wind, text: "Pressure Check", description: "TPMS check and pressure adjustment" },
        { icon: Settings, text: "Alignment Check", description: "Wheel alignment inspection" },
      ],
      "Engine Diagnostic": [
        { icon: Gauge, text: "Computer Scan", description: "Full OBD-II diagnostic scan" },
        { icon: Settings, text: "System Analysis", description: "Complete engine system analysis" },
        { icon: AlertCircle, text: "Error Code Reading", description: "Read and clear error codes" },
        { icon: Gauge, text: "Performance Test", description: "Engine performance testing" },
      ],
      "AC Service": [
        { icon: Wind, text: "AC Inspection", description: "Complete AC system inspection" },
        { icon: Droplets, text: "Refrigerant Refill", description: "AC refrigerant recharge" },
        { icon: AlertCircle, text: "Leak Test", description: "Pressure test for leaks" },
        { icon: Wind, text: "Performance Check", description: "Cooling performance verification" },
      ],
      "Battery Service": [
        { icon: Battery, text: "Battery Test", description: "Battery health and charge test" },
        { icon: Settings, text: "Terminal Cleaning", description: "Battery terminal cleaning" },
        { icon: Gauge, text: "Charging System Check", description: "Alternator and charging test" },
        { icon: Battery, text: "Replacement", description: "Battery replacement if needed" },
      ],
      default: [
        {
          icon: Shield,
          text: "Professional Service",
          description: "Certified technicians with years of experience",
        },
        { icon: Award, text: "Quality Guarantee", description: "12-month warranty on all services" },
        { icon: Users, text: "Expert Technicians", description: "Specialized in your vehicle make" },
        { icon: Clock, text: "Timely Service", description: "On-time completion guaranteed" },
      ],
    };
    return features[category] || features.default;
  };

  const features = getServiceFeatures(service.category);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Image Gallery */}
        <div className="relative h-72 bg-gray-900 group">
          <img src={images[activeImage] as string} alt={service.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Navigation Buttons */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="absolute top-4 right-4 flex gap-2">
            <button className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all">
              <Heart className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                    {service.category}
                  </span>
                  <span className="bg-green-600/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                    {service.duration} min
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-1">{service.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{garage.stats?.averageRating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{garage.address?.city || "Unknown"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Starting from</p>
                <p className="text-4xl font-bold">${service.price}</p>
              </div>
            </div>
          </div>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`transition-all ${
                      idx === activeImage ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"
                    } rounded-full`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-18rem)] scrollbar-thin scrollbar-thumb-gray-300">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center transform hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-bold text-blue-700">{service.duration} min</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center transform hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-sm font-bold text-green-700">${service.price}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center transform hover:scale-105 transition-transform">
              <Star className="w-5 h-5 text-purple-600 mx-auto mb-1 fill-current" />
              <p className="text-xs text-gray-500">Rating</p>
              <p className="text-sm font-bold text-purple-700">{garage.stats?.averageRating?.toFixed(1) || "0.0"}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center transform hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Bookings</p>
              <p className="text-sm font-bold text-amber-700">{garage.stats?.totalBookings || 0}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-between">
              <span>Description</span>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </button>
            </h3>
            <p className={`text-gray-600 text-sm leading-relaxed ${!showFullDescription && "line-clamp-3"}`}>
              {service.description}
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="flex items-start gap-3 text-sm bg-gray-50 p-3 rounded-xl hover:bg-blue-50 transition-colors cursor-help">
                    <feature.icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">{feature.text}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {feature.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Garage Info */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Service Location</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 hover:bg-white rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{garage.name}</p>
                  <p className="text-xs text-gray-500">
                    {garage.address?.street || ""}, {garage.address?.city || ""}, {garage.address?.state || ""}{" "}
                    {garage.address?.zipCode || ""}
                  </p>
                  {garage.coordinates?.coordinates && (
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {garage.coordinates.coordinates[1].toFixed(4)}, {garage.coordinates.coordinates[0].toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <a
                  href={`tel:${garage.contactInfo?.phone}`}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {garage.contactInfo?.phone || "N/A"}
                </a>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <a
                  href={`mailto:${garage.contactInfo?.email}`}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {garage.contactInfo?.email || "N/A"}
                </a>
              </div>
            </div>
          </div>

          {/* Book Button */}
          <button
            onClick={() => {
              onClose();
              onBookNow(service);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            <Calendar className="w-5 h-5 group-hover:animate-pulse" />
            Book This Service
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// GARAGE DETAILS MODAL
// ==========================================
interface GarageDetailsModalProps {
  garage: PopulatedGarage;
  services: GarageService[];
  onClose: () => void;
  onServiceSelect: (service: GarageService) => void;
  onBookService: (service: GarageService) => void;
  loading?: boolean;
}

const GarageDetailsModal = ({
  garage,
  services,
  onClose,
  onServiceSelect,
  onBookService,
  loading,
}: GarageDetailsModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<GarageService | null>(null);
  const [activeTab, setActiveTab] = useState<"services" | "info" | "reviews" | "map">("services");
  const [showAllReviews, setShowAllReviews] = useState(false);

  const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category))), [services]);

  const filteredServices = useMemo(
    () => (selectedCategory === "all" ? services : services.filter((s) => s.category === selectedCategory)),
    [services, selectedCategory]
  );

  const isOpenNow = useCallback(() => {
    const now = new Date();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

    const businessDay = garage.businessHours?.[currentDay as keyof BusinessHours];
    if (!businessDay || businessDay.closed) return false;

    return currentTime >= businessDay.open && currentTime <= businessDay.close;
  }, [garage.businessHours]);

  const openStatus = isOpenNow();

  // Mock reviews with more data
  const reviews = [
    {
      id: 1,
      user: "John D.",
      avatar: "JD",
      rating: 5,
      comment:
        "Excellent service! Very professional team. They fixed my car quickly and at a fair price. Will definitely come back.",
      date: "2 days ago",
      helpful: 12,
    },
    {
      id: 2,
      user: "Sarah M.",
      avatar: "SM",
      rating: 4,
      comment:
        "Good work, fair prices. The staff was friendly and explained everything clearly. Only minor delay in service.",
      date: "1 week ago",
      helpful: 8,
    },
    {
      id: 3,
      user: "Mike R.",
      avatar: "MR",
      rating: 5,
      comment:
        "Fast and reliable. Highly recommended! They went above and beyond to help me with my emergency repair.",
      date: "2 weeks ago",
      helpful: 15,
    },
    {
      id: 4,
      user: "Emily W.",
      avatar: "EW",
      rating: 5,
      comment: "Best garage in town! Transparent pricing and excellent customer service.",
      date: "3 weeks ago",
      helpful: 7,
    },
    {
      id: 5,
      user: "David L.",
      avatar: "DL",
      rating: 4,
      comment: "Very satisfied with the work. Would recommend to friends and family.",
      date: "1 month ago",
      helpful: 5,
    },
  ];

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Modal Header with Image */}
        <div className="relative h-56">
          {garage.images && garage.images.length > 0 ? (
            <img src={garage.images[0] as string} alt={garage.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="absolute top-4 right-4 flex gap-2">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur flex items-center gap-2 ${
                openStatus ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${openStatus ? "bg-white animate-pulse" : "bg-gray-300"}`}></span>
              {openStatus ? "Open Now" : "Closed"}
            </span>
            <button className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all">
              <Heart className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 text-white">
            <h2 className="text-3xl font-bold mb-2">{garage.name}</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {garage.address?.city || "Unknown"}, {garage.address?.state || ""}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {garage.stats?.averageRating?.toFixed(1) || "0.0"} ({garage.stats?.totalReviews || 0} reviews)
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {garage.contactInfo?.phone || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 bg-white">
          {(["services", "info", "reviews", "map"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-all relative ${
                activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {tab === "services" && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{services.length}</span>
              )}
              {tab === "reviews" && (
                <span className="ml-2 bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                  {garage.stats?.totalReviews || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-20rem)] scrollbar-thin scrollbar-thumb-gray-300">
          {activeTab === "services" && (
            <>
              {/* Category Filters */}
              {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Services
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Services Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading services...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No services available in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredServices.map((service) => (
                    <div
                      key={service._id}
                      onClick={() => {
                        onServiceSelect(service);
                        setSelectedService(service);
                      }}
                      className={`group border rounded-xl p-5 cursor-pointer transition-all hover:shadow-xl ${
                        selectedService?._id === service._id
                          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <span className="text-xs text-gray-500 mt-1 block">{service.category}</span>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                          ${service.price}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{service.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {service.duration} min
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookService(service);
                          }}
                          className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 group-hover:shadow-md"
                        >
                          Book Now
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Description */}
              {garage.description && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    About
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{garage.description}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <a href={`tel:${garage.contactInfo?.phone}`} className="text-sm text-gray-600 hover:text-blue-600">
                      {garage.contactInfo?.phone || "N/A"}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <a href={`mailto:${garage.contactInfo?.email}`} className="text-sm text-gray-600 hover:text-blue-600">
                      {garage.contactInfo?.email || "N/A"}
                    </a>
                  </div>
                  {garage.contactInfo?.website && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Globe className="w-5 h-5 text-green-600" />
                      <a
                        href={garage.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Address & Location
                </h3>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {garage.address?.street || ""}
                        <br />
                        {garage.address?.city || ""}, {garage.address?.state || ""} {garage.address?.zipCode || ""}
                        <br />
                        {garage.address?.country || ""}
                      </p>
                      {garage.coordinates?.coordinates && (
                        <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                          <p>
                            📍 {garage.coordinates.coordinates[1].toFixed(6)},{" "}
                            {garage.coordinates.coordinates[0].toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              {garage.businessHours && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Business Hours
                  </h3>
                  <div className="bg-white rounded-lg p-4">
                    <div className="space-y-2">
                      {Object.entries(garage.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                          <span className="text-gray-600 capitalize font-medium">{day}</span>
                          {hours.closed ? (
                            <span className="text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full">Closed</span>
                          ) : (
                            <span className="text-gray-900 bg-gray-50 px-3 py-1 rounded-full">
                              {hours.open} - {hours.close}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              {/* Rating Summary */}
              <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-xl p-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">
                      {garage.stats?.averageRating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(garage.stats?.averageRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{garage.stats?.totalReviews || 0} total reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-8">{rating} star</span>
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{Math.floor(Math.random() * 50)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {displayedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.user}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{review.comment}</p>
                    <div className="flex items-center gap-4">
                      <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                        <ThumbsUpIcon className="w-3 h-3" />
                        Helpful ({review.helpful})
                      </button>
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Reply</button>
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Report</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
                >
                  {showAllReviews ? "Show less" : `Show all ${reviews.length} reviews`}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAllReviews ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          )}

          {activeTab === "map" && (
            <div className="h-[400px] rounded-xl overflow-hidden">
              <GarageMap
                garages={[garage]}
                userLocation={
                  garage.coordinates?.coordinates
                    ? {
                        lat: garage.coordinates.coordinates[1],
                        lng: garage.coordinates.coordinates[0],
                      }
                    : null
                }
                onGarageSelect={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// GARAGE CARD COMPONENT
// ==========================================
interface GarageCardProps {
  garage: PopulatedGarage;
  onClick: () => void;
}

const GarageCard = ({ garage, onClick }: GarageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOpenNow = useCallback(() => {
    const now = new Date();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

    const businessDay = garage.businessHours?.[currentDay as keyof BusinessHours];
    if (!businessDay || businessDay.closed) return false;

    return currentTime >= businessDay.open && currentTime <= businessDay.close;
  }, [garage.businessHours]);

  const openStatus = isOpenNow();

  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-purple-500 to-pink-600",
    "from-amber-500 to-yellow-600",
    "from-rose-500 to-pink-600",
  ];

  const gradientIndex =
    (garage._id?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length) || 0;
  const gradient = gradients[gradientIndex];

  const garageImage = !imageError && garage.images && garage.images.length > 0 ? garage.images[0] : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-transparent transform hover:-translate-y-2"
    >
      {/* Card Header */}
      <div
        className={`h-44 bg-gradient-to-r ${gradient} p-5 relative overflow-hidden`}
        style={
          garageImage
            ? {
                backgroundImage: `url(${garageImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {garageImage && <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>}

        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur flex items-center gap-1 ${
              openStatus ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${openStatus ? "bg-white animate-pulse" : "bg-gray-300"}`}
            ></span>
            {openStatus ? "Open" : "Closed"}
          </span>
          {garage.distance && (
            <span className="bg-white/20 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {garage.distance.value.toFixed(1)}km
            </span>
          )}
        </div>

        {!garageImage && (
          <>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-100"></div>
          </>
        )}

        <h3 className="text-xl font-bold text-white relative z-10 line-clamp-1">{garage.name}</h3>
        <div className="flex items-center gap-2 mt-1 relative z-10">
          <div className="flex items-center bg-black/20 backdrop-blur px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-xs font-medium ml-1">{garage.stats?.averageRating?.toFixed(1) || "0.0"}</span>
          </div>
          <span className="text-white/70 text-xs bg-black/20 backdrop-blur px-2 py-1 rounded-full">
            {garage.stats?.totalReviews || 0} reviews
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">
            {garage.address?.street || ""}, {garage.address?.city || ""}
          </p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <Calendar className="w-3 h-3" />
            {garage.stats?.totalBookings || 0} bookings
          </div>
          <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
            <Users className="w-3 h-3" />
            {garage.stats?.completedBookings || 0} done
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600">{garage.contactInfo?.phone || "N/A"}</span>
          </div>
          <button
            className={`text-sm font-medium text-blue-600 flex items-center gap-1 transition-all ${
              isHovered ? "translate-x-1" : ""
            }`}
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Location coordinates badge */}
        {garage.coordinates?.coordinates && (
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">
              📍 {garage.coordinates.coordinates[1].toFixed(4)}, {garage.coordinates.coordinates[0].toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// BOOKING MODAL COMPONENT
// ==========================================
interface BookingModalProps {
  service: GarageService;
  garage: PopulatedGarage;
  onClose: () => void;
  onConfirm: (data: CreateBookingRequest) => Promise<void>;
  onCheckAvailability: (data: CheckAvailabilityRequest) => Promise<any>;
  loading?: boolean;
  error?: string | null;
}

const BookingModal = ({
  service,
  garage,
  onClose,
  onConfirm,
  onCheckAvailability,
  loading,
  error,
}: BookingModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
  });
  const [notes, setNotes] = useState("");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const handleCheckAvailability = async () => {
    if (!bookingDate || !bookingTime) {
      setAvailabilityMessage("Please select date and time");
      return;
    }

    setCheckingAvailability(true);

    const [hours, minutes] = bookingTime.split(":");
    const endHour = parseInt(hours) + Math.ceil(service.duration / 60);
    const timeSlot: TimeSlot = {
      start: bookingTime,
      end: `${endHour.toString().padStart(2, "0")}:${minutes}`,
    };

    try {
      const result = await onCheckAvailability({
        garageId: garage._id,
        serviceId: service._id,
        date: bookingDate,
        timeSlot,
      });

      if (result?.available) {
        setAvailabilityMessage("✓ This time slot is available!");
        setTimeout(() => setStep(2), 1000);
      } else {
        setAvailabilityMessage(result?.message || "This time slot is not available. Please choose another time.");
      }
    } catch (err) {
      setAvailabilityMessage("Error checking availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async () => {
    const [hours, minutes] = bookingTime.split(":");
    const endHour = parseInt(hours) + Math.ceil(service.duration / 60);
    const timeSlot: TimeSlot = {
      start: bookingTime,
      end: `${endHour.toString().padStart(2, "0")}:${minutes}`,
    };

    await onConfirm({
      garageId: garage._id,
      serviceId: service._id,
      bookingDate,
      timeSlot,
      vehicleInfo,
      notes: notes || undefined,
    });

    setStep(3);
  };

  const steps = [
    { number: 1, title: "Select Time", icon: Clock },
    { number: 2, title: "Vehicle Details", icon: Car },
    { number: 3, title: "Confirm", icon: CheckCircle },
  ];

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Book Service</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-blue-100 text-sm">{service.name}</p>
            <p className="text-blue-200 text-xs">{garage.name}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex-1 relative">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${step > s.number ? "bg-green-500" : "bg-gray-200"}`}
                  />
                )}
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      step > s.number
                        ? "bg-green-500 text-white"
                        : step === s.number
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <span className={`text-xs mt-2 ${step === s.number ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                    {s.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Step 1: Select Date & Time */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Service Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{garage.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">${service.price}</span>
                    <p className="text-xs text-gray-400">{service.duration} mins</p>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {allTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setBookingTime(time)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        bookingTime === time
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check Availability */}
              <button
                onClick={handleCheckAvailability}
                disabled={!bookingDate || !bookingTime || checkingAvailability}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {checkingAvailability ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Check Availability
                  </>
                )}
              </button>

              {availabilityMessage && !availabilityMessage.includes("✓") && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2 text-yellow-700 animate-slide-up">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{availabilityMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Vehicle Details */}
          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              {/* Selected Time Summary */}
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3 border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {new Date(bookingDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at {bookingTime}
                  </p>
                  <p className="text-xs text-green-600">Selected time slot</p>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Car className="w-4 h-4 inline mr-1" />
                  Vehicle Details
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Make (e.g., Toyota)"
                        value={vehicleInfo.make}
                        onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Model (e.g., Camry)"
                        value={vehicleInfo.model}
                        onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="Year"
                        value={vehicleInfo.year}
                        onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: parseInt(e.target.value) })}
                        min={1900}
                        max={new Date().getFullYear() + 1}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="License Plate"
                        value={vehicleInfo.licensePlate}
                        onChange={(e) => setVehicleInfo({ ...vehicleInfo, licensePlate: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea
                  placeholder="Any special requests or information for the garage..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.licensePlate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success (handled by Success Modal) */}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD PAGE
// ==========================================
export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Get tab from URL using router
  const [activeTab, setActiveTab] = useState<"all" | "nearby" | "map" | "bookings">("all");

  // Sync tab with URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "bookings") {
      setActiveTab("bookings");
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: "all" | "nearby" | "map" | "bookings") => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === "bookings") {
      params.set("tab", "bookings");
    } else {
      params.delete("tab");
    }

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;

    router.push(newUrl, { scroll: false });
  };

  // Stores
  const {
    garages,
    nearbyGarages,
    loading: garagesLoading,
    error: garagesError,
    fetchGarages,
    fetchNearbyGarages,
  } = useGarageStore();

  const { services, isLoading: servicesLoading, fetchServices } = useServiceStore();

  const {
    createBooking,
    checkAvailability,
    isLoading: bookingLoading,
    error: bookingError,
    // bookings: userBookings, // Commented out - user bookings
    // fetchUserBookings, // Commented out - fetch user bookings
    // cancelBooking, // Commented out - cancel booking
  } = useBookingStore();

  // Local state
  const [selectedGarage, setSelectedGarage] = useState<PopulatedGarage | null>(null);
  const [selectedService, setSelectedService] = useState<GarageService | null>(null);
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingDetails, setSuccessBookingDetails] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [mapKey, setMapKey] = useState(0); // Add key for forcing map remount

  // Get user location with better error handling
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchGarages();
    // fetchUserBookings(); // Commented out - Fetch user's bookings

    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationError(null);
          setLocationLoading(false);
          // Force map remount when location is available
          setMapKey((prev) => prev + 1);
        },
        (error) => {
          console.log("Location permission denied:", error);
          setLocationError("Please enable location to see nearby garages");
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
    }
  }, [isAuthenticated, router, fetchGarages]);

  // Watch for nearbyGarages changes to remount map
  useEffect(() => {
    if (activeTab === "map" && nearbyGarages.length > 0) {
      console.log("📍 Nearby garages updated, remounting map with", nearbyGarages.length, "garages");
      setMapKey((prev) => prev + 1);
    }
  }, [nearbyGarages, activeTab]);

  // Fetch nearby garages when map is clicked
  const handleMapClick = useCallback(() => {
    console.log("handleMapClick called");
    console.log("userLocation:", userLocation);
    console.log("searchRadius:", searchRadius);

    handleTabChange("map");

    if (userLocation) {
      console.log("Calling fetchNearbyGarages with:", userLocation.lat, userLocation.lng, searchRadius);
      // First fetch the garages, THEN remount the map
      fetchNearbyGarages(userLocation.lat, userLocation.lng, searchRadius)
        .then(() => {
          console.log("✅ Garages fetched successfully");
          // The useEffect watching nearbyGarages will handle remount
        })
        .catch((error) => {
          console.error("❌ Error fetching nearby garages:", error);
        });
    } else {
      console.log("No userLocation, requesting geolocation");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Geolocation received:", latitude, longitude);
            setUserLocation({ lat: latitude, lng: longitude });

            // Wait for state to update, then fetch
            setTimeout(() => {
              console.log("Calling fetchNearbyGarages with new location:", latitude, longitude, searchRadius);
              fetchNearbyGarages(latitude, longitude, searchRadius)
                .then(() => {
                  console.log("✅ Garages fetched with new location");
                  // The useEffect watching nearbyGarages will handle remount
                })
                .catch((error) => {
                  console.error("❌ Error fetching nearby garages:", error);
                });
            }, 200);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationError("Failed to get your location. Please enable location services.");
          }
        );
      }
    }
  }, [userLocation, searchRadius, fetchNearbyGarages]);

  const handleNearbyClick = useCallback(() => {
    console.log("handleNearbyClick called");
    console.log("userLocation:", userLocation);
    console.log("searchRadius:", searchRadius);

    if (userLocation) {
      handleTabChange("nearby");
      console.log("Calling fetchNearbyGarages with:", userLocation.lat, userLocation.lng, searchRadius);
      fetchNearbyGarages(userLocation.lat, userLocation.lng, searchRadius);
    } else {
      console.log("No userLocation, requesting geolocation");
      // If no location, try to get it again
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Geolocation received:", latitude, longitude);
            setUserLocation({ lat: latitude, lng: longitude });
            handleTabChange("nearby");

            // Small delay to ensure state is updated
            setTimeout(() => {
              console.log("Calling fetchNearbyGarages with new location:", latitude, longitude, searchRadius);
              fetchNearbyGarages(latitude, longitude, searchRadius);
            }, 100);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationError("Failed to get your location. Please enable location services.");
          }
        );
      }
    }
  }, [userLocation, searchRadius, fetchNearbyGarages]);

  const handleGarageClick = (garage: PopulatedGarage) => {
    setSelectedGarage(garage);
    setShowGarageModal(true);
    fetchServices({ garageId: garage._id, isAvailable: true });
  };

  const handleServiceSelect = (service: GarageService) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleBookFromServiceModal = (service: GarageService) => {
    setShowServiceModal(false);
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookFromGarageModal = (service: GarageService) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleCloseGarageModal = () => {
    setShowGarageModal(false);
    setSelectedGarage(null);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setSelectedService(null);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessBookingDetails(null);
  };

  const handleConfirmBooking = async (bookingData: CreateBookingRequest) => {
    if (!selectedGarage || !selectedService || !user) return;

    const result = await createBooking(bookingData);

    if (result) {
      setSuccessBookingDetails({
        serviceName: selectedService.name,
        garageName: selectedGarage.name,
        date: new Date(bookingData.bookingDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        time: bookingData.timeSlot.start,
        price: selectedService.price,
        bookingId: result._id || result.id,
      });

      setBookingSuccess(true);
      setShowBookingModal(false);
      setShowSuccessModal(true);
      // fetchUserBookings(); // Commented out - Refresh bookings list
    }
  };

  const handleCheckAvailability = async (data: CheckAvailabilityRequest) => {
    return await checkAvailability(data);
  };

  const handleLocationFound = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
    if (activeTab === "map") {
      fetchNearbyGarages(location.lat, location.lng, searchRadius);
    }
  };

  const handleLocationError = (error: string) => {
    setLocationError(error);
  };

  const filteredGarages = useMemo(() => {
    const source = activeTab === "all" ? garages : nearbyGarages;
    return source.filter(
      (garage) =>
        garage.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garage.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garage.address?.street?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, garages, nearbyGarages, searchTerm]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <>
      <style>{animationsStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center animate-float">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    GarageFinder
                  </h1>
                  <p className="text-xs text-gray-500">Find & book trusted garages</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {showMobileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-up z-50">
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Profile
                      </a>
                      <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Settings
                      </a>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          {activeTab !== "bookings" && (
            <div className="mb-10 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Find the perfect garage for your car</h2>
              <p className="text-gray-500 text-lg">
                Browse through <span className="font-semibold text-blue-600">{garages.length}+</span> trusted garages and
                book services instantly
              </p>
            </div>
          )}

          {/* Search Section (hide when viewing bookings) */}
          {activeTab !== "bookings" && (
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-8 border border-gray-100 animate-slide-up delay-100">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTabChange("all")}
                    className={`px-4 md:px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === "all"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Garages
                  </button>
                  <button
                    onClick={handleNearbyClick}
                    className={`px-4 md:px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === "nearby"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={!userLocation || locationLoading}
                  >
                    <Navigation className={`w-4 h-4 ${locationLoading ? "animate-spin" : ""}`} />
                    Nearby
                    {locationLoading && <span className="text-xs">(loading...)</span>}
                  </button>
                  <button
                    onClick={handleMapClick}
                    className={`px-4 md:px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === "map"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={locationLoading}
                  >
                    <MapPin className="w-4 h-4" />
                    Map View
                  </button>
                </div>

                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by garage name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>

                {activeTab === "nearby" && userLocation && (
                  <select
                    value={searchRadius}
                    onChange={(e) => {
                      setSearchRadius(Number(e.target.value));
                      fetchNearbyGarages(userLocation.lat, userLocation.lng, Number(e.target.value));
                    }}
                    className="px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                )}
              </div>

              {locationError && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700 animate-slide-up">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{locationError}</p>
                </div>
              )}

              {garagesError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-slide-up">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{garagesError}</p>
                </div>
              )}
            </div>
          )}

          {/* Map View - Using key to force remount when location changes */}
          {activeTab === "map" && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-gray-200 animate-scale-in">
              <div className="h-[500px]">
                <GarageMap
                  key={mapKey}
                  garages={nearbyGarages}
                  userLocation={userLocation}
                  onGarageSelect={handleGarageClick}
                  onLocationFound={handleLocationFound}
                  onLocationError={handleLocationError}
                />
              </div>
            </div>
          )}

          {/* Garages Grid */}
          {activeTab !== "map" && activeTab !== "bookings" && (
            <>
              {garagesLoading ? (
                <div className="text-center py-20 animate-fade-in">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-gray-500 animate-pulse">Loading amazing garages for you...</p>
                </div>
              ) : filteredGarages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 animate-scale-in">
                  <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No garages found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or location filter</p>
                  {activeTab === "nearby" && !userLocation && (
                    <button
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords;
                              setUserLocation({ lat: latitude, lng: longitude });
                              fetchNearbyGarages(latitude, longitude, searchRadius);
                            },
                            (error) => {
                              console.error("Error getting location:", error);
                            }
                          );
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Enable Location
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGarages.map((garage, index) => (
                    <div key={garage._id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <GarageCard garage={garage} onClick={() => handleGarageClick(garage)} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Modals */}
          {showGarageModal && selectedGarage && (
            <GarageDetailsModal
              garage={selectedGarage}
              services={services}
              onClose={handleCloseGarageModal}
              onServiceSelect={handleServiceSelect}
              onBookService={handleBookFromGarageModal}
              loading={servicesLoading}
            />
          )}

          {showServiceModal && selectedService && selectedGarage && (
            <ServiceDetailsModal
              service={selectedService}
              garage={selectedGarage}
              onClose={handleCloseServiceModal}
              onBookNow={handleBookFromServiceModal}
            />
          )}

          {showBookingModal && selectedService && selectedGarage && (
            <BookingModal
              service={selectedService}
              garage={selectedGarage}
              onClose={handleCloseBookingModal}
              onConfirm={handleConfirmBooking}
              onCheckAvailability={handleCheckAvailability}
              loading={bookingLoading}
              error={bookingError}
            />
          )}

          {showSuccessModal && successBookingDetails && (
            <SuccessModal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} bookingDetails={successBookingDetails} />
          )}

          {/* Floating Action Button */}
          {selectedGarage && !showGarageModal && activeTab !== "bookings" && (
            <button
              onClick={() => setShowGarageModal(true)}
              className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-200 transition-all transform hover:scale-110 hover:rotate-12 animate-float z-30 group"
            >
              <Wrench className="w-6 h-6 group-hover:animate-spin" />
            </button>
          )}
        </main>
      </div>
    </>
  );
}