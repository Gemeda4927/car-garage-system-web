"use client";

import { JSX, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import DashboardHeader from "@/components/owner/DashboardHeader";
import Sidebar from "@/components/owner/Sidebar";
import OverviewTab from "@/components/owner/OverviewTab";
import GarageTab from "@/components/owner/GarageTab";
import ServicesTab from "@/components/owner/ServicesTab";
import BookingsTab from "@/components/owner/BookingsTab";
import PaymentsTab from "@/components/owner/PaymentsTab";
import toast from "react-hot-toast";

export default function OwnerDashboardPage(): JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // State management
  const [garageInfo, setGarageInfo] = useState({
    name: "AutoCare Pro",
    address: "123 Main Street",
    phone: "+1 234 567 890",
    hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
    description: "Professional auto repair and maintenance services"
  });

  const [services, setServices] = useState([
    { id: "1", name: "Oil Change", price: 49.99, duration: "30 min", status: "active" },
    { id: "2", name: "Tire Rotation", price: 29.99, duration: "20 min", status: "active" },
    { id: "3", name: "Brake Inspection", price: 39.99, duration: "45 min", status: "active" },
  ]);

  const [bookings, setBookings] = useState([
    { 
      id: "1", 
      customer: "John Doe", 
      service: "Oil Change", 
      date: "2024-01-20", 
      time: "10:00 AM", 
      status: "confirmed" as const, 
      payment: "pending" as const 
    },
    { 
      id: "2", 
      customer: "Jane Smith", 
      service: "Tire Rotation", 
      date: "2024-01-20", 
      time: "2:00 PM", 
      status: "confirmed" as const, 
      payment: "completed" as const 
    },
    { 
      id: "3", 
      customer: "Mike Johnson", 
      service: "Brake Inspection", 
      date: "2024-01-21", 
      time: "11:00 AM", 
      status: "pending" as const, 
      payment: "pending" as const 
    },
  ]);

  // Handlers with toast notifications
  const handleGarageUpdate = (updatedInfo: typeof garageInfo) => {
    setGarageInfo(updatedInfo);
    toast.success("", {
      duration: 4000,
      position: "top-right",
      icon: "🏪",
      style: {
        background: "#10B981",
        color: "#fff",
      },
    });
  };

  const handleAddService = (service: Omit<typeof services[0], "id">) => {
    const newService = {
      ...service,
      id: (services.length + 1).toString()
    };
    setServices([...services, newService]);
    toast.success(`Service "${service.name}" added successfully!`, {
      duration: 4000,
      position: "top-right",
      icon: "🔧",
    });
  };

  const handlePaymentComplete = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, payment: "completed" }
        : booking
    ));
    toast.success(`Payment completed for booking #${bookingId}`, {
      duration: 4000,
      position: "top-right",
      icon: "💰",
    });
  };

  const handleBookingStatus = (bookingId: string, status: string) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: status as any }
        : booking
    ));
    toast.success(`Booking #${bookingId} status updated to ${status}`, {
      duration: 4000,
      position: "top-right",
      icon: "📅",
    });
  };

  // Calculate stats
  const stats = {
    totalServices: services.length,
    totalBookings: bookings.length,
    pendingPayments: bookings.filter(b => b.payment === "pending").length,
    completedPayments: bookings.filter(b => b.payment === "completed").length,
  };

  // Get title based on active tab
  const getTitle = () => {
    switch(activeTab) {
      case "overview": return "Owner Dashboard";
      case "garage": return "Manage Garage";
      case "services": return "Manage Services";
      case "bookings": return "Manage Bookings";
      case "payments": return "Complete Payments";
      default: return "Owner Dashboard";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
      
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          userName={user?.name}
        />
        
        <main className="flex-1">
          <DashboardHeader title={getTitle()} />
          
          <div className="p-8">
            {activeTab === "overview" && (
              <OverviewTab 
                userName={user?.name} 
                stats={stats}
              />
            )}
            
            {activeTab === "garage" && (
              <GarageTab 
                garageInfo={garageInfo}
                onUpdate={handleGarageUpdate}
              />
            )}
            
            {activeTab === "services" && (
              <ServicesTab 
                services={services}
                onAddService={handleAddService}
              />
            )}
            
            {activeTab === "bookings" && (
              <BookingsTab 
                bookings={bookings}
                services={services}
                onUpdateStatus={handleBookingStatus}
                onCompletePayment={handlePaymentComplete}
              />
            )}
            
            {activeTab === "payments" && (
              <PaymentsTab 
                bookings={bookings}
                services={services}
                onCompletePayment={handlePaymentComplete}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}