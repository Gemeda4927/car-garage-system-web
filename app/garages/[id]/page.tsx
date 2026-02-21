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
  FiDollarSign,
  FiTrash2,
  FiEdit3,
  FiSave,
  FiInfo,
  FiCheck,
  FiWifi,
  FiCoffee,
  FiShield,
  FiThumbsUp,
  FiPackage,
  FiCreditCard,
  FiMap,
  FiNavigation,
  FiRefreshCw,
  FiSun,
  FiMoon,
  FiLock,
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

import type { Service } from "@/lib/types/garage.types";

// Ethiopian time helper functions
const ETHIOPIAN_TIME_OFFSET = 3; // Ethiopia is UTC+3

// Get current time in Ethiopia
const getEthiopianTime = (): Date => {
  const now = new Date();
  // Convert to Ethiopian time (UTC+3)
  const ethiopianTime = new Date(now.getTime() + (ETHIOPIAN_TIME_OFFSET * 60 * 60 * 1000));
  return ethiopianTime;
};

// Format Ethiopian date for display
const formatEthiopianDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format Ethiopian time for display
const formatEthiopianTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Check if garage is currently open (8 AM - 6 PM Ethiopian time)
const isGarageOpen = (): boolean => {
  const ethiopianTime = getEthiopianTime();
  const hours = ethiopianTime.getHours();
  const dayOfWeek = ethiopianTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Sunday closed
  if (dayOfWeek === 0) return false;
  
  // Saturday: 9 AM - 3 PM
  if (dayOfWeek === 6) {
    return hours >= 9 && hours < 15;
  }
  
  // Weekdays: 8 AM - 6 PM
  return hours >= 8 && hours < 18;
};

// Check if a specific date/time is within operating hours
const isWithinOperatingHours = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  const hours = date.getHours();
  
  // Sunday closed
  if (dayOfWeek === 0) return false;
  
  // Saturday: 9 AM - 3 PM
  if (dayOfWeek === 6) {
    return hours >= 9 && hours < 15;
  }
  
  // Weekdays: 8 AM - 6 PM
  return hours >= 8 && hours < 18;
};

// Get next available date based on Ethiopian calendar
const getNextAvailableDate = (): string => {
  const ethiopianTime = getEthiopianTime();
  const today = new Date(ethiopianTime);
  
  // If current time is past closing, start from tomorrow
  const hours = today.getHours();
  const dayOfWeek = today.getDay();
  
  if (hours >= 18 || dayOfWeek === 0) {
    today.setDate(today.getDate() + 1);
  }
  
  // Skip to Monday if it's Saturday after 3 PM or Sunday
  if (today.getDay() === 6 && hours >= 15) {
    today.setDate(today.getDate() + 2);
  } else if (today.getDay() === 0) {
    today.setDate(today.getDate() + 1);
  }
  
  return today.toISOString().split("T")[0];
};

// Generate time slots based on Ethiopian time and day of week
const generateTimeSlots = (selectedDate: string): string[] => {
  const slots = [];
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Sunday closed
  if (dayOfWeek === 0) return [];
  
  // Set operating hours based on day
  let startHour = 8;
  let endHour = 18;
  
  if (dayOfWeek === 6) {
    // Saturday: 9 AM - 3 PM
    startHour = 9;
    endHour = 15;
  }
  
  // Check if selected date is today
  const ethiopianTime = getEthiopianTime();
  const todayStr = ethiopianTime.toISOString().split("T")[0];
  const currentHour = ethiopianTime.getHours();
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Skip past hours if it's today
    if (selectedDate === todayStr && hour <= currentHour) {
      continue;
    }
    
    const hourStr = hour.toString().padStart(2, "0");
    slots.push(`${hourStr}:00`);
    
    // Add 30 min slots for weekdays
    if (dayOfWeek !== 6 && hour < endHour - 1) {
      slots.push(`${hourStr}:30`);
    }
  }
  
  return slots;
};

// Get operating hours text
const getOperatingHoursText = (): string => {
  const dayOfWeek = getEthiopianTime().getDay();
  
  if (dayOfWeek === 0) return "Closed Today";
  if (dayOfWeek === 6) return "Open Today: 9:00 AM - 3:00 PM";
  return "Open Today: 8:00 AM - 6:00 PM";
};

// Update Booking Modal Component
interface UpdateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onUpdateSuccess: () => void;
  services: Service[];
}

function UpdateBookingModal({
  isOpen,
  onClose,
  booking,
  onUpdateSuccess,
  services,
}: UpdateBookingModalProps) {
  const { updateBooking } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState(booking.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [garageCurrentlyOpen] = useState(isGarageOpen());

  // Initialize form with booking data
  useEffect(() => {
    if (isOpen && booking) {
      const date = new Date(booking.appointmentDate);
      // Adjust to Ethiopian time
      const ethiopianDate = new Date(date.getTime() + (ETHIOPIAN_TIME_OFFSET * 60 * 60 * 1000));
      
      const year = ethiopianDate.getFullYear();
      const month = String(ethiopianDate.getMonth() + 1).padStart(2, "0");
      const day = String(ethiopianDate.getDate()).padStart(2, "0");
      setSelectedDate(`${year}-${month}-${day}`);

      const hour = String(ethiopianDate.getHours()).padStart(2, "0");
      const minute = String(ethiopianDate.getMinutes()).padStart(2, "0");
      setSelectedTime(`${hour}:${minute}`);

      // Get service IDs from booking
      const serviceIds = booking.services
        .map((s) => {
          const matchingService = services.find(
            (serv) => serv.name === s.name
          );
          return matchingService?._id || "";
        })
        .filter((id) => id !== "");
      setSelectedServices(serviceIds);
    }
  }, [isOpen, booking, services]);

  // Update time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setAvailableTimeSlots(generateTimeSlots(selectedDate));
      setSelectedTime(""); // Reset time when date changes
    }
  }, [selectedDate]);

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

  const activeServices = services.filter(
    (s) => s.isActive !== false
  );

  const selectedServicesData =
    activeServices.filter((s) =>
      selectedServices.includes(s._id)
    );

  const totalPrice = selectedServicesData.reduce(
    (sum, s) => sum + s.price,
    0
  );

  const totalDuration =
    selectedServicesData.reduce(
      (sum, s) => sum + s.duration,
      0
    );

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError("");

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

    // Combine date and time
    const [year, month, day] = selectedDate.split("-");
    const [hour, minute] = selectedTime.split(":");
    
    // Create date in Ethiopian time
    const ethiopianDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );
    
    // Check if selected time is within operating hours
    if (!isWithinOperatingHours(ethiopianDate)) {
      setError("Selected time is outside operating hours");
      return;
    }
    
    // Convert to UTC for storage
    const utcDate = new Date(ethiopianDate.getTime() - (ETHIOPIAN_TIME_OFFSET * 60 * 60 * 1000));
    const appointmentDate = utcDate.toISOString();

    setLoading(true);

    try {
      const updatedBooking = await updateBooking(
        booking._id,
        {
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
        }
      );

      if (updatedBooking) {
        onUpdateSuccess();
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update booking"
      );
    } finally {
      setLoading(false);
    }
  };

  const minDate = getNextAvailableDate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white">
              Update Booking
            </h2>
            <p className="text-white/90 mt-1">
              Modify your appointment
            </p>
          </div>

          <div className="p-6">
            {/* Garage Status Banner */}
            {!garageCurrentlyOpen && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2">
                <FiClock className="text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Garage is currently closed. You can still book for future dates.
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Ethiopian Time Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                <FiClock className="text-blue-600" />
                <span className="text-sm text-blue-700">
                  All times are in Ethiopian Local Time (UTC+3)
                </span>
              </div>

              {/* Services Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Services
                </label>

                {activeServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active services available
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {activeServices.map(
                      (service) => (
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
                                  setSelectedServices([
                                    ...selectedServices,
                                    service._id,
                                  ]);
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
                              {service.description && (
                                <p className="text-sm text-gray-500">
                                  {
                                    service.description
                                  }
                                </p>
                              )}
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <FiClock className="w-3 h-3" />
                                {service.duration}{" "}
                                min
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-800">
                            {service.price.toLocaleString()}{" "}
                            ETB
                          </span>
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Date (Ethiopian Calendar)
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  min={minDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Time (Ethiopian Time)
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) =>
                    setSelectedTime(e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={availableTimeSlots.length === 0}
                >
                  <option value="">
                    {availableTimeSlots.length === 0 
                      ? "No available times for this date" 
                      : "Choose a time"}
                  </option>
                  {availableTimeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time} (Ethiopian Time)
                    </option>
                  ))}
                </select>
                {availableTimeSlots.length === 0 && selectedDate && (
                  <p className="text-sm text-red-500 mt-1">
                    Garage is closed on this day. Please select another date.
                  </p>
                )}
              </div>

              {/* Operating Hours Info */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <FiInfo />
                  Operating Hours (Ethiopian Time):
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  • Monday-Friday: 8:00 AM - 6:00 PM
                </p>
                <p className="text-xs text-gray-600">
                  • Saturday: 9:00 AM - 3:00 PM
                </p>
                <p className="text-xs text-gray-600">
                  • Sunday: Closed
                </p>
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
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Summary
                  </h3>
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
                            {service.price.toLocaleString()}{" "}
                            ETB
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Total Duration:</span>
                      <span className="font-medium">
                        {totalDuration} minutes
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                      <span>Total:</span>
                      <span>
                        {totalPrice.toLocaleString()}{" "}
                        ETB
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
                    loading ||
                    activeServices.length === 0 ||
                    availableTimeSlots.length === 0
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Update Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cancel Booking Modal Component
interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onCancelSuccess: () => void;
}

function CancelBookingModal({
  isOpen,
  onClose,
  bookingId,
  onCancelSuccess,
}: CancelModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { cancelBooking } = useBookingStore();

  const handleCancel = async () => {
    setLoading(true);
    setError("");

    try {
      const success = await cancelBooking(bookingId);
      if (success) {
        onCancelSuccess();
        onClose();
      } else {
        setError("Failed to cancel booking");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel booking"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white">
              Cancel Booking
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-gray-600 mb-2">
                Are you sure you want to cancel
                this booking?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Yes, Cancel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Booking Modal Component
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  garageId: string;
  garageName: string;
  services: Service[];
}

function BookingModal({
  isOpen,
  onClose,
  garageId,
  garageName,
  services,
}: BookingModalProps) {
  const { user } = useAuthStore();
  const {
    createBooking,
    loading: bookingLoading,
  } = useBookingStore();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [garageCurrentlyOpen] = useState(isGarageOpen());

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSelectedDate("");
        setSelectedTime("");
        setSelectedServices([]);
        setNotes("");
        setError("");
        setBookingSuccess(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Update time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setAvailableTimeSlots(generateTimeSlots(selectedDate));
      setSelectedTime(""); // Reset time when date changes
    }
  }, [selectedDate]);

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

  const activeServices = services.filter(
    (s) => s.isActive !== false
  );

  const selectedServicesData =
    activeServices.filter((s) =>
      selectedServices.includes(s._id)
    );

  const totalPrice = selectedServicesData.reduce(
    (sum, s) => sum + s.price,
    0
  );
  const totalDuration =
    selectedServicesData.reduce(
      (sum, s) => sum + s.duration,
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

    // Combine date and time
    const [year, month, day] = selectedDate.split("-");
    const [hour, minute] = selectedTime.split(":");
    
    // Create date in Ethiopian time
    const ethiopianDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );
    
    // Check if selected time is within operating hours
    if (!isWithinOperatingHours(ethiopianDate)) {
      setError("Selected time is outside operating hours");
      return;
    }
    
    // Convert to UTC for storage
    const utcDate = new Date(ethiopianDate.getTime() - (ETHIOPIAN_TIME_OFFSET * 60 * 60 * 1000));
    const appointmentDate = utcDate.toISOString();

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

  const minDate = getNextAvailableDate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      />

      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 10000 }}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                {/* Garage Status Banner */}
                {!garageCurrentlyOpen && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2">
                    <FiClock className="text-yellow-600" />
                    <span className="text-sm text-yellow-700">
                      Garage is currently closed. You can still book for future dates.
                    </span>
                  </div>
                )}

                {/* Ethiopian Time Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                  <FiClock className="text-blue-600" />
                  <span className="text-sm text-blue-700">
                    All times are in Ethiopian Local Time (UTC+3)
                  </span>
                </div>

                {/* Services Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Services
                  </label>

                  {activeServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No active services available
                      for this garage
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {activeServices.map(
                        (service) => (
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
                                    e.target
                                      .checked
                                  ) {
                                    setSelectedServices([
                                      ...selectedServices,
                                      service._id,
                                    ]);
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
                                {service.description && (
                                  <p className="text-sm text-gray-500">
                                    {
                                      service.description
                                    }
                                  </p>
                                )}
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <FiClock className="w-3 h-3" />
                                  {service.duration}{" "}
                                  min
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-gray-800">
                              {service.price.toLocaleString()}{" "}
                              ETB
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Date (Ethiopian Calendar)
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      setSelectedDate(e.target.value)
                    }
                    min={minDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Time (Ethiopian Time)
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) =>
                      setSelectedTime(e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={availableTimeSlots.length === 0}
                  >
                    <option value="">
                      {availableTimeSlots.length === 0 
                        ? "No available times for this date" 
                        : "Choose a time"}
                    </option>
                    {availableTimeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time} (Ethiopian Time)
                      </option>
                    ))}
                  </select>
                  {availableTimeSlots.length === 0 && selectedDate && (
                    <p className="text-sm text-red-500 mt-1">
                      Garage is closed on this day. Please select another date.
                    </p>
                  )}
                </div>

                {/* Operating Hours Info */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <FiInfo />
                    Operating Hours (Ethiopian Time):
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    • Monday-Friday: 8:00 AM - 6:00 PM
                  </p>
                  <p className="text-xs text-gray-600">
                    • Saturday: 9:00 AM - 3:00 PM
                  </p>
                  <p className="text-xs text-gray-600">
                    • Sunday: Closed
                  </p>
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
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Summary
                    </h3>
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
                              {service.price.toLocaleString()}{" "}
                              ETB
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="border-t border-blue-200 pt-2 mt-2">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>
                          Total Duration:
                        </span>
                        <span className="font-medium">
                          {totalDuration} minutes
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                        <span>Total:</span>
                        <span>
                          {totalPrice.toLocaleString()}{" "}
                          ETB
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
                      activeServices.length === 0 ||
                      availableTimeSlots.length === 0
                    }
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <FiCheck />
                        Confirm Booking
                      </>
                    )}
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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentEthiopianTime, setCurrentEthiopianTime] = useState<Date>(getEthiopianTime());
  const [garageOpen, setGarageOpen] = useState(isGarageOpen());

  const {
    garage,
    loading,
    error,
    refetch,
    activeServices,
  } = useGarage(id || null);

  const [activeTab, setActiveTab] = useState<
    "info" | "services" | "bookings" | "reviews"
  >("services");

  // Update Ethiopian time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEthiopianTime(getEthiopianTime());
      setGarageOpen(isGarageOpen());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

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

  // Helper function to get user ID from booking
  const getBookingUserId = (
    booking: Booking
  ): string | undefined => {
    if (typeof booking.user === "string") {
      return booking.user;
    }
    return booking.user?._id;
  };

  // Only current user's bookings that are not cancelled
  const userBookings =
    garage.bookings?.filter((booking) => {
      const bookingUserId = getBookingUserId(booking);
      return bookingUserId === currentUser?.id;
    }) || [];

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Convert UTC to Ethiopian time for display
    const ethiopianDate = new Date(date.getTime() + (ETHIOPIAN_TIME_OFFSET * 60 * 60 * 1000));
    
    return ethiopianDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " (Ethiopian Time)";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleUpdateClick = (
    booking: Booking
  ) => {
    setSelectedBooking(booking);
    setIsUpdateModalOpen(true);
  };

  const handleCancelClick = (
    booking: Booking
  ) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleCancelSuccess = () => {
    refetch();
  };

  // Check if booking is allowed
  const isBookingAllowed = garage.isActive && activeServices.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() =>
          setIsBookingModalOpen(false)
        }
        garageId={garage._id}
        garageName={garage.name}
        services={activeServices}
      />

      {selectedBooking && (
        <>
          <UpdateBookingModal
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
            onUpdateSuccess={handleUpdateSuccess}
            services={activeServices}
          />

          <CancelBookingModal
            isOpen={isCancelModalOpen}
            onClose={() => {
              setIsCancelModalOpen(false);
              setSelectedBooking(null);
            }}
            bookingId={selectedBooking._id}
            onCancelSuccess={handleCancelSuccess}
          />
        </>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors group"
      >
        <FiArrowLeft
          className="group-hover:-translate-x-1 transition-transform"
          size={20}
        />
        Back to Dashboard
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
          {/* Ethiopian Time Status */}
          <span className="px-3 py-1 bg-blue-100 text-blue-800 font-semibold rounded-full text-sm flex items-center gap-1">
            <FiClock /> {formatEthiopianTime(currentEthiopianTime)} ET
          </span>

          {garageOpen ? (
            <span className="px-3 py-1 bg-gradient-to-r from-green-200 to-green-300 text-green-800 font-semibold rounded-full text-sm flex items-center gap-1">
              <FiSun /> Open Now
            </span>
          ) : (
            <span className="px-3 py-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-semibold rounded-full text-sm flex items-center gap-1">
              <FiMoon /> Closed
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

          <span className="px-3 py-1 bg-purple-100 text-purple-800 font-semibold rounded-full text-sm flex items-center gap-1">
            <FiTool /> {activeServices.length}{" "}
            Services
          </span>
        </div>

        {/* Operating Hours Today */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl inline-block">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Today's Hours:</span> {getOperatingHoursText()}
          </p>
        </div>

        {/* Booking Status Banner */}
        {!isBookingAllowed && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
            <FiLock className="text-yellow-600 w-5 h-5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Booking Currently Unavailable
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {!garage.isActive 
                  ? "Garage is currently closed for maintenance." 
                  : "No services are available at this time."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side - Map & Info Panel */}
        <div className="space-y-6">
          {/* Map */}
          <div className="h-[300px] w-full rounded-2xl overflow-hidden shadow-lg relative">
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
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />
                  <Marker
                    position={[
                      garage.location.coordinates[1],
                      garage.location.coordinates[0],
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
                          ⭐ {garage.averageRating.toFixed(1)} ({garage.totalReviews} reviews)
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

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            
            {/* Address Card */}
            <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition">
                  <FiMapPin className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Address
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {garage.address?.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {garage.address?.city}, {garage.address?.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Owner Card */}
            <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition">
                  <FiUser className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Owner
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {garage.owner?.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                    {garage.owner?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition">
                  <FiClock className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Working Hours
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Mon – Fri: 8:00 AM – 6:00 PM
                  </p>
                  <p className="text-sm text-gray-600">
                    Sat: 9:00 AM – 3:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-100 text-orange-600 group-hover:scale-110 transition">
                  <FiPhone className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Contact
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {garage.owner?.phone || "Not provided"}
                  </p>
                  {garage.owner?.phone && (
                    <a
                      href={`tel:${garage.owner.phone}`}
                      className="text-sm text-blue-600 font-medium hover:underline mt-1 inline-block"
                    >
                      Call Now →
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Amenities
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <FiWifi className="text-blue-500" /> Free WiFi
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiCoffee className="text-brown-500" /> Waiting Area
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiShield className="text-red-500" /> Insured
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Tabs */}
        <div className="flex flex-col h-full">
          {/* Tab Buttons */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-1">
            {[
              "info",
              "services",
              "bookings",
              "reviews",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as unknown)
                }
                className={`px-5 py-2 text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "info"
                  ? "Info"
                  : tab === "services"
                    ? `Services (${activeServices.length})`
                    : tab === "bookings"
                      ? `My Bookings (${userBookings.length})`
                      : "Reviews"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto max-h-[600px] pr-2">
            {activeTab === "info" && (
              <div className="space-y-4">
                {/* About */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiInfo className="text-blue-500" /> About
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {garage.description}
                  </p>
                </div>

                {/* Full Address */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiMap className="text-green-500" /> Full Address
                  </h3>
                  <p className="text-gray-700">
                    {garage.formattedAddress}
                  </p>
                  <p className="text-gray-600 mt-2">
                    {garage.address?.street},{" "}
                    {garage.address?.city}
                  </p>
                  <p className="text-gray-600">
                    {garage.address?.state},{" "}
                    {garage.address?.country}
                  </p>
                  {garage.address?.postalCode && (
                    <p className="text-gray-600 mt-1">
                      Postal: {garage.address.postalCode}
                    </p>
                  )}
                </div>

                {/* Directions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiNavigation className="text-purple-500" /> Directions
                  </h3>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${garage.location.coordinates[1]},${garage.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FiMapPin /> Get Directions
                  </a>
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div className="space-y-4">
                {activeServices.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
                    <FiTool className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">
                      No services available at this garage.
                    </p>
                  </div>
                ) : (
                  activeServices.map(
                    (service) => (
                      <div
                        key={service._id}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="text-gray-600 mt-1">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            Active
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <FiClock className="w-4 h-4" />
                            <span>{service.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <FiDollarSign className="w-4 h-4" />
                            <span>{service.price.toLocaleString()} ETB</span>
                          </div>
                        </div>

                        {isBookingAllowed && (
                          <button
                            onClick={() =>
                              setIsBookingModalOpen(true)
                            }
                            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium"
                          >
                            Book This Service
                          </button>
                        )}
                      </div>
                    )
                  )
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-4">
                {!currentUser ? (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
                    <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">
                      Please login to see your bookings.
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
                ) : userBookings.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
                    <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">
                      You have no bookings at this garage.
                    </p>
                    {isBookingAllowed && (
                      <button
                        onClick={() =>
                          setIsBookingModalOpen(true)
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
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Booking #{booking._id.slice(-8)}
                          </p>
                          <p className="text-gray-800 font-medium mt-1">
                            {formatDate(booking.appointmentDate)}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Ethiopian Local Time
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status
                            .charAt(0)
                            .toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>

                      {/* Services */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Services:
                        </p>
                        {booking.services?.map(
                          (service, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm py-1"
                            >
                              <span className="text-gray-600">
                                {service.name}
                              </span>
                              <span className="font-medium text-gray-800">
                                {service.price.toLocaleString()} ETB
                              </span>
                            </div>
                          )
                        )}
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <div className="flex justify-between font-bold text-purple-600">
                            <span>Total:</span>
                            <span>
                              {booking.totalPrice.toLocaleString()} ETB
                            </span>
                          </div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                          <span className="font-medium">
                            Notes:
                          </span>{" "}
                          {booking.notes}
                        </div>
                      )}

                      {/* Action Buttons - Only show for pending/confirmed bookings */}
                      {booking.status !== "completed" &&
                        booking.status !== "cancelled" && (
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleUpdateClick(booking)
                              }
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                            >
                              <FiEdit3 /> Update
                            </button>
                            <button
                              onClick={() =>
                                handleCancelClick(booking)
                              }
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                            >
                              <FiTrash2 /> Cancel
                            </button>
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
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
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
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FiUser className="w-3 h-3" />
                          <span>
                            — {review.user.name}
                          </span>
                        </div>
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
      <div className="text-xs text-gray-400 pt-6 mt-6 border-t flex justify-between">
        <p>
          Created: {new Date(garage.createdAt).toLocaleString()}
        </p>
        <p>
          Updated: {new Date(garage.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}