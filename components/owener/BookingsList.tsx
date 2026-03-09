// components/dashboard/BookingsList.tsx
import { useState } from "react";
import {
  Calendar,
  Clock,
  Car,
  Phone,
  AlertCircle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { BookingStatus } from "@/lib/types/booking.types";
import {
  getStatusColor,
  getStatusIcon,
} from "@/lib/utils/booking.utils";

interface BookingsListProps {
  garage: any; // Replace with proper PopulatedGarage type
  onBookingSelect: (booking: any) => void;
  onStatusUpdate: (booking: any) => void;
}

export const BookingsList = ({
  garage,
  onBookingSelect,
  onStatusUpdate,
}: BookingsListProps) => {
  const [filter, setFilter] = useState<
    | "all"
    | "pending"
    | "approved"
    | "inProgress"
    | "completed"
    | "cancelled"
    | "rejected"
  >("all");
  const [dateFilter, setDateFilter] =
    useState<string>("");
  const [searchTerm, setSearchTerm] =
    useState("");

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
          booking.carOwner.name
            .toLowerCase()
            .includes(term) ||
          booking.serviceName
            .toLowerCase()
            .includes(term) ||
          booking.vehicleInfo?.licensePlate
            ?.toLowerCase()
            .includes(term)
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            All Bookings (
            {filteredBookings.length})
          </h3>
          <div className="flex gap-2 mt-2">
            {Object.entries(statusCounts).map(
              ([status, count]) => {
                if (status === "all") return null;
                const statusColor =
                  getStatusColor(
                    status as BookingStatus
                  );
                return (
                  <span
                    key={status}
                    className={`text-xs px-2 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}
                  >
                    {status}: {count}
                  </span>
                );
              }
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
            />
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as any)
            }
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">
              All Status
            </option>
            <option value="pending">
              Pending
            </option>
            <option value="approved">
              Approved
            </option>
            <option value="inProgress">
              In Progress
            </option>
            <option value="completed">
              Completed
            </option>
            <option value="cancelled">
              Cancelled
            </option>
            <option value="rejected">
              Rejected
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking) => {
          const statusColor = getStatusColor(
            booking.status as BookingStatus
          );
          const StatusIcon = getStatusIcon(
            booking.status as BookingStatus
          );

          return (
            <div
              key={booking._id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4"
              style={{
                borderLeftColor: `var(--${statusColor.text.split("-")[1]}-600)`,
              }}
              onClick={() =>
                onBookingSelect(booking)
              }
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {booking.carOwner.name}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColor.bg} ${statusColor.text}`}
                    >
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
                      {new Date(
                        booking.bookingDate
                      ).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.timeSlot.start} -{" "}
                      {booking.timeSlot.end}
                    </div>
                    {booking.vehicleInfo && (
                      <div className="flex items-center text-gray-500">
                        <Car className="h-4 w-4 mr-1" />
                        {booking.vehicleInfo.make}{" "}
                        {
                          booking.vehicleInfo
                            .model
                        }
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Price
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {booking.servicePrice} ETB
                    </p>
                  </div>

                  {booking.status ===
                    BookingStatus.PENDING && (
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

                  {booking.status ===
                    BookingStatus.APPROVED && (
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

                  {booking.status ===
                    BookingStatus.IN_PROGRESS && (
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

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <Phone className="h-3 w-3 mr-1" />
                  {booking.carOwner.phone ||
                    "No phone"}
                </div>
                {booking.notes && (
                  <div className="flex items-center text-gray-500">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {booking.notes.substring(
                      0,
                      50
                    )}
                    {booking.notes.length > 50 &&
                      "..."}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No bookings found
          </h4>
          <p className="text-gray-500">
            Try adjusting your filters or search
            terms
          </p>
        </div>
      )}
    </div>
  );
};
