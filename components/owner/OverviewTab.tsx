"use client";

import { JSX } from "react";

interface OverviewTabProps {
  userName?: string;
  stats: {
    totalServices: number;
    totalBookings: number;
    pendingPayments: number;
    completedPayments: number;
  };
}

export default function OverviewTab({ userName, stats }: OverviewTabProps): JSX.Element {
  const quickActions = [
    { title: "Manage Garage", description: "Update your garage information and business hours", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "blue" },
    { title: "Manage Services", description: "Add, edit, and manage your automotive services", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "purple" },
    { title: "Manage Bookings", description: "View and manage customer appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "green" },
  ];

  const getColorClasses = (color: string) => {
    switch(color) {
      case "blue": return "bg-blue-100 text-blue-600";
      case "purple": return "bg-purple-100 text-purple-600";
      case "green": return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full transform -translate-x-24 translate-y-24"></div>
        <div className="relative text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Owner Dashboard</h1>
          <p className="text-xl text-blue-100">
            Manage your garage, services, and bookings all in one place
          </p>
          {userName && (
            <p className="text-lg text-blue-100 mt-4">Hello, {userName}!</p>
          )}
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow group">
            <div className={`w-16 h-16 ${getColorClasses(action.color)} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{action.title}</h3>
            <p className="text-gray-500 text-sm">{action.description}</p>
          </div>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm text-gray-500 mb-2">Total Services</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalServices}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm text-gray-500 mb-2">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm text-gray-500 mb-2">Pending Payments</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm text-gray-500 mb-2">Completed Payments</p>
          <p className="text-3xl font-bold text-green-600">{stats.completedPayments}</p>
        </div>
      </div>
    </div>
  );
}