"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlinePencil,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineCheckCircle,
  HiOutlineCog
} from "react-icons/hi";

import { useAuth } from "@/lib/hooks/useAuth";
import { useUserStore } from "@/lib/store/user.store";

const SettingsPage = () => {
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const { updateUser, loading } = useUserStore();

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        name: currentUser.name || "",
        phone: currentUser.phone || ""
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => setUpdateSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  const handleUpdateUser = async () => {
    if (!currentUser) return;
    await updateUser(currentUser.id, editForm);
    setEditMode(false);
    setUpdateSuccess(true);
  };

  const handleCancelEdit = () => {
    if (!currentUser) return;
    setEditForm({
      name: currentUser.name || "",
      phone: currentUser.phone || ""
    });
    setEditMode(false);
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-600 text-white";
      case "garage_owner":
        return "bg-emerald-600 text-white";
      default:
        return "bg-blue-600 text-white";
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[600px] flex items-center justify-center"
      >
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <HiOutlineShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Please login to continue</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <HiOutlineCog className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {updateSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-emerald-50 rounded-xl flex items-center gap-3 border border-emerald-200"
            >
              <HiOutlineCheckCircle className="text-emerald-600 w-5 h-5" />
              <span className="text-emerald-700 font-medium">Profile updated successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-indigo-600"></div>

          <div className="px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex justify-between items-start -mt-12 mb-8">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 rounded-xl bg-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {currentUser.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="mb-1">
                  <h2 className="text-xl font-semibold text-gray-900">{currentUser.name}</h2>
                  <p className="text-gray-500">{currentUser.email}</p>
                </div>
              </div>

              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleUpdateUser}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiOutlineSave className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <HiOutlineX className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineUser className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Full Name</span>
                </div>
                {editMode ? (
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium px-2">{currentUser.name || "Not set"}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineMail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email Address</span>
                </div>
                <p className="text-gray-900 font-medium px-2 break-all">{currentUser.email}</p>
              </div>

              {/* Phone */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlinePhone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Phone Number</span>
                </div>
                {editMode ? (
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your phone"
                  />
                ) : (
                  <p className="text-gray-900 font-medium px-2">{currentUser.phone || "Not set"}</p>
                )}
              </div>

              {/* Role */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineShieldCheck className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Role</span>
                </div>
                <div className="px-2">
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getRoleColor(currentUser.role)}`}>
                    {currentUser.role?.replace('_', ' ') || 'User'}
                  </span>
                </div>
              </div>

              {/* Member Since */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineCalendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Member Since</span>
                </div>
                <p className="text-gray-900 font-medium px-2">{formatDate(currentUser.createdAt)}</p>
              </div>

              {/* Garage Permission */}
              {currentUser.canCreateGarage !== undefined && (
                <div className="bg-gray-50 p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Garage Creation</span>
                  </div>
                  <div className="px-2">
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                      currentUser.canCreateGarage 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {currentUser.canCreateGarage ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="mt-8 p-5 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <HiOutlineShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-500">Active and verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-700">Active</span>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-5 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
              >
                <HiOutlineLogout className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <HiOutlineLogout className="w-6 h-6 text-rose-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                  Confirm Logout
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to logout?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={logout}
                    className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;