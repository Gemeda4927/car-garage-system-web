// ===============================
// Location Types
// ===============================

export interface Coordinates {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// ===============================
// Contact
// ===============================

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
}

// ===============================
// Business Hours
// ===============================

export interface BusinessDay {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  monday: BusinessDay;
  tuesday: BusinessDay;
  wednesday: BusinessDay;
  thursday: BusinessDay;
  friday: BusinessDay;
  saturday: BusinessDay;
  sunday: BusinessDay;
}

// ===============================
// Garage Stats
// ===============================

export interface GarageStats {
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;

  // Optional fields from some endpoints
  upcomingBookings?: number;
  todayBookings?: number;
}

// ===============================
// User
// ===============================

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string;
}

// ===============================
// Deleted By User
// ===============================

export interface DeletedByUser {
  _id: string;
  name: string;
  email: string;
}

// ===============================
// Booking Types
// ===============================

export interface TimeSlot {
  start: string;
  end: string;
}

export interface BookingCarOwner {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export interface ServiceBooking {
  _id: string;
  carOwner: BookingCarOwner;
  service: string | GarageService;
  bookingDate: string;
  timeSlot: TimeSlot;
  status: "pending" | "approved" | "cancelled" | "completed" | "rejected";
  price?: {
    base: number;
    tax?: number;
    total: number;
  };
  isPaid?: boolean;
  payment?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===============================
// Garage Services
// ===============================

export interface GarageService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  images: unknown[];
  isAvailable: boolean;
  garage?: string | PopulatedGarage;
  bookings?: ServiceBooking[];
  createdAt?: string;
  updatedAt?: string;
}

// ===============================
// Review Response
// ===============================

export interface ReviewResponse {
  comment: string;
  respondedAt: string;
  respondedBy: UserSummary;
}

export interface GarageReview {
  _id: string;
  carOwner: UserSummary;
  garage: string | PopulatedGarage;
  booking: {
    _id: string;
    service: {
      name: string;
      price: number;
    };
    timeSlot: TimeSlot;
    bookingDate: string;
  };
  rating: number;
  comment: string;
  response?: ReviewResponse;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===============================
// Payment
// ===============================

export interface CreationPayment {
  _id: string;
  amount: number;
  status: string;
  transactionId: string;
  createdAt: string;
}

// ===============================
// Garage Main Model
// ===============================

export interface Garage {
  _id: string;
  name: string;
  description: string;

  coordinates: Coordinates;

  address: Address;

  contactInfo: ContactInfo;

  businessHours: BusinessHours;

  owner: UserSummary;

  creationPayment: string | CreationPayment;

  status: "pending" | "active" | "suspended" | "approved";

  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;

  paidAt: string;

  createdAt: string;
  updatedAt: string;

  stats: GarageStats;

  services: GarageService[];

  images: unknown[];
  documents: unknown[];

  verifiedAt?: string;
  verifiedBy?: string | UserSummary;
  verificationNotes?: string;

  reviews: GarageReview[];

  recentBookings?: ServiceBooking[];

  deletedAt?: string;
  deletedBy?: string | DeletedByUser;

  __v: number;
}

export type PopulatedGarage = Garage;

// ===============================
// Price Range
// ===============================

export interface PriceRange {
  _id: null;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

// ===============================
// Pagination
// ===============================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ===============================
// Deleted Garages Stats
// ===============================

export interface DeletedGaragesStats {
  totalGarages: number;
  totalServices: number;
  avgDeletionTime: number;
}

// ===============================
// Unverified Garages Stats
// ===============================

export interface UnverifiedGaragesStats {
  _id: string; // status
  count: number;
  avgWaitTime: number;
}

// ===============================
// Request Payloads
// ===============================

export interface CreateGaragePayload {
  name: string;
  description: string;

  coordinates: [number, number]; // backend expects array

  address: Address;

  contactInfo: ContactInfo;

  businessHours: BusinessHours;

  images?: unknown[];
  documents?: unknown[];
}

export interface UpdateGaragePayload {
  name?: string;
  description?: string;
  coordinates?: [number, number];
  address?: Partial<Address>;
  contactInfo?: Partial<ContactInfo>;
  businessHours?: Partial<BusinessHours>;
  images?: unknown[];
  documents?: unknown[];
}

export interface VerifyGaragePayload {
  status: "active" | "rejected";
  notes?: string;
}

export interface UploadFilesPayload {
  type: "images" | "documents";
  files: File[];
}

// ===============================
// Generic API Response
// ===============================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ===============================
// Garage List Response
// ===============================

export interface GaragesListData {
  garages: PopulatedGarage[];
  priceRange: PriceRange;
  pagination: Pagination;
}

export interface GarageSingleData {
  garage: PopulatedGarage;
}

export type GaragesListResponse = ApiResponse<GaragesListData>;
export type GarageSingleResponse = ApiResponse<GarageSingleData>;

// ===============================
// Deleted Garages Response
// ===============================

export interface DeletedGaragesData {
  garages: PopulatedGarage[];
  stats: DeletedGaragesStats;
  pagination: Pagination;
}

export type DeletedGaragesResponse = ApiResponse<DeletedGaragesData>;

// ===============================
// Unverified Garages Response
// ===============================

export interface UnverifiedGaragesData {
  garages: PopulatedGarage[];
  stats: UnverifiedGaragesStats[];
  pagination: Pagination;
}

export type UnverifiedGaragesResponse = ApiResponse<UnverifiedGaragesData>;

// ===============================
// Nearby Garages
// ===============================

export interface NearbyGarage {
  _id: string;
  name: string;

  coordinates: Coordinates;

  address: Address;

  contactInfo: ContactInfo;

  businessHours: BusinessHours;

  services: Pick<
    GarageService,
    "_id" | "name" | "price" | "duration" | "category"
  >[];

  images: unknown[];

  stats: GarageStats;

  reviews: unknown[];

  distance?: {
    value: number;
    unit: string;
  };

  isOpenNow?: boolean;
}

export interface NearbyGaragesData {
  count: number;
  radius: number;
  garages: NearbyGarage[];
}

export type NearbyGaragesResponse = ApiResponse<NearbyGaragesData>;

// ===============================
// Garage Services Response
// ===============================

export interface CategorySummary {
  _id: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export interface GarageServicesData {
  services: GarageService[];
  categorySummary: CategorySummary[];
  pagination: Pagination;
}

export type GarageServicesResponse = ApiResponse<GarageServicesData>;

// ===============================
// Garage Reviews Response
// ===============================

export interface RatingDistribution {
  _id: number;
  count: number;
}

export interface ReviewsSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution[];
  responseRate: number;
}

export interface GarageReviewsData {
  reviews: GarageReview[];
  summary: ReviewsSummary;
  pagination: Pagination;
}

export type GarageReviewsResponse = ApiResponse<GarageReviewsData>;

// ===============================
// Garage Bookings Response
// ===============================

export interface BookingStatusStats {
  _id: string;
  count: number;
  revenue: number;
}

export interface BookingServiceStats {
  serviceName: string;
  category: string;
  count: number;
  revenue: number;
}

export interface DailyBookingStats {
  _id: string;
  count: number;
  revenue: number;
}

export interface UpcomingBookingStats {
  total: number;
  estimatedRevenue: number;
}

export interface BookingsStats {
  byStatus: BookingStatusStats[];
  byService: BookingServiceStats[];
  dailyStats: DailyBookingStats[];
  upcomingStats: UpcomingBookingStats;
  totalRevenue: number;
  upcomingBookings: number;
  totalBookings: number;
}

export interface GarageBookingsData {
  bookings: ServiceBooking[];
  stats: BookingsStats;
  pagination: Pagination;
}

export type GarageBookingsResponse = ApiResponse<GarageBookingsData>;

// ===============================
// Garage Analytics Response
// ===============================

export interface RevenueData {
  _id: unknown;
  date: Date;
  total: number;
  count: number;
  avgValue: number;
}

export interface ServiceAnalytics {
  serviceName: string;
  category: string;
  price: number;
  count: number;
  revenue: number;
}

export interface StatusAnalytics {
  _id: string;
  count: number;
  revenue: number;
}

export interface PopularHour {
  _id: string;
  count: number;
}

export interface CustomerRetention {
  oneTime: number;
  returning: number;
  frequent: number;
  averageSpent: number;
}

export interface PeakDay {
  _id: number;
  count: number;
}

export interface AnalyticsData {
  revenue: RevenueData[];
  byService: ServiceAnalytics[];
  byStatus: StatusAnalytics[];
  popularHours: PopularHour[];
  customerRetention: CustomerRetention[];
  peakDays: PeakDay[];
}

export interface AnalyticsSummary {
  current: GarageAnalyticsSummary;
  previous: GarageAnalyticsSummary;
  growth: GarageAnalyticsGrowth;
}

export interface GarageAnalyticsData {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  analytics: AnalyticsData;
  summary: AnalyticsSummary;
}

export type GarageAnalyticsResponse = ApiResponse<GarageAnalyticsData>;

// ===============================
// Bookings Filter
// ===============================

export interface GarageBookingsParams {
  serviceId?: string;
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ===============================
// Nearby Query
// ===============================

export interface NearbyGaragesQuery {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}

// ===============================
// Analytics Types
// ===============================

export interface GarageAnalyticsSummary {
  totalRevenue: number;
  totalBookings: number;
  avgValue?: number;
}

export interface GarageAnalyticsGrowth {
  bookings: number;
  revenue: number;
  averageValue: number;
}

// ===============================
// Upload Files Response
// ===============================

export interface UploadFilesData {
  images?: string[];
  documents?: string[];
}

export type UploadFilesResponse = ApiResponse<UploadFilesData>;

// ===============================
// Delete File Response
// ===============================

export interface DeleteFileData {
  message: string;
}

export type DeleteFileResponse = ApiResponse<DeleteFileData>;

// ===============================
// Verify Garage Response
// ===============================

export interface VerifyGarageData {
  garage: {
    id: string;
    name: string;
    status: string;
    isVerified: boolean;
    isActive: boolean;
    verifiedAt: string;
  };
}

export type VerifyGarageResponse = ApiResponse<VerifyGarageData>;

// ===============================
// Toggle Active Response
// ===============================

export interface ToggleActiveData {
  isActive: boolean;
}

export type ToggleActiveResponse = ApiResponse<ToggleActiveData>;