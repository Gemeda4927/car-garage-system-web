"use client";

import { JSX, useEffect, useState } from "react";
import { useGarage } from "@/lib/hooks/useGarage";
import { useAuthStore } from "@/lib/store/auth.store";
import { usePaymentStore } from "@/lib/store/payment.store";
import toast, { Toaster } from "react-hot-toast";
import type { Address, BusinessHours, BusinessDay } from "@/lib/types/garage.types";

interface GarageInfo {
  name: string;
  address: string;
  phone: string;
  description: string;
  website?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  businessHours?: BusinessHours;
}

interface GarageTabProps {
  garageInfo: GarageInfo;
  onUpdate: (info: GarageInfo) => void;
}

// Days of the week
const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

// Default business hours
const DEFAULT_DAY: BusinessDay = { open: "09:00", close: "18:00", closed: false };
const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { ...DEFAULT_DAY },
  tuesday: { ...DEFAULT_DAY },
  wednesday: { ...DEFAULT_DAY },
  thursday: { ...DEFAULT_DAY },
  friday: { ...DEFAULT_DAY },
  saturday: { open: "10:00", close: "16:00", closed: false },
  sunday: { open: "", close: "", closed: true },
};

// City coordinates mapping
const CITY_COORDINATES: Record<string, [number, number]> = {
  "Addis Ababa": [38.7832, 9.0256],
  "Jimma": [36.8344, 7.6736],
  "Bahir Dar": [37.3904, 11.5742],
  "Gondar": [37.4624, 12.6030],
  "Hawassa": [38.4763, 7.0621],
  "Mekelle": [39.4753, 13.4967],
  "Dire Dawa": [41.8663, 9.6009],
  "Adama": [39.2700, 8.5400],
  "Debre Birhan": [39.5278, 9.6800],
  "Arba Minch": [37.5544, 6.0333],
};

export default function GarageTab({ garageInfo, onUpdate }: GarageTabProps): JSX.Element {
  const [formData, setFormData] = useState<GarageInfo>({
    ...garageInfo,
    city: garageInfo.city || "Addis Ababa",
    state: garageInfo.state || "Addis Ababa",
    country: garageInfo.country || "Ethiopia",
    zipCode: garageInfo.zipCode || "",
    businessHours: garageInfo.businessHours || DEFAULT_BUSINESS_HOURS,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userOwnedGarage, setUserOwnedGarage] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { user, token, isAuthenticated } = useAuthStore();
  const { 
    garage: userGarage, 
    garages, 
    fetchGarages, 
    updateGarage,
    createGarage,
    deleteGarage,
    loading: garageLoading,
    clearError
  } = useGarage();

  const {
    loading: paymentLoading,
    initializeGaragePayment,
    clearPayment
  } = usePaymentStore();

  const hasGarage = userOwnedGarage !== null;
  const canCreateGarage = user?.canCreateGarage === true;
  const GARAGE_CREATION_FEE = 500;

  // Fetch and filter garages to find user's garage
  useEffect(() => {
    const findUserGarage = async () => {
      if (!user?.id) {
        setInitialLoading(false);
        return;
      }

      try {
        if (garages.length > 0) {
          const foundGarage = garages.find(garage => {
            if (typeof garage.owner === 'string') {
              return garage.owner === user.id;
            }
            if (garage.owner && typeof garage.owner === 'object') {
              return garage.owner._id === user.id;
            }
            return false;
          });

          if (foundGarage) {
            setUserOwnedGarage(foundGarage);
            setInitialLoading(false);
            return;
          }
        }
        
        await fetchGarages();
      } catch (error) {
        console.error("Error fetching user garage:", error);
        setInitialLoading(false);
      }
    };

    findUserGarage();
  }, [user, fetchGarages]);

  // Handle when garages are loaded/updated
  useEffect(() => {
    if (!user?.id || garages.length === 0) return;

    const foundGarage = garages.find(garage => {
      if (typeof garage.owner === 'string') {
        return garage.owner === user.id;
      }
      if (garage.owner && typeof garage.owner === 'object') {
        return garage.owner._id === user.id;
      }
      return false;
    });

    if (foundGarage) {
      setUserOwnedGarage(foundGarage);
      setInitialLoading(false);
    } else {
      setUserOwnedGarage(null);
      setInitialLoading(false);
    }
  }, [garages, user]);

  // Check store's garage
  useEffect(() => {
    if (userGarage && user?.id) {
      const ownerId = typeof userGarage.owner === 'string' ? userGarage.owner : userGarage.owner?._id;
      if (ownerId === user.id) {
        setUserOwnedGarage(userGarage);
        setInitialLoading(false);
      }
    }
  }, [userGarage, user]);

  const handleEditClick = () => {
    if (userOwnedGarage) {
      setFormData({
        name: userOwnedGarage.name || "",
        address: userOwnedGarage.address?.street || "",
        phone: userOwnedGarage.contactInfo?.phone || "",
        description: userOwnedGarage.description || "",
        website: userOwnedGarage.contactInfo?.website || "",
        city: userOwnedGarage.address?.city || "Addis Ababa",
        state: userOwnedGarage.address?.state || "Addis Ababa",
        country: userOwnedGarage.address?.country || "Ethiopia",
        zipCode: userOwnedGarage.address?.zipCode || "",
        businessHours: userOwnedGarage.businessHours || DEFAULT_BUSINESS_HOURS,
      });
    }
    setShowEditForm(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError?.();
    
    if (!userOwnedGarage?._id) {
      toast.error("Garage ID not found");
      return;
    }

    if (!formData.name?.trim()) {
      toast.error("Please enter your garage name");
      return;
    }
    
    if (!formData.address?.trim()) {
      toast.error("Please enter your garage address");
      return;
    }
    
    if (!formData.phone?.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      setIsProcessing(true);
      
      const updatePayload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        address: {
          street: formData.address.trim(),
          city: formData.city || "Addis Ababa",
          state: formData.state || "Addis Ababa",
          country: formData.country || "Ethiopia",
          zipCode: formData.zipCode || "",
        },
        contactInfo: {
          phone: formData.phone.trim(),
          email: user?.email || "",
          website: formData.website?.trim() || "",
        },
        businessHours: formData.businessHours!,
      };
      
      const updatedGarage = await updateGarage(userOwnedGarage._id, updatePayload);
      
      if (updatedGarage) {
        toast.success("Garage updated successfully!");
        setUserOwnedGarage(updatedGarage);
        setShowEditForm(false);
        onUpdate(formData);
        await fetchGarages();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update garage");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteGarage = async () => {
    if (!userOwnedGarage?._id) return;
    
    try {
      setIsDeleting(true);
      await deleteGarage(userOwnedGarage._id);
      
      toast.success("Garage deleted successfully!");
      setUserOwnedGarage(null);
      setShowDeleteConfirm(false);
      onUpdate({ name: "", address: "", phone: "", description: "" });
      await fetchGarages();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete garage");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError?.();
    clearPayment?.();
    
    if (!formData.name?.trim()) {
      toast.error("Please enter your garage name");
      return;
    }
    
    if (!formData.address?.trim()) {
      toast.error("Please enter your garage address");
      return;
    }
    
    if (!formData.phone?.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!canCreateGarage) {
      await handlePaymentWithData();
    } else {
      await createGarageDirectly();
    }
  };

  const handlePaymentWithData = async () => {
    try {
      setIsProcessing(true);
      
      const garageDataForPayment = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        website: formData.website?.trim() || "",
        city: formData.city || "Addis Ababa",
        state: formData.state || "Addis Ababa",
        country: formData.country || "Ethiopia",
        zipCode: formData.zipCode || "",
        businessHours: formData.businessHours,
      };
      
      sessionStorage.setItem('pendingGarageData', JSON.stringify(garageDataForPayment));
      
      const checkoutUrl = await initializeGaragePayment(GARAGE_CREATION_FEE);
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to initialize payment");
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Payment initialization failed");
      setIsProcessing(false);
    }
  };

  const createGarageDirectly = async () => {
    try {
      setIsProcessing(true);
      
      const newGarage = await createGarage({
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        coordinates: getCoordinatesForCity(formData.city || "Addis Ababa"),
        address: {
          street: formData.address.trim(),
          city: formData.city || "Addis Ababa",
          state: formData.state || "Addis Ababa",
          country: formData.country || "Ethiopia",
          zipCode: formData.zipCode || "",
        },
        contactInfo: {
          phone: formData.phone.trim(),
          email: user?.email || "",
          website: formData.website?.trim() || "",
        },
        businessHours: formData.businessHours!,
      });
      
      if (newGarage) {
        toast.success("Garage created successfully! Pending verification.");
        setShowCreateForm(false);
        setUserOwnedGarage(newGarage);
        onUpdate(formData);
        await fetchGarages();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create garage");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check for pending garage data after payment callback
  useEffect(() => {
    const checkPendingGarage = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('status');
      const txRef = urlParams.get('tx_ref');
      
      if (paymentStatus === 'success' && txRef) {
        const pendingData = sessionStorage.getItem('pendingGarageData');
        
        if (pendingData) {
          const garageData = JSON.parse(pendingData);
          
          try {
            const newGarage = await createGarage({
              name: garageData.name,
              description: garageData.description,
              coordinates: getCoordinatesForCity(garageData.city || "Addis Ababa"),
              address: {
                street: garageData.address,
                city: garageData.city || "Addis Ababa",
                state: garageData.state || "Addis Ababa",
                country: garageData.country || "Ethiopia",
                zipCode: garageData.zipCode || "",
              },
              contactInfo: {
                phone: garageData.phone,
                email: user?.email || "",
                website: garageData.website,
              },
              businessHours: garageData.businessHours || DEFAULT_BUSINESS_HOURS,
            });
            
            if (newGarage) {
              sessionStorage.removeItem('pendingGarageData');
              toast.success("Payment successful! Garage created and pending verification.");
              setShowCreateForm(false);
              setUserOwnedGarage(newGarage);
              onUpdate(garageData);
              window.history.replaceState({}, document.title, window.location.pathname);
              await fetchGarages();
            }
          } catch (error) {
            toast.error("Payment successful but garage creation failed");
          }
        }
      } else if (paymentStatus === 'cancelled') {
        sessionStorage.removeItem('pendingGarageData');
        toast.error("Payment was cancelled");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    checkPendingGarage();
  }, [createGarage, user, onUpdate, fetchGarages]);

  const getCoordinatesForCity = (city: string): [number, number] => {
    return CITY_COORDINATES[city] || [38.7832, 9.0256];
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setFormData({
      name: "",
      address: "",
      phone: "",
      description: "",
      website: "",
      city: "Addis Ababa",
      state: "Addis Ababa",
      country: "Ethiopia",
      zipCode: "",
      businessHours: DEFAULT_BUSINESS_HOURS,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBusinessHourChange = (
    day: keyof BusinessHours,
    field: keyof BusinessDay,
    value: string | boolean
  ) => {
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours!,
        [day]: {
          ...formData.businessHours![day],
          [field]: value,
        },
      },
    });
  };

  const handleToggleClosed = (day: keyof BusinessHours) => {
    const isCurrentlyClosed = formData.businessHours![day].closed;
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours!,
        [day]: {
          ...formData.businessHours![day],
          closed: !isCurrentlyClosed,
        },
      },
    });
  };

  const isLoading = garageLoading || paymentLoading || isProcessing || isDeleting;

  // Initial loading state
  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Toaster position="top-right" />
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading garage information...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <Toaster position="top-right" />
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6-4h12m-6 0v-4m0 4h-4m4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to manage your garage.</p>
        </div>
      </div>
    );
  }

  // Garage Card View
  if (hasGarage && !showEditForm && !showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <Toaster position="top-right" />
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Garage</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{userOwnedGarage?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteGarage}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Your Garage</h2>
              {userOwnedGarage?.status === "pending" && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Pending Verification
                </span>
              )}
              {userOwnedGarage?.status === "active" && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Garage Name */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{userOwnedGarage?.name}</h3>
              <p className="text-gray-600">{userOwnedGarage?.description}</p>
            </div>

            {/* Address */}
            <div className="border-t border-gray-200 py-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-gray-800">
                    {userOwnedGarage?.address?.street}, {userOwnedGarage?.address?.city}, {userOwnedGarage?.address?.state}<br />
                    {userOwnedGarage?.address?.country} - {userOwnedGarage?.address?.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-gray-200 py-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="text-gray-800">{userOwnedGarage?.contactInfo?.phone}</p>
                  <p className="text-gray-800">{userOwnedGarage?.contactInfo?.email}</p>
                  {userOwnedGarage?.contactInfo?.website && (
                    <a href={`https://${userOwnedGarage?.contactInfo?.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {userOwnedGarage?.contactInfo?.website}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="border-t border-gray-200 py-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">Business Hours</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {DAYS.map(({ key, label }) => {
                      const day = userOwnedGarage?.businessHours?.[key];
                      const isClosed = day?.closed;
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{label}:</span>
                          <span className={isClosed ? "text-red-500" : "text-gray-800"}>
                            {isClosed ? "Closed" : `${day?.open} - ${day?.close}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            {userOwnedGarage?.stats && (
              <div className="border-t border-gray-200 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{userOwnedGarage.stats.totalBookings || 0}</p>
                    <p className="text-xs text-gray-500">Total Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{userOwnedGarage.stats.averageRating || 0}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{userOwnedGarage.stats.totalReviews || 0}</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6 mt-2 flex gap-3">
              <button
                onClick={handleEditClick}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                Edit Garage
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Form View
  if (hasGarage && showEditForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <Toaster position="top-right" />
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Garage Information</h2>
            <p className="text-gray-500 mt-1">Update your garage details</p>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garage Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {Object.keys(CITY_COORDINATES).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours
              </label>
              <div className="space-y-3">
                {DAYS.map(({ key, label }) => {
                  const day = formData.businessHours![key];
                  const isClosed = day.closed;
                  
                  return (
                    <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <span className="font-medium text-gray-700">{label}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!isClosed}
                            onChange={() => handleToggleClosed(key)}
                            className="w-4 h-4 text-blue-600 rounded"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-gray-600">Open</span>
                        </label>
                      </div>
                      
                      {!isClosed && (
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={day.open}
                            onChange={(e) => handleBusinessHourChange(key, 'open', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                            disabled={isLoading}
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={day.close}
                            onChange={(e) => handleBusinessHourChange(key, 'close', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                      
                      {isClosed && (
                        <span className="text-sm text-gray-500 italic">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Garage"
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Create Form View
  if (!hasGarage && !showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <Toaster position="top-right" />
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Garage Found
          </h3>
          <p className="text-gray-600 mb-6">
            {canCreateGarage 
              ? "You haven't created a garage yet. Start by creating one now (Free)."
              : `You haven't created a garage yet. A one-time fee of ${GARAGE_CREATION_FEE} ETB is required to create a garage.`}
          </p>
          <button
            onClick={handleCreateClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            Create New Garage
          </button>
        </div>
      </div>
    );
  }

  // Create Form
  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Your Garage</h2>
          <p className="text-gray-500 mt-1">
            {canCreateGarage 
              ? "Fill in the details to create your garage profile (Free)"
              : `Fill in the details to create your garage profile (Fee: ${GARAGE_CREATION_FEE} ETB)`}
          </p>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Garage Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Jimma Prime Auto Care"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Hermata Mentina Road"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                {Object.keys(CITY_COORDINATES).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Oromia"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ethiopia"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="378"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+251911223344"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="url"
              name="website"
              value={formData.website || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="www.example.com"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Business Hours
            </label>
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => {
                const day = formData.businessHours![key];
                const isClosed = day.closed;
                
                return (
                  <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!isClosed}
                          onChange={() => handleToggleClosed(key)}
                          className="w-4 h-4 text-blue-600 rounded"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </label>
                    </div>
                    
                    {!isClosed && (
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          value={day.open}
                          onChange={(e) => handleBusinessHourChange(key, 'open', e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                          disabled={isLoading}
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={day.close}
                          onChange={(e) => handleBusinessHourChange(key, 'close', e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                          disabled={isLoading}
                        />
                      </div>
                    )}
                    
                    {isClosed && (
                      <span className="text-sm text-gray-500 italic">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your garage, services offered, specializations, etc."
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                canCreateGarage ? "Create Garage (Free)" : `Pay ${GARAGE_CREATION_FEE} ETB & Create Garage`
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {!canCreateGarage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> A one-time payment of {GARAGE_CREATION_FEE} ETB is required to create a garage. 
                You will be redirected to Chapa to complete the payment.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}