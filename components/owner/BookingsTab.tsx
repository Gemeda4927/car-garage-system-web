"use client";

import { JSX } from "react";

interface Booking {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment: "pending" | "completed";
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  status: string;
}

interface BookingsTabProps {
  bookings: Booking[];
  services: Service[];
  onUpdateStatus: (bookingId: string, status: string) => void;
  onCompletePayment: (bookingId: string) => void;
}

export default function BookingsTab({ 
  bookings, 
  services, 
  onUpdateStatus, 
  onCompletePayment 
}: BookingsTabProps): JSX.Element {
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "confirmed": return "bg-green-100 text-green-600";
      case "pending": return "bg-yellow-100 text-yellow-600";
      case "completed": return "bg-blue-100 text-blue-600";
      case "cancelled": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPaymentColor = (payment: string) => {
    return payment === "completed" 
      ? "bg-green-100 text-green-600" 
      : "bg-yellow-100 text-yellow-600";
  };

  const getServicePrice = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    return service ? service.price : 0;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Customer Bookings</h2>
          <p className="text-gray-500 mt-1">Manage and track all customer appointments</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Payment</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{booking.customer}</td>
                  <td className="py-3 px-4 text-gray-600">{booking.service}</td>
                  <td className="py-3 px-4 text-gray-600">{booking.date}</td>
                  <td className="py-3 px-4 text-gray-600">{booking.time}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600">${getServicePrice(booking.service).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <select
                      value={booking.status}
                      onChange={(e) => onUpdateStatus(booking.id, e.target.value)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(booking.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(booking.payment)}`}>
                      {booking.payment.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {booking.payment !== "completed" && (
                      <button
                        onClick={() => onCompletePayment(booking.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                      >
                        Complete Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bookings found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}