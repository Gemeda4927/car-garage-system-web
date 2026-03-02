"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineStar,
  HiOutlineFlag,
} from "react-icons/hi";
import {
  HiOutlineBuildingOffice,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } =
    useAuth();

  useEffect(() => {
    if (
      !isAuthenticated ||
      user?.role !== "admin"
    ) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") {
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
      icon: HiOutlineChartBar,
      label: "Overview",
      active: true,
    },
    { icon: HiOutlineUsers, label: "Users" },
    {
      icon: HiOutlineBuildingOffice,
      label: "Garages",
    },
    {
      icon: HiOutlineClipboardDocumentList,
      label: "Bookings",
    },
    {
      icon: HiOutlineShieldCheck,
      label: "Verifications",
    },
    { icon: HiOutlineCog, label: "Settings" },
  ];

  const stats = [
    {
      label: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: HiOutlineUserGroup,
      color: "blue",
    },
    {
      label: "Active Garages",
      value: "156",
      change: "+8",
      icon: HiOutlineBuildingOffice,
      color: "green",
    },
    {
      label: "Total Bookings",
      value: "3,892",
      change: "+23%",
      icon: HiOutlineClipboardDocumentList,
      color: "purple",
    },
    {
      label: "Revenue",
      value: "$48.2K",
      change: "+18%",
      icon: HiOutlineCurrencyDollar,
      color: "orange",
    },
  ];

  const pendingItems = [
    {
      type: "Garage Verifications",
      count: 8,
      icon: HiOutlineBuildingOffice,
      color: "yellow",
    },
    {
      type: "User Reports",
      count: 3,
      icon: HiOutlineFlag,
      color: "red",
    },
    {
      type: "New Reviews",
      count: 12,
      icon: HiOutlineStar,
      color: "green",
    },
  ];

  const recentActivities = [
    {
      action: "New garage registered",
      user: "Speedy Auto Repair",
      time: "5 min ago",
      type: "garage",
    },
    {
      action: "User reported issue",
      user: "John Doe",
      time: "15 min ago",
      type: "report",
    },
    {
      action: "Verification request",
      user: "City Garage",
      time: "1 hour ago",
      type: "verify",
    },
    {
      action: "New user joined",
      user: "Sarah Johnson",
      time: "2 hours ago",
      type: "user",
    },
    {
      action: "Booking completed",
      user: "Mike's Workshop",
      time: "3 hours ago",
      type: "booking",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "garage":
        return HiOutlineBuildingOffice;
      case "report":
        return HiOutlineFlag;
      case "verify":
        return HiOutlineShieldCheck;
      case "user":
        return HiOutlineUsers;
      case "booking":
        return HiOutlineClipboardDocumentList;
      default:
        return HiOutlineBell;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Admin
              <span className="text-indigo-600">
                Dashboard
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Platform Overview
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  item.active
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Admin Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Administrator
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome back, {user.name}
            </h2>
            <p className="text-gray-500 mt-1">
              Here&apos;s what&apos;s happening
              with your platform today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <HiOutlineBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              View Reports
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-semibold text-gray-800">
                      {stat.value}
                    </p>
                    <span
                      className={`text-xs font-medium text-${stat.color}-600 bg-${stat.color}-50 px-1.5 py-0.5 rounded`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}
                >
                  <stat.icon
                    className={`w-5 h-5 text-${stat.color}-600`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Items */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Pending Items
            </h3>
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div
                  key={item.type}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg bg-${item.color}-50 flex items-center justify-center`}
                    >
                      <item.icon
                        className={`w-4 h-4 text-${item.color}-600`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.type}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold text-${item.color}-600 bg-${item.color}-50 px-2 py-1 rounded-full min-w-[2rem] text-center`}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Recent Activity
            </h3>
            <div className="bg-white rounded-xl border border-gray-200">
              {recentActivities.map(
                (activity, index) => {
                  const Icon = getActivityIcon(
                    activity.type
                  );
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 ${
                        index !==
                        recentActivities.length -
                          1
                          ? "border-b border-gray-100"
                          : ""
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activity.user}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {activity.time}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: "Verify Garages",
                icon: HiOutlineShieldCheck,
                count: 8,
              },
              {
                label: "Review Reports",
                icon: HiOutlineFlag,
                count: 3,
              },
              {
                label: "Manage Users",
                icon: HiOutlineUsers,
                count: null,
              },
              {
                label: "System Settings",
                icon: HiOutlineCog,
                count: null,
              },
            ].map((action) => (
              <button
                key={action.label}
                className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <action.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  {action.count && (
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {action.count} pending
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 mt-3 group-hover:text-indigo-600 transition-colors">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
