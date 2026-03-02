"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Welcome to Dashboard
        </h1>
        <div className="text-sm text-gray-600">
          Logged in as:{" "}
          <span className="font-semibold">
            {user.role}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Hello, {user.name} 👋
          </h2>

          <p className="text-gray-600 mb-6">
            This is your dashboard. From here you
            can manage your account, bookings,
            garages, and more.
          </p>

          {/* Example Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">
                Total Bookings
              </h3>
              <p className="text-2xl mt-2">12</p>
            </div>

            <div className="bg-green-500 text-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">
                Active Services
              </h3>
              <p className="text-2xl mt-2">5</p>
            </div>

            <div className="bg-purple-500 text-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">
                Reviews
              </h3>
              <p className="text-2xl mt-2">8</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
