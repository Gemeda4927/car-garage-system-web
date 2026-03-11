"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineStar,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineCog,
  HiOutlineTrash,
  HiOutlineArchive,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineSearch,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineBan,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineCloudUpload,
  HiOutlineDatabase,
} from "react-icons/hi";

import {
  HiOutlineBuildingOffice,
  HiOutlineBuildingStorefront,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineWrench,
  HiOutlineChartBar,
  HiOutlineClipboard,
  HiOutlineGlobeAlt,
} from "react-icons/hi2";

import type {
  PopulatedGarage,
  GarageService,
  GarageStats,
  Address,
  ContactInfo,
  BusinessHours,
  BusinessDay,
  ServiceBooking,
  UserSummary,
  GarageReview,
  CreationPayment,
  CreateGaragePayload,
} from "@/lib/types/garage.types";

import { useGarage } from "@/lib/hooks/useGarage";

interface GarageTableProps {
  garages?: PopulatedGarage[] | null;
  loading?: boolean;
  error?: string | null;
  showDeleted?: boolean;
  showUnverified?: boolean;
  showComplete?: boolean;

  onVerify?: (id: string, status: "active" | "rejected", notes?: string) => Promise<void>;
  onToggleActive?: (id: string) => Promise<void>;
  onFeature?: (id: string) => Promise<void>;
  onViewDetails?: (garage: PopulatedGarage) => void;
  onRestore?: (id: string) => Promise<void>;
  onPermanentDelete?: (id: string) => Promise<void>;
  onUploadFiles?: (id: string, files: FileList, type: "images" | "documents") => Promise<void>;
  onDeleteFile?: (id: string, filename: string, type: "images" | "documents") => Promise<void>;
  onCreateGarage?: (data: CreateGaragePayload) => Promise<PopulatedGarage | null>;
}

type SortField = "name" | "createdAt" | "rating" | "bookings" | "status" | "price";
type SortOrder = "asc" | "desc";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: "active" | "rejected", notes: string) => void;
  garageName: string;
  loading?: boolean;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList, type: "images" | "documents") => void;
  garageName: string;
  type: "images" | "documents";
  loading?: boolean;
}

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  garage: PopulatedGarage | null;
  onAction: (action: string, id: string, garage?: PopulatedGarage, additionalData?: any) => void;
  actionLoading: Record<string, string>;
}

interface CreateGarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateGaragePayload) => Promise<void>;
  loading?: boolean;
}

interface CompleteStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: any;
  collections: any;
}

const formatETB = (price: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const isGarageOpenNow = (businessHours?: BusinessHours): boolean => {
  if (!businessHours) return false;

  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()] as keyof BusinessHours;
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const daySchedule = businessHours[currentDay];
  if (!daySchedule || daySchedule.closed) return false;

  const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
  const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);

  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  return currentTime >= openTime && currentTime <= closeTime;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const CompleteStatsModal: React.FC<CompleteStatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  collections,
}) => {
  if (!isOpen || !stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-6xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Complete Garage Statistics</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <HiOutlineX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90">Total Garages</p>
              <p className="text-3xl font-bold">{formatNumber(stats.totalGarages)}</p>
              <div className="mt-2 text-xs opacity-75">
                <span className="mr-2">✓ {stats.totalVerified} Verified</span>
                <span>⏳ {stats.totalUnverified} Unverified</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90">Total Bookings</p>
              <p className="text-3xl font-bold">{formatNumber(stats.bookings.total)}</p>
              <p className="mt-2 text-xs opacity-75">
                Revenue: {formatETB(stats.bookings.totalRevenue)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90">Total Services</p>
              <p className="text-3xl font-bold">{formatNumber(stats.services.total)}</p>
              <p className="mt-2 text-xs opacity-75">
                Avg Price: {formatETB(stats.services.priceRange.avg)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90">Total Reviews</p>
              <p className="text-3xl font-bold">{formatNumber(stats.reviews.total)}</p>
              <p className="mt-2 text-xs opacity-75">
                Avg Rating: {stats.reviews.averageRating.toFixed(1)} ⭐
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Garage Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-green-600">{stats.totalActive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inactive</span>
                  <span className="font-semibold text-gray-600">{stats.totalInactive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deleted</span>
                  <span className="font-semibold text-red-600">{stats.totalDeleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{stats.totalPending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-semibold text-green-600">{stats.totalApproved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Suspended</span>
                  <span className="font-semibold text-red-600">{stats.totalSuspended}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Booking Statistics</h3>
              <div className="space-y-2">
                {Object.entries(stats.bookings.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{status}</span>
                    <span className="font-semibold">{formatNumber(count as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Upcoming</span>
                  <span className="font-semibold text-blue-600">{formatNumber(stats.bookings.upcoming)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Services by Category</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(stats.services.byCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-semibold">{formatNumber(count as number)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Reviews by Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex justify-between">
                    <span className="text-gray-600">{rating} Stars</span>
                    <span className="font-semibold">
                      {formatNumber(stats.reviews.byRating[rating] || 0)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">With Response</span>
                  <span className="font-semibold text-green-600">{formatNumber(stats.reviews.withResponse)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payments</span>
                  <span className="font-semibold">{formatNumber(stats.payments.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-green-600">{formatETB(stats.payments.totalAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">By Status</span>
                  <span></span>
                </div>
                {Object.entries(stats.payments.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize ml-4">{status}</span>
                    <span>{formatNumber(count as number)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">File Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Images</span>
                  <span className="font-semibold">{formatNumber(stats.files.totalImages)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Documents</span>
                  <span className="font-semibold">{formatNumber(stats.files.totalDocuments)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-3">Collections</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">{formatNumber(collections?.services?.length || 0)}</p>
                <p className="text-xs text-gray-600">Services</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(collections?.bookings?.length || 0)}</p>
                <p className="text-xs text-gray-600">Bookings</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{formatNumber(collections?.reviews?.length || 0)}</p>
                <p className="text-xs text-gray-600">Reviews</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(collections?.payments?.length || 0)}</p>
                <p className="text-xs text-gray-600">Payments</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(collections?.owners?.length || 0)}</p>
                <p className="text-xs text-gray-600">Owners</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CreateGarageModal: React.FC<CreateGarageModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateGaragePayload>>({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Ethiopia',
      zipCode: '',
    },
    contactInfo: {
      phone: '',
      email: '',
      website: '',
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    },
    services: [],
    images: [],
    documents: [],
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(formData as CreateGaragePayload);
  };

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address!, [field]: value },
    }));
  };

  const updateContact = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo!, [field]: value },
    }));
  };

  const updateBusinessHour = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours!,
        [day]: { ...prev.businessHours![day as keyof BusinessHours], [field]: value },
      },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Garage</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <HiOutlineX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step === currentStep ? 'bg-indigo-600 text-white' :
                      step < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {step < currentStep ? <HiOutlineCheck className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Basic Info</span>
            <span>Location & Contact</span>
            <span>Business Hours</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Garage Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="e.g., Mike's Auto Repair"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                      placeholder="Describe your garage and services..."
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Services (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.services?.join(', ')}
                      onChange={(e) => updateForm('services', e.target.value.split(',').map(s => s.trim()))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="e.g., Oil Change, Brake Repair, Engine Diagnostics"
                      disabled={loading}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Street Address *"
                        required
                        value={formData.address?.street}
                        onChange={(e) => updateAddress('street', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="City *"
                        required
                        value={formData.address?.city}
                        onChange={(e) => updateAddress('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State *"
                        required
                        value={formData.address?.state}
                        onChange={(e) => updateAddress('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Country *"
                        required
                        value={formData.address?.country}
                        onChange={(e) => updateAddress('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="ZIP Code *"
                        required
                        value={formData.address?.zipCode}
                        onChange={(e) => updateAddress('zipCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mt-6">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        required
                        value={formData.contactInfo?.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email *"
                        required
                        value={formData.contactInfo?.email}
                        onChange={(e) => updateContact('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="url"
                        placeholder="Website (optional)"
                        value={formData.contactInfo?.website}
                        onChange={(e) => updateContact('website', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Business Hours</h3>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <span className="w-24 font-medium capitalize text-gray-700">{day}</span>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!formData.businessHours?.[day as keyof BusinessHours]?.closed}
                          onChange={(e) => updateBusinessHour(day, 'closed', !e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                          disabled={loading}
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </label>
                      {!formData.businessHours?.[day as keyof BusinessHours]?.closed && (
                        <>
                          <input
                            type="time"
                            value={formData.businessHours?.[day as keyof BusinessHours]?.open}
                            onChange={(e) => updateBusinessHour(day, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg"
                            disabled={loading}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={formData.businessHours?.[day as keyof BusinessHours]?.close}
                            onChange={(e) => updateBusinessHour(day, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg"
                            disabled={loading}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1 || loading}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <HiOutlineCheck className="w-5 h-5" />
                      Create Garage
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  garageName,
  loading = false,
}) => {
  const [status, setStatus] = useState<"active" | "rejected">("active");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Garage</h3>
        <p className="text-gray-600 mb-6">
          Review and verify <span className="font-semibold">{garageName}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Status
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus("active")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${status === "active"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                disabled={loading}
              >
                <HiOutlineCheckCircle className="w-5 h-5" />
                <span className="font-medium">Approve</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus("rejected")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${status === "rejected"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                disabled={loading}
              >
                <HiOutlineXCircle className="w-5 h-5" />
                <span className="font-medium">Reject</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this verification..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(status, notes)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineShieldCheck className="w-5 h-5" />
                  Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  garageName,
  type,
  loading = false,
}) => {
  const [files, setFiles] = useState<FileList | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = () => {
    if (files && files.length > 0) {
      onUpload(files, type);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Upload {type === "images" ? "Images" : "Documents"}
        </h3>
        <p className="text-gray-600 mb-6">
          Add {type} to <span className="font-semibold">{garageName}</span>
        </p>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {type === "images" ? (
              <HiOutlinePhotograph className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            ) : (
              <HiOutlineDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            )}
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              {type === "images" ? "PNG, JPG, JPEG up to 5MB" : "PDF, DOC, DOCX up to 10MB"}
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept={type === "images" ? "image/*" : ".pdf,.doc,.docx"}
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </div>

          {files && files.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected Files ({files.length})
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{file.name}</span>
                    <span className="text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!files || files.length === 0 || loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineCloudUpload className="w-5 h-5" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  garage,
  onAction,
  actionLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "services" | "bookings" | "reviews" | "files">("info");

  if (!isOpen || !garage) return null;

  const owner = typeof garage.owner === "object" ? garage.owner : null;
  const isOpenNow = isGarageOpenNow(garage.businessHours);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <HiOutlineBuildingStorefront className="w-8 h-8" />
                </div>
                {garage.isVerified && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{garage.name}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${garage.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                    }`}>
                    {garage.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${garage.isVerified
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {garage.isVerified ? "Verified" : "Unverified"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${garage.status === 'approved' ? 'bg-green-100 text-green-700' :
                      garage.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        garage.status === 'suspended' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                    }`}>
                    {garage.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${isOpenNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {isOpenNow ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiOutlineX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { key: "info", label: "Information", icon: HiOutlineBuildingOffice },
              { key: "services", label: "Services", icon: HiOutlineWrench },
              { key: "bookings", label: "Bookings", icon: HiOutlineCalendar },
              { key: "reviews", label: "Reviews", icon: HiOutlineStar },
              { key: "files", label: "Files", icon: HiOutlineDocumentText },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-2 flex items-center gap-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-900">{garage.description || "No description provided"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Owner Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white">
                        <HiOutlineUser className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{owner?.name}</p>
                        <p className="text-sm text-gray-500">{owner?.email}</p>
                        <p className="text-sm text-gray-500">{owner?.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                        <span>{garage.contactInfo?.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineMail className="w-4 h-4 text-gray-400" />
                        <span>{garage.contactInfo?.email || "N/A"}</span>
                      </div>
                      {garage.contactInfo?.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <HiOutlineGlobeAlt className="w-4 h-4 text-gray-400" />
                          <a
                            href={garage.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline truncate"
                          >
                            {garage.contactInfo.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <HiOutlineMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p>{garage.address?.street}</p>
                          <p>{garage.address?.city}, {garage.address?.state}</p>
                          <p>{garage.address?.country} {garage.address?.zipCode}</p>
                        </div>
                      </div>
                      {garage.coordinates && (
                        <p className="text-xs text-gray-400">
                          Lat: {garage.coordinates.coordinates[1].toFixed(6)},
                          Lng: {garage.coordinates.coordinates[0].toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Business Hours</h3>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-4">
                    {garage.businessHours && Object.entries(garage.businessHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize text-gray-600">{day}:</span>
                        <span className="text-gray-900 font-medium">
                          {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Performance Stats</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-indigo-600">{garage.stats?.totalBookings || 0}</p>
                      <p className="text-xs text-gray-500">Total Bookings</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{garage.stats?.completedBookings || 0}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{garage.stats?.averageRating.toFixed(1) || 0}</p>
                      <p className="text-xs text-gray-500">Avg Rating</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-purple-600">{garage.stats?.totalReviews || 0}</p>
                      <p className="text-xs text-gray-500">Reviews</p>
                    </div>
                  </div>
                </div>

                {garage.creationPayment && typeof garage.creationPayment === 'object' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Amount: <span className="font-semibold text-gray-900">{formatETB(garage.creationPayment.amount)}</span></p>
                          <p className="text-xs text-gray-500">Transaction: {garage.creationPayment.transactionId}</p>
                          <p className="text-xs text-gray-500">Paid: {formatDate(garage.creationPayment.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${garage.creationPayment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {garage.creationPayment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {garage.verifiedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Verification Details</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600">
                        Verified on: <span className="font-medium text-gray-900">{formatDate(garage.verifiedAt)}</span>
                      </p>
                      {garage.verifiedBy && (
                        <p className="text-sm text-gray-600">
                          Verified by: <span className="font-medium text-gray-900">
                            {typeof garage.verifiedBy === 'object' ? garage.verifiedBy.name : garage.verifiedBy}
                          </span>
                        </p>
                      )}
                      {garage.verificationNotes && (
                        <p className="text-sm text-gray-600 mt-2">
                          Notes: <span className="text-gray-900">{garage.verificationNotes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {garage.services && garage.services.length > 0 ? (
                  garage.services.map((service) => (
                    <div key={service._id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              {service.category}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                              {service.duration} min
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${service.isAvailable
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                              {service.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-indigo-600">{formatETB(service.price)}</p>
                          {service.bookings && service.bookings.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {service.bookings.length} upcoming bookings
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <HiOutlineWrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No services available</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {garage.recentBookings && garage.recentBookings.length > 0 ? (
                  garage.recentBookings.map((booking) => (
                    <div key={booking._id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <HiOutlineUser className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {typeof booking.carOwner === 'object' ? booking.carOwner.name : 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                            <HiOutlineClock className="w-4 h-4 text-gray-400 ml-2" />
                            <span>{booking.timeSlot.start} - {booking.timeSlot.end}</span>
                          </div>
                          {booking.service && typeof booking.service === 'object' && (
                            <p className="text-sm text-gray-600 mt-1">
                              Service: {booking.service.name}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              booking.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                          }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <HiOutlineCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent bookings</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {garage.reviews && garage.reviews.length > 0 ? (
                  garage.reviews.map((review) => (
                    <div key={review._id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <HiOutlineStar
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {review.rating}.0
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <HiOutlineUser className="w-3 h-3" />
                            <span>{review.carOwner?.name || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                          {review.response && (
                            <div className="mt-3 pl-4 border-l-2 border-indigo-200">
                              <p className="text-xs text-indigo-600 font-medium">Owner Response:</p>
                              <p className="text-sm text-gray-600 mt-1">{review.response.comment}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(review.response.respondedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <HiOutlineStar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "files" && (
              <motion.div
                key="files"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Images ({garage.images?.length || 0})</h3>
                  {garage.images && garage.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {garage.images.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={typeof image === 'string' ? image : URL.createObjectURL(image as any)}
                            alt={`Garage ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => onAction('deleteFile', garage._id, garage, {
                              filename: typeof image === 'string' ? image.split('/').pop() : `image-${index}`,
                              type: 'images'
                            })}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete image"
                          >
                            <HiOutlineTrash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No images uploaded</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Documents ({garage.documents?.length || 0})</h3>
                  {garage.documents && garage.documents.length > 0 ? (
                    <div className="space-y-2">
                      {garage.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <HiOutlineDocumentText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">
                              {typeof doc === 'string' ? doc.split('/').pop() : 'Document'}
                            </span>
                          </div>
                          <button
                            onClick={() => onAction('deleteFile', garage._id, garage, {
                              filename: typeof doc === 'string' ? doc.split('/').pop() : `doc-${index}`,
                              type: 'documents'
                            })}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Delete document"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No documents uploaded</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {!garage.isDeleted && (
                <>
                  {!garage.isVerified && (
                    <button
                      onClick={() => onAction('verify', garage._id, garage)}
                      disabled={!!actionLoading[garage._id]}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      {actionLoading[garage._id] === 'verify' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineShieldCheck className="w-4 h-4" />
                      )}
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => onAction('toggle', garage._id, garage)}
                    disabled={!!actionLoading[garage._id]}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${garage.isActive
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50`}
                  >
                    {actionLoading[garage._id] === 'toggle' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiOutlineRefresh className="w-4 h-4" />
                    )}
                    {garage.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export function GarageTable({
  garages: propGarages,
  loading: propLoading,
  error: propError,
  showDeleted = false,
  showUnverified = false,
  showComplete = false,
  onVerify: propOnVerify,
  onToggleActive: propOnToggleActive,
  onFeature: propOnFeature,
  onViewDetails: propOnViewDetails,
  onRestore: propOnRestore,
  onPermanentDelete: propOnPermanentDelete,
  onUploadFiles: propOnUploadFiles,
  onDeleteFile: propOnDeleteFile,
  onCreateGarage: propOnCreateGarage,
}: GarageTableProps) {
  const {
    garages: hookGarages,
    deletedGarages,
    unverifiedGarages,
    loading: hookLoading,
    error: hookError,
    pagination,
    priceRange,
    fetchGarages,
    fetchGarage,
    fetchNearbyGarages,
    fetchDeletedGarages,
    fetchUnverifiedGarages,
    fetchGarageServices,
    fetchGarageReviews,
    fetchGarageBookings,
    fetchGarageAnalytics,
    createGarage,
    updateGarage,
    deleteGarage,
    restoreGarage,
    verifyGarage,
    toggleActiveGarage,
    uploadFiles,
    deleteFile,
    getGarageById,
    hasGarage,
    getGarageCount,
    getOwnerInfo,
    isGarageOwner,
    getServices,
    getServiceById,
    getBookings,
    getPendingBookings,
    getCompletedBookings,
    getUpcomingBookings,
    getTodaysBookings,
    getReviews,
    getAverageRating,
    getVerifiedGarages,
    getActiveGarages,
    getDeletedGarages: getDeletedGaragesHelper,
    getPendingVerificationGarages,
    getSuspendedGarages,
    getLocalStats,
    actionLoading: hookActionLoading,

    completeData,
    fetchCompleteData,
    getCompleteStats,
    getCollections,
    getAllServices,
    getAllBookings,
    getAllReviews,
    getAllPayments,
    getAllOwners,
    getPricingInfo,
    getGlobalPriceRange,
    getGaragePricing,
    getGroups,
    getGaragesByCity,
    getVerifiedGaragesList,
    getUnverifiedGaragesList,
    getDeletedGaragesList,
    getActiveGaragesIds,
    getGaragesByStatus,
    getTimelineData,
    getCreatedByMonth,
    getVerifiedByMonth,
    getMetadata,
    getDatabaseStats,
  } = useGarage();

  const getGaragesToShow = useCallback(() => {
    if (propGarages) return propGarages;
    if (showDeleted) return deletedGarages;
    if (showUnverified) return unverifiedGarages;
    return hookGarages;
  }, [propGarages, hookGarages, deletedGarages, unverifiedGarages, showDeleted, showUnverified]);

  const garages = getGaragesToShow();
  const loading = propLoading ?? hookLoading;
  const error = propError ?? hookError;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGarages, setSelectedGarages] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [selectedGarage, setSelectedGarage] = useState<PopulatedGarage | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteStatsModal, setShowCompleteStatsModal] = useState(false);
  const [uploadType, setUploadType] = useState<"images" | "documents">("images");

  const [localActionLoading, setLocalActionLoading] = useState<Record<string, string>>({});
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const actionLoading = { ...hookActionLoading, ...localActionLoading };

  useEffect(() => {
    const fetchData = async () => {
      if (showComplete) {
        await fetchCompleteData();
      } else if (showDeleted) {
        await fetchDeletedGarages({ page: currentPage, limit: itemsPerPage });
      } else if (showUnverified) {
        await fetchUnverifiedGarages({ page: currentPage, limit: itemsPerPage });
      } else {
        await fetchGarages({ page: currentPage, limit: itemsPerPage });
      }
    };
    fetchData();
  }, [showComplete, showDeleted, showUnverified, fetchCompleteData, fetchDeletedGarages, fetchUnverifiedGarages, fetchGarages, currentPage, itemsPerPage]);

  useEffect(() => {
    if (pagination) {
      setCurrentPage(pagination.page);
    }
  }, [pagination]);

  const garageList = useMemo(() => {
    if (!Array.isArray(garages)) return [];
    return garages;
  }, [garages]);

  const filteredAndSortedGarages = useMemo(() => {
    let filtered = [...garageList];

    if (searchTerm) {
      filtered = filtered.filter((garage) => {
        const ownerName = typeof garage.owner === "object" ? garage.owner?.name || "" : "";
        return (
          garage.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.address?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          garage.contactInfo?.phone?.includes(searchTerm) ||
          garage.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((garage) => {
        if (statusFilter === "verified") return garage.isVerified;
        if (statusFilter === "unverified") return !garage.isVerified;
        if (statusFilter === "active") return garage.isActive;
        if (statusFilter === "inactive") return !garage.isActive;
        if (statusFilter === "pending") return garage.status === "pending";
        if (statusFilter === "approved") return garage.status === "approved";
        if (statusFilter === "suspended") return garage.status === "suspended";
        if (statusFilter === "deleted") return garage.isDeleted;
        return true;
      });
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "rating":
          comparison = (a.stats?.averageRating || 0) - (b.stats?.averageRating || 0);
          break;
        case "bookings":
          comparison = (a.stats?.totalBookings || 0) - (b.stats?.totalBookings || 0);
          break;
        case "status":
          comparison = (a.isVerified ? 1 : 0) - (b.isVerified ? 1 : 0);
          break;
        case "price":
          const minPriceA = a.services?.length ? Math.min(...a.services.map(s => s.price)) : 0;
          const minPriceB = b.services?.length ? Math.min(...b.services.map(s => s.price)) : 0;
          comparison = minPriceA - minPriceB;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [garageList, searchTerm, sortField, sortOrder, statusFilter]);

  const paginatedGarages = useMemo(() => {
    if (pagination) {
      return filteredAndSortedGarages;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedGarages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedGarages, currentPage, itemsPerPage, pagination]);

  const totalPages = pagination?.pages ?? Math.ceil(filteredAndSortedGarages.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedGarages.length === paginatedGarages.length) {
      setSelectedGarages([]);
    } else {
      setSelectedGarages(paginatedGarages.map((g) => g._id));
    }
  };

  const handleSelectGarage = (id: string) => {
    setSelectedGarages((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  const fetchFullGarageDetails = async (id: string) => {
    try {
      await fetchGarage(id);
      await fetchGarageServices(id);
      await fetchGarageReviews(id);
      await fetchGarageBookings(id);
      await fetchGarageAnalytics(id);
    } catch (error) {
      console.error("Error fetching garage details:", error);
    }
  };

  const handleCreateGarage = async (data: CreateGaragePayload) => {
    setCreateLoading(true);
    try {
      if (propOnCreateGarage) {
        await propOnCreateGarage(data);
      } else {
        await createGarage(data);
      }
      toast.success('Garage created successfully!');
      setShowCreateModal(false);
      await refreshCurrentView();
    } catch (error: any) {
      console.error('Error creating garage:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create garage');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAction = async (
    action: string,
    id: string,
    garage?: PopulatedGarage,
    additionalData?: any
  ) => {
    setLocalActionLoading(prev => ({ ...prev, [id]: action }));

    try {
      switch (action) {
        case "view":
          setSelectedGarage(garage || null);
          setShowDetailsModal(true);
          if (garage) {
            await fetchFullGarageDetails(id);
          }
          if (propOnViewDetails) {
            propOnViewDetails(garage!);
          }
          break;

        case "verify":
          if (propOnVerify) {
            await propOnVerify(id, additionalData.status, additionalData.notes);
          } else {
            await verifyGarage(id, {
              status: additionalData.status,
              notes: additionalData.notes
            });
          }
          toast.success(`Garage ${additionalData.status === 'active' ? 'verified' : 'rejected'} successfully`);
          await refreshCurrentView();
          break;

        case "toggle":
          if (propOnToggleActive) {
            await propOnToggleActive(id);
          } else {
            await toggleActiveGarage(id);
          }
          toast.success(`Garage ${garage?.isActive ? 'deactivated' : 'activated'} successfully`);
          await refreshCurrentView();
          break;

        case "restore":
          if (propOnRestore) {
            await propOnRestore(id);
          } else {
            await restoreGarage(id);
          }
          toast.success("Garage restored successfully");
          await refreshCurrentView();
          break;

        case "delete":
          if (showDeleted) {
            if (propOnPermanentDelete) {
              await propOnPermanentDelete(id);
            } else {
              await deleteGarage(id);
            }
            toast.success("Garage permanently deleted");
          } else {
            await deleteGarage(id);
            toast.success("Garage moved to trash");
          }
          await refreshCurrentView();
          break;

        case "upload":
          if (propOnUploadFiles) {
            await propOnUploadFiles(id, additionalData.files, additionalData.type);
          } else {
            const formData = new FormData();
            Array.from(additionalData.files).forEach((file: any) => {
              formData.append('files', file);
            });
            await uploadFiles(id, formData);
          }
          toast.success("Files uploaded successfully");
          if (selectedGarage?._id === id) {
            await fetchGarage(id);
          }
          break;

        case "deleteFile":
          if (propOnDeleteFile) {
            await propOnDeleteFile(id, additionalData.filename, additionalData.type);
          } else {
            await deleteFile(id, additionalData.filename, { type: additionalData.type });
          }
          toast.success("File deleted successfully");
          if (selectedGarage?._id === id) {
            await fetchGarage(id);
          }
          break;

        case "feature":
          if (propOnFeature) {
            await propOnFeature(id);
          } else {
            toast.success(`✨ ${garage?.name} featured! (Demo feature)`);
          }
          break;
      }
    } catch (error: any) {
      console.error(`Error ${action} garage:`, error);
      toast.error(error?.response?.data?.message || error?.message || `Failed to ${action} garage`);
    } finally {
      setLocalActionLoading(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const refreshCurrentView = async () => {
    if (showComplete) {
      await fetchCompleteData();
    } else if (showDeleted) {
      await fetchDeletedGarages({ page: currentPage, limit: itemsPerPage });
    } else if (showUnverified) {
      await fetchUnverifiedGarages({ page: currentPage, limit: itemsPerPage });
    } else {
      await fetchGarages({ page: currentPage, limit: itemsPerPage });
    }
  };

  const handleBulkVerify = async () => {
    if (selectedGarages.length === 0) {
      toast.error("No garages selected");
      return;
    }

    const confirmed = window.confirm(`Verify ${selectedGarages.length} selected garages?`);
    if (!confirmed) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await Promise.all(
        selectedGarages.map(async (id) => {
          try {
            await verifyGarage(id, { status: "active" });
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      await refreshCurrentView();

      if (successCount > 0) {
        toast.success(`Successfully verified ${successCount} garages`);
      }
      if (failCount > 0) {
        toast.error(`Failed to verify ${failCount} garages`);
      }

      setSelectedGarages([]);
    } catch (error) {
      toast.error("Failed to verify some garages");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkToggleActive = async () => {
    if (selectedGarages.length === 0) {
      toast.error("No garages selected");
      return;
    }

    const action = showDeleted ? "restore" : "toggle status";
    const confirmed = window.confirm(`Update ${selectedGarages.length} selected garages?`);
    if (!confirmed) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await Promise.all(
        selectedGarages.map(async (id) => {
          try {
            if (showDeleted) {
              await restoreGarage(id);
            } else {
              await toggleActiveGarage(id);
            }
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      await refreshCurrentView();

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} garages`);
      }
      if (failCount > 0) {
        toast.error(`Failed to update ${failCount} garages`);
      }

      setSelectedGarages([]);
    } catch (error) {
      toast.error("Failed to update some garages");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGarages.length === 0) {
      toast.error("No garages selected");
      return;
    }

    const action = showDeleted ? "permanently delete" : "move to trash";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedGarages.length} garages?`
    );
    if (!confirmed) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await Promise.all(
        selectedGarages.map(async (id) => {
          try {
            await deleteGarage(id);
            successCount++;
          } catch (error) {
            failCount++;
          }
        })
      );

      await refreshCurrentView();

      if (successCount > 0) {
        toast.success(`Successfully ${action} ${successCount} garages`);
      }
      if (failCount > 0) {
        toast.error(`Failed to ${action} ${failCount} garages`);
      }

      setSelectedGarages([]);
    } catch (error) {
      toast.error(`Failed to ${action} some garages`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const isActionLoading = (id: string, action: string) => {
    return actionLoading[id] === action;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <HiOutlineBuildingOffice className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            {showComplete ? 'Loading complete data...' : 'Loading garages...'}
          </p>
          <p className="text-sm text-gray-400">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <HiOutlineXCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Garages</h3>
          <p className="text-red-600 bg-red-50 rounded-lg p-4 max-w-md mx-auto text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showComplete && completeData) {
    const stats = completeData.stats;
    const collections = completeData.collections;

    return (
      <div className="space-y-4 md:space-y-6">
        <AnimatePresence>
          {showCompleteStatsModal && (
            <CompleteStatsModal
              isOpen={showCompleteStatsModal}
              onClose={() => setShowCompleteStatsModal(false)}
              stats={stats}
              collections={collections}
            />
          )}
        </AnimatePresence>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Complete Garage Data Overview</h2>
            <button
              onClick={() => setShowCompleteStatsModal(true)}
              className="px-4 md:px-6 py-2.5 md:py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <HiOutlineChartBar className="w-5 h-5" />
              View Detailed Statistics
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <HiOutlineBuildingStorefront className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Garages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGarages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVerified}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiOutlineWrench className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.services.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatETB(stats.bookings.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Garage Status Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold text-green-600">{stats.totalActive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inactive</span>
                <span className="font-semibold text-gray-600">{stats.totalInactive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deleted</span>
                <span className="font-semibold text-red-600">{stats.totalDeleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{stats.totalPending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Suspended</span>
                <span className="font-semibold text-red-600">{stats.totalSuspended}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Status Distribution</h3>
            <div className="space-y-2">
              {Object.entries(stats.bookings.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{status}</span>
                  <span className="font-semibold">{formatNumber(count as number)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Upcoming</span>
                <span className="font-semibold text-blue-600">{formatNumber(stats.bookings.upcoming)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Services by Category</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(stats.services.byCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-semibold">{formatNumber(count as number)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Review Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-semibold">{formatNumber(stats.reviews.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold text-yellow-600">{stats.reviews.averageRating.toFixed(1)} ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">With Response</span>
                <span className="font-semibold text-green-600">{formatNumber(stats.reviews.withResponse)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Collections</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{formatNumber(collections?.services?.length || 0)}</p>
              <p className="text-xs text-gray-600">Services</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{formatNumber(collections?.bookings?.length || 0)}</p>
              <p className="text-xs text-gray-600">Bookings</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{formatNumber(collections?.reviews?.length || 0)}</p>
              <p className="text-xs text-gray-600">Reviews</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{formatNumber(collections?.payments?.length || 0)}</p>
              <p className="text-xs text-gray-600">Payments</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{formatNumber(collections?.owners?.length || 0)}</p>
              <p className="text-xs text-gray-600">Owners</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Database Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-500">With Coordinates</p>
              <p className="text-lg font-semibold">{completeData.metadata.databaseStats.garagesWithCoordinates}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">With Images</p>
              <p className="text-lg font-semibold">{completeData.metadata.databaseStats.garagesWithImages}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">With Documents</p>
              <p className="text-lg font-semibold">{completeData.metadata.databaseStats.garagesWithDocuments}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">With Services</p>
              <p className="text-lg font-semibold">{completeData.metadata.databaseStats.garagesWithServices}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Generated: {new Date(completeData.metadata.generatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  if (garageList.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-16">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl mb-6">
            <HiOutlineBuildingStorefront className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {showDeleted ? "Trash is empty" : showUnverified ? "No unverified garages" : "No garages found"}
          </h3>
          <p className="text-gray-500 mb-6 text-sm">
            {showDeleted
              ? "Deleted garages will appear here"
              : showUnverified
                ? "All garages have been verified"
                : "Get started by adding your first garage to the platform"}
          </p>
          {!showDeleted && !showUnverified && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all inline-flex items-center gap-2"
            >
              <HiOutlineBuildingStorefront className="w-5 h-5" />
              Create First Garage
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <AnimatePresence>
        {showCreateModal && (
          <CreateGarageModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateGarage}
            loading={createLoading}
          />
        )}

        {showDetailsModal && selectedGarage && (
          <DetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedGarage(null);
            }}
            garage={selectedGarage}
            onAction={handleAction}
            actionLoading={actionLoading}
          />
        )}

        {showVerificationModal && selectedGarage && (
          <VerificationModal
            isOpen={showVerificationModal}
            onClose={() => {
              setShowVerificationModal(false);
              setSelectedGarage(null);
            }}
            onConfirm={(status, notes) => {
              handleAction("verify", selectedGarage._id, selectedGarage, { status, notes });
              setShowVerificationModal(false);
            }}
            garageName={selectedGarage.name}
            loading={isActionLoading(selectedGarage._id, 'verify')}
          />
        )}

        {showUploadModal && selectedGarage && (
          <FileUploadModal
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedGarage(null);
            }}
            onUpload={(files, type) => {
              handleAction("upload", selectedGarage._id, selectedGarage, { files, type });
            }}
            garageName={selectedGarage.name}
            type={uploadType}
            loading={isActionLoading(selectedGarage._id, 'upload')}
          />
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {!showComplete && (
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${showDeleted ? "deleted" : showUnverified ? "unverified" : ""} garages...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-80 xl:w-96 pl-12 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          )}

          {showComplete && (
            <div className="flex-1 w-full lg:w-auto">
              <h2 className="text-xl font-bold text-gray-900">Complete Garage Data Overview</h2>
              <p className="text-sm text-gray-500">All data without any filters or conditions</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
            {!showDeleted && !showUnverified && !showComplete && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 lg:flex-none px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>

                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-") as [SortField, SortOrder];
                    setSortField(field);
                    setSortOrder(order);
                  }}
                  className="flex-1 lg:flex-none px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="createdAt-desc">Newest</option>
                  <option value="createdAt-asc">Oldest</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="rating-asc">Lowest Rated</option>
                  <option value="bookings-desc">Most Bookings</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.location.href = window.location.pathname;
                }}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${!showComplete && !showDeleted && !showUnverified
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Regular View"
              >
                <HiOutlineBuildingStorefront className="w-5 h-5" />
                <span className="hidden sm:inline">Garages</span>
              </button>

              <button
                onClick={() => {
                  if (showComplete) {
                    window.location.href = window.location.pathname;
                  } else {
                    window.location.href = `${window.location.pathname}?view=complete`;
                  }
                }}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${showComplete
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Complete Data View (No Filters)"
              >
                <HiOutlineDatabase className="w-5 h-5" />
                <span className="hidden sm:inline">Complete Data</span>
              </button>

              <button
                onClick={() => {
                  if (showDeleted) {
                    window.location.href = window.location.pathname;
                  } else {
                    window.location.href = `${window.location.pathname}?deleted=true`;
                  }
                }}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${showDeleted
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Deleted Garages"
              >
                <HiOutlineTrash className="w-5 h-5" />
                <span className="hidden sm:inline">Deleted</span>
              </button>

              <button
                onClick={() => {
                  if (showUnverified) {
                    window.location.href = window.location.pathname;
                  } else {
                    window.location.href = `${window.location.pathname}?unverified=true`;
                  }
                }}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${showUnverified
                    ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Unverified Garages"
              >
                <HiOutlineShieldCheck className="w-5 h-5" />
                <span className="hidden sm:inline">Unverified</span>
              </button>
            </div>

            {!showDeleted && !showUnverified && !showComplete && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-indigo-200"
              >
                <HiOutlineBuildingStorefront className="w-5 h-5" />
                <span className="hidden sm:inline">Create Garage</span>
              </button>
            )}
          </div>
        </div>

        {priceRange && !showDeleted && !showUnverified && !showComplete && (
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price Range:</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-700">Min: <span className="font-semibold text-indigo-600">{formatETB(priceRange.minPrice)}</span></span>
                <span className="text-gray-700">Avg: <span className="font-semibold text-indigo-600">{formatETB(priceRange.avgPrice)}</span></span>
                <span className="text-gray-700">Max: <span className="font-semibold text-indigo-600">{formatETB(priceRange.maxPrice)}</span></span>
              </div>
            </div>
          </div>
        )}

        {!showComplete && selectedGarages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-200 rounded-full flex items-center justify-center">
                  <span className="text-xs md:text-sm font-semibold text-indigo-700">
                    {selectedGarages.length}
                  </span>
                </div>
                <span className="text-sm md:text-base font-medium text-gray-700">garages selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {!showDeleted && !showUnverified && (
                  <>
                    <button
                      onClick={handleBulkVerify}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineCheckCircle className="w-4 h-4" />
                      )}
                      <span className="hidden xs:inline">Verify All</span>
                    </button>
                    <button
                      onClick={handleBulkToggleActive}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineRefresh className="w-4 h-4" />
                      )}
                      <span className="hidden xs:inline">Toggle All</span>
                    </button>
                  </>
                )}
                {showDeleted ? (
                  <>
                    <button
                      onClick={handleBulkToggleActive}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineRefresh className="w-4 h-4" />
                      )}
                      <span className="hidden xs:inline">Restore All</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineTrash className="w-4 h-4" />
                      )}
                      <span className="hidden xs:inline">Delete All</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkActionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiOutlineArchive className="w-4 h-4" />
                    )}
                    <span className="hidden xs:inline">Trash All</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedGarages([])}
                  disabled={bulkActionLoading}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs md:text-sm disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {!showDeleted && !showUnverified && !showComplete && (
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 min-w-max md:min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineBuildingOffice className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{garageList.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Verified</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {garageList.filter(g => g.isVerified).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineUserGroup className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {garageList.filter(g => g.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineStar className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {(garageList.reduce((acc, g) => acc + (g.stats?.averageRating || 0), 0) / garageList.length || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 w-40 md:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineCurrencyDollar className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Price</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {priceRange ? formatETB(priceRange.avgPrice) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showComplete && (
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedGarages.length === paginatedGarages.length && paginatedGarages.length > 0}
                      onChange={handleSelectAll}
                      disabled={bulkActionLoading}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Garage Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {paginatedGarages.map((garage, index) => {
                    const owner = typeof garage.owner === "object" ? garage.owner : null;
                    const isSelected = selectedGarages.includes(garage._id);
                    const isLoading = isActionLoading(garage._id, 'verify') ||
                      isActionLoading(garage._id, 'toggle') ||
                      isActionLoading(garage._id, 'feature') ||
                      isActionLoading(garage._id, 'delete') ||
                      isActionLoading(garage._id, 'restore') ||
                      isActionLoading(garage._id, 'upload');
                    const isOpen = isGarageOpenNow(garage.businessHours);

                    return (
                      <motion.tr
                        key={garage._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group hover:bg-indigo-50/30 transition-colors ${isSelected ? "bg-indigo-50/50" : ""
                          } ${isLoading ? "opacity-50" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectGarage(garage._id)}
                            disabled={bulkActionLoading || isLoading}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <HiOutlineBuildingStorefront className="w-6 h-6" />
                              </div>
                              {garage.isVerified && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => handleAction("view", garage._id, garage)}
                                className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-left"
                              >
                                {garage.name}
                              </button>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                  ID: {garage._id.slice(-6)}
                                </span>
                                {garage.stats?.averageRating > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                                    <HiOutlineStar className="w-3 h-3" />
                                    {garage.stats.averageRating.toFixed(1)}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {isOpen ? 'Open Now' : 'Closed'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {owner ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                <HiOutlineUser className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate max-w-[120px]">
                                  {owner.name}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[120px]">
                                  <HiOutlineMail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{owner.email}</span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <HiOutlinePhone className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{owner.phone}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {garage.address ? (
                            <div className="flex items-start gap-2">
                              <HiOutlineMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm text-gray-900 truncate max-w-[120px]">
                                  {garage.address.street}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                  {garage.address.city}, {garage.address.state}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                  {garage.address.zipCode}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No address</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <HiOutlineWrench className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900">
                                {garage.services?.length || 0} services
                              </span>
                            </div>
                            {garage.services && garage.services.length > 0 && (
                              <>
                                <div className="flex items-center gap-2">
                                  <HiOutlineCurrencyDollar className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 font-medium">
                                    From {formatETB(Math.min(...garage.services.map(s => s.price)))}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {[...new Set(garage.services.map(s => s.category))].slice(0, 2).map(cat => (
                                    <span key={cat} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2 min-w-[120px]">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Bookings</span>
                              <span className="font-semibold text-gray-900">
                                {garage.stats?.totalBookings || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Completed</span>
                              <span className="font-semibold text-green-600">
                                {garage.stats?.completedBookings || 0}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((garage.stats?.completedBookings || 0) /
                                      (garage.stats?.totalBookings || 1)) *
                                    100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <HiOutlineCheckCircle className="w-3 h-3 text-green-500" />
                              Completion Rate
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${garage.isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"
                                  }`}
                              />
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${garage.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                  }`}
                              >
                                {garage.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${garage.isVerified ? "bg-blue-500" : "bg-yellow-500"
                                  }`}
                              />
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${garage.isVerified
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                                  }`}
                              >
                                {garage.isVerified ? "Verified" : "Unverified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${garage.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  garage.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    garage.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                }`}>
                                {garage.status}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAction("view", garage._id, garage)}
                              disabled={isLoading}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-5 h-5" />
                            </motion.button>

                            {!showDeleted && !showUnverified ? (
                              <>
                                {!garage.isVerified && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setSelectedGarage(garage);
                                      setShowVerificationModal(true);
                                    }}
                                    disabled={isLoading}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Verify Garage"
                                  >
                                    {isActionLoading(garage._id, 'verify') ? (
                                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <HiOutlineShieldCheck className="w-5 h-5" />
                                    )}
                                  </motion.button>
                                )}

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAction("toggle", garage._id, garage)}
                                  disabled={isLoading}
                                  className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${garage.isActive
                                      ? "text-orange-600 hover:bg-orange-50"
                                      : "text-blue-600 hover:bg-blue-50"
                                    }`}
                                  title={garage.isActive ? "Deactivate" : "Activate"}
                                >
                                  {isActionLoading(garage._id, 'toggle') ? (
                                    <div className={`w-5 h-5 border-2 ${garage.isActive ? 'border-orange-600' : 'border-blue-600'} border-t-transparent rounded-full animate-spin`} />
                                  ) : (
                                    <HiOutlineRefresh className="w-5 h-5" />
                                  )}
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedGarage(garage);
                                    setUploadType("images");
                                    setShowUploadModal(true);
                                  }}
                                  disabled={isLoading}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all disabled:opacity-50"
                                  title="Upload Images"
                                >
                                  <HiOutlinePhotograph className="w-5 h-5" />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedGarage(garage);
                                    setUploadType("documents");
                                    setShowUploadModal(true);
                                  }}
                                  disabled={isLoading}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50"
                                  title="Upload Documents"
                                >
                                  <HiOutlineDocumentText className="w-5 h-5" />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAction("feature", garage._id, garage)}
                                  disabled={isLoading}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Feature Garage"
                                >
                                  {isActionLoading(garage._id, 'feature') ? (
                                    <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <HiOutlineStar className="w-5 h-5" />
                                  )}
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAction("delete", garage._id, garage)}
                                  disabled={isLoading}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete Garage"
                                >
                                  {isActionLoading(garage._id, 'delete') ? (
                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <HiOutlineArchive className="w-5 h-5" />
                                  )}
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAction("restore", garage._id, garage)}
                                  disabled={isLoading}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Restore Garage"
                                >
                                  {isActionLoading(garage._id, 'restore') ? (
                                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <HiOutlineRefresh className="w-5 h-5" />
                                  )}
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAction("delete", garage._id, garage)}
                                  disabled={isLoading}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Permanently Delete"
                                >
                                  {isActionLoading(garage._id, 'delete') ? (
                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <HiOutlineTrash className="w-5 h-5" />
                                  )}
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!showComplete && (
        <div className="lg:hidden space-y-3">
          <AnimatePresence>
            {paginatedGarages.map((garage, index) => {
              const owner = typeof garage.owner === "object" ? garage.owner : null;
              const isSelected = selectedGarages.includes(garage._id);
              const isExpanded = expandedRow === garage._id;
              const isLoading = isActionLoading(garage._id, 'verify') ||
                isActionLoading(garage._id, 'toggle') ||
                isActionLoading(garage._id, 'feature') ||
                isActionLoading(garage._id, 'delete') ||
                isActionLoading(garage._id, 'restore') ||
                isActionLoading(garage._id, 'upload');
              const isOpen = isGarageOpenNow(garage.businessHours);

              return (
                <motion.div
                  key={garage._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-white rounded-xl shadow-sm border ${isSelected ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200"
                    } overflow-hidden ${isLoading ? "opacity-50" : ""}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                          <HiOutlineBuildingStorefront className="w-6 h-6" />
                        </div>
                        {garage.isVerified && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <button
                              onClick={() => handleAction("view", garage._id, garage)}
                              className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-left"
                            >
                              {garage.name}
                            </button>
                            <p className="text-xs text-gray-500 mt-0.5">
                              ID: {garage._id.slice(-8)}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectGarage(garage._id)}
                            disabled={bulkActionLoading || isLoading}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ml-2 disabled:opacity-50"
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {garage.stats?.averageRating > 0 && (
                            <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                              <HiOutlineStar className="w-3 h-3" />
                              {garage.stats.averageRating.toFixed(1)}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${garage.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                            }`}>
                            {garage.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${garage.isVerified
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {garage.isVerified ? "Verified" : "Pending"}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {owner?.name || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {garage.address?.city || "No location"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineWrench className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {garage.services?.length || 0} services
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineCurrencyDollar className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 font-medium">
                          {garage.services?.length > 0
                            ? formatETB(Math.min(...garage.services.map(s => s.price)))
                            : "N/A"
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {garage.stats?.totalBookings || 0} bookings
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {garage.contactInfo?.phone || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction("view", garage._id, garage)}
                        disabled={isLoading}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50"
                      >
                        <HiOutlineEye className="w-5 h-5" />
                      </motion.button>

                      {!showDeleted && !showUnverified ? (
                        <>
                          {!garage.isVerified && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedGarage(garage);
                                setShowVerificationModal(true);
                              }}
                              disabled={isLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                            >
                              {isActionLoading(garage._id, 'verify') ? (
                                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiOutlineShieldCheck className="w-5 h-5" />
                              )}
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction("toggle", garage._id, garage)}
                            disabled={isLoading}
                            className={`p-2 rounded-lg disabled:opacity-50 ${garage.isActive
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-blue-600 hover:bg-blue-50"
                              }`}
                          >
                            {isActionLoading(garage._id, 'toggle') ? (
                              <div className={`w-5 h-5 border-2 ${garage.isActive ? 'border-orange-600' : 'border-blue-600'} border-t-transparent rounded-full animate-spin`} />
                            ) : (
                              <HiOutlineRefresh className="w-5 h-5" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedGarage(garage);
                              setUploadType("images");
                              setShowUploadModal(true);
                            }}
                            disabled={isLoading}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                          >
                            <HiOutlinePhotograph className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedGarage(garage);
                              setUploadType("documents");
                              setShowUploadModal(true);
                            }}
                            disabled={isLoading}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
                          >
                            <HiOutlineDocumentText className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction("delete", garage._id, garage)}
                            disabled={isLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            {isActionLoading(garage._id, 'delete') ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineArchive className="w-5 h-5" />
                            )}
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction("restore", garage._id, garage)}
                            disabled={isLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                          >
                            {isActionLoading(garage._id, 'restore') ? (
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineRefresh className="w-5 h-5" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction("delete", garage._id, garage)}
                            disabled={isLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            {isActionLoading(garage._id, 'delete') ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineTrash className="w-5 h-5" />
                            )}
                          </motion.button>
                        </>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedRow(isExpanded ? null : garage._id)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-auto disabled:opacity-50"
                      >
                        <HiOutlineCog className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="text-gray-500">Description:</span>
                              <p className="text-gray-700 mt-1">{garage.description || "No description"}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-gray-500">Contact:</span>
                                <p className="font-medium text-gray-900">{garage.contactInfo?.phone || "N/A"}</p>
                                <p className="text-xs text-gray-500">{garage.contactInfo?.email}</p>
                                {garage.contactInfo?.website && (
                                  <p className="text-xs text-indigo-600 truncate">{garage.contactInfo.website}</p>
                                )}
                              </div>
                              <div>
                                <span className="text-gray-500">Created:</span>
                                <p className="font-medium text-gray-900">
                                  {new Date(garage.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(garage.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>

                            <div>
                              <span className="text-gray-500">Full Address:</span>
                              {garage.address ? (
                                <p className="text-gray-700 mt-1">
                                  {garage.address.street}, {garage.address.city}, {garage.address.state}, {garage.address.country} {garage.address.zipCode}
                                </p>
                              ) : (
                                <p className="text-gray-400 mt-1">No address provided</p>
                              )}
                            </div>

                            <div>
                              <span className="text-gray-500">Business Hours:</span>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                {garage.businessHours && Object.entries(garage.businessHours).map(([day, hours]) => (
                                  <div key={day} className="flex justify-between">
                                    <span className="capitalize text-gray-500">{day.slice(0, 3)}:</span>
                                    <span className="text-gray-700">
                                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-gray-500">Performance Stats:</span>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Total Bookings</span>
                                  <span className="font-semibold">{garage.stats?.totalBookings || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Completed</span>
                                  <span className="font-semibold text-green-600">{garage.stats?.completedBookings || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Avg Rating</span>
                                  <span className="font-semibold text-yellow-600">{garage.stats?.averageRating.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Total Reviews</span>
                                  <span className="font-semibold">{garage.stats?.totalReviews || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <span className="text-gray-500">Files:</span>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-700">
                                  Images: {garage.images?.length || 0} | Documents: {garage.documents?.length || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!showComplete && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            {pagination ? (
              <>
                Page {pagination.page} of {pagination.pages} |
                Total {pagination.total} garages
              </>
            ) : (
              <>
                Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedGarages.length)} of{" "}
                {filteredAndSortedGarages.length} garages
              </>
            )}
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || bulkActionLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
            >
              Previous
            </motion.button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = currentPage;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={bulkActionLoading}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                      } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || bulkActionLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
            >
              Next
            </motion.button>
          </div>
        </div>
      )}

      {!showComplete && (
        <div className="text-center text-xs text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      )}
    </div>
  );
}