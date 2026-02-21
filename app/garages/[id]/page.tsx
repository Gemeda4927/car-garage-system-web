"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";
import { useGarage } from "@/lib/hooks/useGarage";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { useBookingStore } from "@/lib/store/booking.store";
import {
  FiMapPin,
  FiUser,
  FiCalendar,
  FiStar,
  FiArrowLeft,
  FiX,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPhone,
  FiMail,
  FiTool,
  FiAward,
} from "react-icons/fi";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  BookingService,
  Booking,
} from "@/lib/types/booking.types";
import { api } from "@/lib/api/api";

// Custom hook to fetch services from garage bookings
function useServices(garageId: string | null) {
  const [services, setServices] = useState<
    BookingService[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchServices = async () => {
      if (!garageId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<{
          success: boolean;
          garage: {
            bookings: Array<{
              services: BookingService[];
            }>;
          };
        }>(`/garages/${garageId}`);

        if (response.success && response.garage) {
          const allServices =
            response.garage.bookings?.flatMap(
              (booking) => booking.services || []
            ) || [];

          const uniqueServices = Array.from(
            new Map(
              allServices.map((service) => [
                service._id,
                service,
              ])
            ).values()
          );

          setServices(uniqueServices);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error(
          "Failed to fetch services:",
          err
        );
        setError("Failed to load services");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [garageId]);

  return { services, loading, error };
}

// Booking Modal Component
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  garageId: string;
  garageName: string;
}

function BookingModal({
  isOpen,
  onClose,
  garageId,
  garageName,
}: BookingModalProps) {
  const { user } = useAuthStore();
  const {
    createBooking,
    loading: bookingLoading,
  } = useBookingStore();
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
  } = useServices(garageId);

  const [selectedDate, setSelectedDate] =
    useState("");
  const [selectedTime, setSelectedTime] =
    useState("");
  const [selectedServices, setSelectedServices] =
    useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] =
    useState(false);
  const [error, setError] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSelectedDate("");
        setSelectedTime("");
        setSelectedServices([]);
        setNotes("");
        setError("");
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen]); // Only depend on isOpen

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const selectedServicesData = services.filter(
    (s) => selectedServices.includes(s._id)
  );
  const totalPrice = selectedServicesData.reduce(
    (sum, s) => sum + s.price,
    0
  );

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please login to book");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError("Please select date and time");
      return;
    }

    if (selectedServices.length === 0) {
      setError(
        "Please select at least one service"
      );
      return;
    }

    // Combine date and time and convert to ISO
    const [year, month, day] =
      selectedDate.split("-");
    const [hour, minute] =
      selectedTime.split(":");
    const appointmentDate = new Date(
      Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      )
    ).toISOString();

    try {
      const booking = await createBooking({
        garage: garageId,
        services: selectedServicesData.map(
          (s) => ({
            name: s.name,
            price: s.price,
            duration: s.duration,
          })
        ),
        totalPrice,
        appointmentDate,
        notes: notes || undefined,
      });

      if (booking) {
        setBookingSuccess(true);
        setTimeout(() => {
          onClose();
          setBookingSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking"
      );
    }
  };

  // Generate time slots from 8 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      const hourStr = hour
        .toString()
        .padStart(2, "0");
      slots.push(`${hourStr}:00`);
      if (hour < 18) {
        slots.push(`${hourStr}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get today's date for min attribute
  const today = new Date()
    .toISOString()
    .split("T")[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 10000 }}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white">
              Book Your Service
            </h2>
            <p className="text-white/90 mt-1">
              {garageName}
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            {bookingSuccess ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600">
                  Your appointment has been
                  successfully booked.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Services Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Services
                  </label>

                  {servicesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                      <p className="text-gray-500">
                        Loading services...
                      </p>
                    </div>
                  ) : servicesError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">
                        {servicesError}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          window.location.reload()
                        }
                        className="mt-2 text-blue-600 hover:underline"
                      >
                        Retry
                      </button>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No services available for
                      this garage
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {services.map((service) => (
                        <label
                          key={service._id}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedServices.includes(
                              service._id
                            )
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(
                                service._id
                              )}
                              onChange={(e) => {
                                if (
                                  e.target.checked
                                ) {
                                  setSelectedServices(
                                    [
                                      ...selectedServices,
                                      service._id,
                                    ]
                                  );
                                } else {
                                  setSelectedServices(
                                    selectedServices.filter(
                                      (id) =>
                                        id !==
                                        service._id
                                    )
                                  );
                                }
                              }}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                              <p className="font-medium text-gray-800">
                                {service.name}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <FiClock className="w-3 h-3" />
                                {service.duration}{" "}
                                min
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-800">
                            {service.price} ETB
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      setSelectedDate(
                        e.target.value
                      )
                    }
                    min={today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) =>
                      setSelectedTime(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">
                      Choose a time
                    </option>
                    {timeSlots.map((time) => (
                      <option
                        key={time}
                        value={time}
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                    rows={3}
                    placeholder="Any special requests or information..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Price Summary */}
                {selectedServices.length > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                    <div className="space-y-2 mb-2">
                      {selectedServicesData.map(
                        (service) => (
                          <div
                            key={service._id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {service.name}
                            </span>
                            <span className="font-medium">
                              {service.price} ETB
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                        <span>Total:</span>
                        <span>
                          {totalPrice} ETB
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                    <FiAlertCircle />
                    <span className="text-sm">
                      {error}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      bookingLoading ||
                      servicesLoading
                    }
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading
                      ? "Booking..."
                      : "Confirm Booking"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GarageDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const currentUser = useAuthStore((s) => s.user);
  const [
    isBookingModalOpen,
    setIsBookingModalOpen,
  ] = useState(false);

  const { garage, loading, error, refetch } =
    useGarage(id || null);
  const [activeTab, setActiveTab] = useState<
    "info" | "bookings" | "reviews"
  >("bookings");

  if (!id)
    return (
      <div className="p-8 text-red-500">
        Invalid Garage ID
      </div>
    );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">
            Loading garage details...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg font-medium mb-4">
          {error}
        </p>
        <button
          onClick={refetch}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg"
        >
          Try Again
        </button>
      </div>
    );

  if (!garage)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">
          No garage found
        </p>
      </div>
    );

  // Helper function to get user ID from booking (handles both string and object)
  const getBookingUserId = (
    booking: Booking
  ): string | undefined => {
    if (typeof booking.user === "string") {
      return booking.user;
    }
    return booking.user?._id;
  };

  // Only current user's bookings
  const userBookings = garage.bookings?.filter(
    (booking) => {
      const bookingUserId =
        getBookingUserId(booking);
      return (
        bookingUserId === currentUser?.id &&
        booking.status !== "cancelled"
      );
    }
  );

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(
      dateString
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() =>
          setIsBookingModalOpen(false)
        }
        garageId={garage._id}
        garageName={garage.name}
      />

      {/* Back Button */}
      <button
        onClick={() => router.push("/garages")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors group"
      >
        <FiArrowLeft
          className="group-hover:-translate-x-1 transition-transform"
          size={20}
        />
        Back to Garages
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {garage.name}
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl leading-relaxed">
          {garage.description}
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
          {garage.isActive ? (
            <span className="px-3 py-1 bg-gradient-to-r from-green-200 to-green-300 text-green-800 font-semibold rounded-full text-sm flex items-center gap-1">
              <FiCheckCircle /> Open
            </span>
          ) : (
            <span className="px-3 py-1 bg-gradient-to-r from-red-200 to-red-300 text-red-800 font-semibold rounded-full text-sm flex items-center gap-1">
              Closed
            </span>
          )}

          {garage.isVerified && (
            <span className="px-3 py-1 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 font-semibold rounded-full text-sm flex items-center gap-1">
              <FiAward /> Verified
            </span>
          )}

          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 font-semibold rounded-full text-sm flex items-center gap-1">
            <FiStar className="text-yellow-600" />{" "}
            {garage.averageRating.toFixed(1)} (
            {garage.totalReviews} reviews)
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side - Map */}
        <div
          className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg relative"
          style={{ zIndex: 1 }}
        >
          {garage.location?.coordinates ? (
            <>
              <MapContainer
                center={[
                  garage.location.coordinates[1],
                  garage.location.coordinates[0],
                ]}
                zoom={15}
                scrollWheelZoom={true}
                className="h-full w-full rounded-2xl"
                style={{ zIndex: 1 }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />
                <Marker
                  position={[
                    garage.location
                      .coordinates[1],
                    garage.location
                      .coordinates[0],
                  ]}
                  icon={L.divIcon({
                    html: `<div class="w-8 h-8 rounded-full bg-red-600 border-3 border-white shadow-lg animate-bounce"></div>`,
                    className: "",
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  })}
                >
                  <Popup className="!p-4 !rounded-xl !shadow-lg">
                    <div className="flex flex-col gap-1 text-sm">
                      <strong className="text-gray-800 text-base">
                        {garage.name}
                      </strong>
                      <span className="text-gray-600">
                        {garage.formattedAddress}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                        ⭐{" "}
                        {garage.averageRating.toFixed(
                          1
                        )}{" "}
                        ({garage.totalReviews}{" "}
                        reviews)
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${garage.location.coordinates[1]},${garage.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-blue-600 font-medium hover:underline"
                      >
                        Get Directions
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-400">
              Location not available
            </div>
          )}
        </div>

        {/* Right Side - Tabs */}
        <div className="flex flex-col h-full">
          {/* Tab Buttons */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {["info", "bookings", "reviews"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(
                      tab as
                        | "info"
                        | "bookings"
                        | "reviews"
                    )
                  }
                  className={`px-5 py-2 text-sm font-semibold rounded-t-xl transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab === "info"
                    ? "Info"
                    : tab === "bookings"
                      ? "Bookings"
                      : "Reviews"}
                </button>
              )
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "info" && (
              <div className="space-y-4">
                {/* Address */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-600 mb-3">
                    <FiMapPin className="w-5 h-5 text-blue-500" />{" "}
                    Location
                  </h2>
                  <p className="text-gray-700 font-medium">
                    {garage.formattedAddress}
                  </p>
                  <p className="text-gray-600">
                    {garage.address?.street}
                  </p>
                  <p className="text-gray-600">
                    {garage.address?.city},{" "}
                    {garage.address?.state}
                  </p>
                  <p className="text-gray-600">
                    {garage.address?.country}
                  </p>
                  {garage.address?.postalCode && (
                    <p className="text-gray-600">
                      Postal Code:{" "}
                      {garage.address.postalCode}
                    </p>
                  )}
                </div>

                {/* Owner */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-green-600 mb-3">
                    <FiUser className="w-5 h-5 text-green-500" />{" "}
                    Owner
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">
                        Name:
                      </span>{" "}
                      {garage.owner?.name}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      {garage.owner?.email}
                    </p>
                    {garage.owner?.phone && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <FiPhone className="w-4 h-4" />
                        {garage.owner.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-4">
                {!currentUser ? (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
                    <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">
                      Please login to see your
                      bookings.
                    </p>
                    <button
                      onClick={() =>
                        router.push(
                          "/login?redirect=" +
                            encodeURIComponent(
                              `/garages/${garage._id}`
                            )
                        )
                      }
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Login
                    </button>
                  </div>
                ) : !userBookings ||
                  userBookings.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
                    <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">
                      You have no bookings at this
                      garage.
                    </p>
                    {garage.isActive && (
                      <button
                        onClick={() =>
                          setIsBookingModalOpen(
                            true
                          )
                        }
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                ) : (
                  userBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Booking #
                            {booking._id.slice(
                              -6
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(
                              booking.appointmentDate
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status ===
                            "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.status ===
                                  "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : booking.status ===
                                    "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Services */}
                      <div className="space-y-1 mb-3">
                        {booking.services?.map(
                          (service, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">
                                {service.name}
                              </span>
                              <span className="font-medium text-gray-800">
                                {service.price.toLocaleString()}{" "}
                                ETB
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="font-bold text-lg text-purple-600 mb-3 border-t pt-2">
                        Total:{" "}
                        {booking.totalPrice.toLocaleString()}{" "}
                        ETB
                      </div>

                      {booking.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">
                            Notes:
                          </span>{" "}
                          {booking.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {!garage.reviews ||
                garage.reviews.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
                    <FiStar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No reviews yet.
                    </p>
                  </div>
                ) : (
                  garage.reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map(
                            (_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i <
                                  review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            )
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        {review.comment}
                      </p>
                      {review.user && (
                        <p className="text-gray-500 text-sm">
                          — {review.user.name}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-400 pt-6 mt-6 border-t">
        <p>
          Created:{" "}
          {new Date(
            garage.createdAt
          ).toLocaleString()}
        </p>
        <p>
          Updated:{" "}
          {new Date(
            garage.updatedAt
          ).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
