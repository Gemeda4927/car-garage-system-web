"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  HiOutlineHome,
  HiOutlineCog,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
} from "react-icons/hi";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } =
    useAuth();

  useEffect(() => {
    if (
      !isAuthenticated ||
      user?.role !== "garage_owner"
    ) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "garage_owner") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: HiOutlineHome,
      label: "Dashboard",
      active: true,
    },
    {
      icon: HiOutlineCog,
      label: "Manage Garage",
    },
    {
      icon: HiOutlineClipboardList,
      label: "Bookings",
    },
  ];

  const stats = [
    {
      label: "Today's Bookings",
      value: "12",
      icon: HiOutlineCalendar,
    },
    {
      label: "Total Revenue",
      value: "$2,450",
      icon: HiOutlineCurrencyDollar,
    },
    {
      label: "Active Customers",
      value: "48",
      icon: HiOutlineUserGroup,
    },
  ];

  const quickActions = [
    {
      title: "Manage Garage",
      description:
        "Update your garage info, hours, and location",
      color: "blue",
    },
    {
      title: "Services",
      description:
        "Add or modify services and pricing",
      color: "purple",
    },
    {
      title: "Bookings",
      description:
        "View and manage upcoming appointments",
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Garage
              <span className="text-blue-600">
                Manager
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Owner Portal
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <HiOutlineLogout className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user.name}
          </h2>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your
            garage today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              No recent activity to show
            </p>
            <p className="text-sm text-gray-400 mt-1">
              New bookings and updates will appear
              here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
