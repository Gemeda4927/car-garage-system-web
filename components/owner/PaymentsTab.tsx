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

interface PaymentsTabProps {
  bookings: Booking[];
  services: Service[];
  onCompletePayment: (bookingId: string) => void;
}

export default function PaymentsTab({ bookings, services, onCompletePayment }: PaymentsTabProps): JSX.Element {
  
  const pendingPayments = bookings.filter(b => b.payment === "pending");
  const completedPayments = bookings.filter(b => b.payment === "completed");

  const getServicePrice = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    return service ? service.price : 0;
  };

  const totalPendingAmount = pendingPayments.reduce((total, booking) => {
    return total + getServicePrice(booking.service);
  }, 0);

  const totalCompletedAmount = completedPayments.reduce((total, booking) => {
    return total + getServicePrice(booking.service);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Pending Payments</p>
          <p className="text-3xl font-bold mt-2">${totalPendingAmount.toFixed(2)}</p>
          <p className="text-sm mt-2">{pendingPayments.length} pending transaction(s)</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Completed Payments</p>
          <p className="text-3xl font-bold mt-2">${totalCompletedAmount.toFixed(2)}</p>
          <p className="text-sm mt-2">{completedPayments.length} completed transaction(s)</p>
        </div>
      </div>

      {/* Pending Payments Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pending Payments</h2>
          <p className="text-gray-500 mt-1">Process customer payments</p>
        </div>
        
        <div className="space-y-4">
          {pendingPayments.map((booking) => (
            <div key={booking.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-lg">{booking.customer}</h3>
                  <span className="text-2xl font-bold text-blue-600">${getServicePrice(booking.service).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600">{booking.service}</p>
                <p className="text-xs text-gray-500 mt-1">{booking.date} at {booking.time}</p>
              </div>
              <button
                onClick={() => onCompletePayment(booking.id)}
                className="ml-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Process Payment
              </button>
            </div>
          ))}
          
          {pendingPayments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">No pending payments</p>
              <p className="text-sm mt-1">All payments have been processed</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Payment History</h2>
          <p className="text-gray-500 mt-1">Completed transactions</p>
        </div>
        
        <div className="space-y-3">
          {completedPayments.map((booking) => (
            <div key={booking.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <h3 className="font-semibold text-gray-800">{booking.customer}</h3>
                <p className="text-sm text-gray-600">{booking.service} - {booking.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">${getServicePrice(booking.service).toFixed(2)}</p>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 mt-1">Paid</span>
              </div>
            </div>
          ))}
          
          {completedPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payment history yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}