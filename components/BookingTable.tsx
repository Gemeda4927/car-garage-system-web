import React from "react";
import type { ServiceBooking } from "@/lib/types/garage.types";

interface BookingTableProps {
  bookings: ServiceBooking[];
  onEdit?: (booking: ServiceBooking) => void;
  onDelete?: (id: string) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onEdit,
  onDelete,
}) => {
  if (!bookings || bookings.length === 0)
    return <p className="text-gray-500">No bookings found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-gray-700">Service</th>
            <th className="px-4 py-2 text-left text-gray-700">Garage</th>
            <th className="px-4 py-2 text-left text-gray-700">Car Owner</th>
            <th className="px-4 py-2 text-left text-gray-700">Date</th>
            <th className="px-4 py-2 text-left text-gray-700">Status</th>
            <th className="px-4 py-2 text-left text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} className="border-b border-gray-200">
              <td className="px-4 py-2">{b.service?.name || "N/A"}</td>
              <td className="px-4 py-2">{b.service?.garage || "N/A"}</td>
              <td className="px-4 py-2">{b.carOwner?.name || "N/A"}</td>
              <td className="px-4 py-2">{new Date(b.bookingDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 capitalize">{b.status}</td>
              <td className="px-4 py-2 space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(b)}
                    className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(b._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;