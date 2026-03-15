"use client";

import {
  JSX,
  useEffect,
  useState,
  useCallback,
  Fragment,
} from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Transition,
} from "@headlessui/react";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Edit3,
  CheckCircle,
  CreditCard,
  Calendar,
  Settings,
  User,
  LogOut,
  Bell,
  Star,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  Car,
  Users,
  CheckSquare,
} from "lucide-react";
import { DateTime } from "luxon";

// Import hooks
import { useAuth } from "@/lib/hooks/useAuth";
import { useGarage } from "@/lib/hooks/useGarage";
import { usePayment } from "@/lib/hooks/usePayment";
import { useService } from "@/lib/hooks/useService";
import { useBookingStatus } from "@/lib/hooks/useBooking";
import {
  setTokenGetter,
  getAccessToken,
} from "@/lib/api/api";

// Import types
import type {
  PopulatedGarage,
  GarageService,
} from "@/lib/types/garage.types";

import {
  DashboardTab,
  ModalType,
  GarageFormState,
  ServiceFormState,
  FormErrors,
  PAYMENT_AMOUNT,
  DEFAULT_FORM_STATE,
  DEFAULT_SERVICE_FORM,
  NAVIGATION_ITEMS,
  QUICK_ACTIONS,
  MESSAGES,
  animationStyles,
  scrollbarStyles,
  formatDate,
  getGreeting,
} from "@/lib/constants/dashboard.constants";
import { ContentLoadingSpinner, GlobalLoadingSpinner } from "@/components/owener/LoadingSpinner";
import { SuccessModal } from "@/components/owener/SuccessModal";
import { EditGarageModal } from "@/components/owener/EditGarageModal";
import { CreateGarageModal } from "@/components/owener/CreateGarageModal";
import { CreateServiceModal } from "@/components/owener/CreateServiceModal";
import { EditServiceModal } from "@/components/owener/EditServiceModal";
import { ServiceDetailsModal } from "@/components/owener/ServiceDetailsModal";
import { ServiceAnalyticsModal } from "@/components/owener/ServiceAnalyticsModal";
import { BookingDetailsModal } from "@/components/owener/BookingDetailsModal";
import { BookingStatusModal } from "@/components/owener/BookingStatusModal";
import { PaymentModal } from "@/components/PaymentModal";
import { StatCard } from "@/components/owener/StatCard";
import { QuickActionCard } from "@/components/owener/QuickActionCard";
import { BookingsList } from "@/components/owener/BookingsList";
import { ServicesList } from "@/components/owener/ServicesList";

export default function OwnerDashboardPage(): JSX.Element {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    refreshUser,
  } = useAuth();
  const {
    garage,
    fetchMyGarage,
    createGarage,
    updateGarage,
    loading: garageLoading,
    clearError,
  } = useGarage();
  const {
    error: paymentError,
    initializeGaragePayment,
    verifyPayment,
    clearPayment,
  } = usePayment();
  const {
    services: serviceServices,
    currentService,
    analytics,
    loading: serviceLoading,
    error: serviceError,
    createService,
    updateService,
    toggleAvailability,
    deleteService,
    fetchServiceAnalytics,
    fetchServicesByGarage,
    refreshServices,
  } = useService();

  // State management
  const [activeTab, setActiveTab] =
    useState<DashboardTab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(true);
  const [isLoading, setIsLoading] =
    useState(false);
  const [loadingMessage, setLoadingMessage] =
    useState("");
  const [showSuccessModal, setShowSuccessModal] =
    useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");
  const [activeModal, setActiveModal] =
    useState<ModalType>(null);
  const [formData, setFormData] =
    useState<GarageFormState>(DEFAULT_FORM_STATE);
  const [serviceForm, setServiceForm] =
    useState<ServiceFormState>(
      DEFAULT_SERVICE_FORM
    );
  const [formErrors, setFormErrors] =
    useState<FormErrors>({});
  const [selectedService, setSelectedService] =
    useState<GarageService | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<any | null>(null);
  const [
    showBookingDetails,
    setShowBookingDetails,
  ] = useState(false);
  const [
    showBookingStatusModal,
    setShowBookingStatusModal,
  ] = useState(false);
  const [updatingBooking, setUpdatingBooking] =
    useState<any | null>(null);
  const [paymentStep, setPaymentStep] = useState<
    | "idle"
    | "processing"
    | "success"
    | "failed"
    | "completed"
  >("idle");
  const [paymentErrorMsg, setPaymentErrorMsg] =
    useState<string>("");
  const [debugLogs, setDebugLogs] = useState<
    string[]
  >([]);
  const [
    paymentCheckInterval,
    setPaymentCheckInterval,
  ] = useState<NodeJS.Timeout | null>(null);
  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const typedGarage =
    garage as PopulatedGarage | null;

  // Use the booking status hook
  const {
    updateStatus,
    isLoading: statusUpdating,
    error: statusError,
    reset: resetStatusError,
  } = useBookingStatus({
    bookingId: updatingBooking?._id || "",
    onSuccess: (updatedBooking) => {
      showSuccess(
        MESSAGES.success.bookingUpdated(
          updatedBooking.status
        )
      );
      refreshServices();
      setShowBookingStatusModal(false);
      setUpdatingBooking(null);
    },
    onError: (error) => {
      alert(
        `${MESSAGES.error.updateService}${error}`
      );
    },
  });

  // Utility functions
  const addDebugLog = (
    message: string,
    data?: any
  ) => {
    const timestamp =
      new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ""}`;
    console.log(log, data || "");
    setDebugLogs((prev) =>
      [...prev, log].slice(-10)
    );
  };

  const showLoading = (message: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage("");
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  // Auth effect
  useEffect(() => {
    if (authLoading) return;

    if (
      !isAuthenticated ||
      user?.role !== "garage_owner"
    ) {
      router.push("/login");
      return;
    }

    if (user?.token) {
      setTokenGetter(() => user.token);
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    router,
  ]);

  // Cleanup interval
  useEffect(() => {
    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [paymentCheckInterval]);

  // Load user garage
  const loadUserGarage = useCallback(async () => {
    if (!user?.id) return;

    try {
      showLoading(MESSAGES.loading.garage);
      const result = await fetchMyGarage(user.id);

      if (result) {
        const typedGarage =
          result as PopulatedGarage;

        setFormData({
          name: typedGarage.name || "",
          description:
            typedGarage.description || "",
          phone:
            typedGarage.contactInfo?.phone || "",
          email:
            typedGarage.contactInfo?.email || "",
          website:
            typedGarage.contactInfo?.website ||
            "",
          street:
            typedGarage.address?.street || "",
          city: typedGarage.address?.city || "",
          state: typedGarage.address?.state || "",
          country:
            typedGarage.address?.country ||
            "Ethiopia",
          zipCode:
            typedGarage.address?.zipCode || "",
          mondayOpen:
            typedGarage.businessHours?.monday
              ?.open || "09:00",
          mondayClose:
            typedGarage.businessHours?.monday
              ?.close || "18:00",
          mondayClosed:
            typedGarage.businessHours?.monday
              ?.closed || false,
          tuesdayOpen:
            typedGarage.businessHours?.tuesday
              ?.open || "09:00",
          tuesdayClose:
            typedGarage.businessHours?.tuesday
              ?.close || "18:00",
          tuesdayClosed:
            typedGarage.businessHours?.tuesday
              ?.closed || false,
          wednesdayOpen:
            typedGarage.businessHours?.wednesday
              ?.open || "09:00",
          wednesdayClose:
            typedGarage.businessHours?.wednesday
              ?.close || "18:00",
          wednesdayClosed:
            typedGarage.businessHours?.wednesday
              ?.closed || false,
          thursdayOpen:
            typedGarage.businessHours?.thursday
              ?.open || "09:00",
          thursdayClose:
            typedGarage.businessHours?.thursday
              ?.close || "18:00",
          thursdayClosed:
            typedGarage.businessHours?.thursday
              ?.closed || false,
          fridayOpen:
            typedGarage.businessHours?.friday
              ?.open || "09:00",
          fridayClose:
            typedGarage.businessHours?.friday
              ?.close || "18:00",
          fridayClosed:
            typedGarage.businessHours?.friday
              ?.closed || false,
          saturdayOpen:
            typedGarage.businessHours?.saturday
              ?.open || "09:00",
          saturdayClose:
            typedGarage.businessHours?.saturday
              ?.close || "15:00",
          saturdayClosed:
            typedGarage.businessHours?.saturday
              ?.closed || false,
          sundayOpen:
            typedGarage.businessHours?.sunday
              ?.open || "09:00",
          sundayClose:
            typedGarage.businessHours?.sunday
              ?.close || "15:00",
          sundayClosed:
            typedGarage.businessHours?.sunday
              ?.closed || true,
        });

        await fetchServicesByGarage(
          typedGarage._id
        );
      }
    } catch (error: any) {
      addDebugLog("Error fetching garage", {
        error: error.message,
      });
    } finally {
      hideLoading();
    }
  }, [
    user,
    fetchMyGarage,
    fetchServicesByGarage,
  ]);

  useEffect(() => {
    if (user?.id) {
      loadUserGarage();
    }
  }, [user, loadUserGarage]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name =
        MESSAGES.validation.nameRequired;
    }

    if (!formData.phone.trim()) {
      errors.phone =
        MESSAGES.validation.phoneRequired;
    }

    if (!formData.email.trim()) {
      errors.email =
        MESSAGES.validation.emailRequired;
    } else if (
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {
      errors.email =
        MESSAGES.validation.emailInvalid;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateServiceForm = (): boolean => {
    const errors: FormErrors = {};

    if (!serviceForm.name.trim()) {
      errors.name =
        MESSAGES.validation.serviceNameRequired;
    }

    if (
      !serviceForm.price ||
      serviceForm.price <= 0
    ) {
      errors.price =
        MESSAGES.validation.pricePositive;
    }

    if (
      !serviceForm.duration ||
      serviceForm.duration < 5
    ) {
      errors.duration =
        MESSAGES.validation.durationMin;
    }

    if (!serviceForm.category) {
      errors.category =
        MESSAGES.validation.categoryRequired;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Payment handlers
  const startPaymentStatusCheck = (
    txRef: string
  ) => {
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
    }

    const interval = setInterval(async () => {
      try {
        addDebugLog("Checking payment status", {
          txRef,
        });
        const status = await verifyPayment(txRef);

        addDebugLog("Payment status response", {
          status,
        });

        if (
          status === "completed" ||
          status === "successful"
        ) {
          setPaymentStep("completed");
          clearInterval(interval);
          setPaymentCheckInterval(null);
          await refreshUser();
          addDebugLog(
            "User refreshed, canCreateGarage should now be true"
          );
        } else if (
          status === "failed" ||
          status === "expired"
        ) {
          setPaymentStep("failed");
          setPaymentErrorMsg(
            MESSAGES.error.paymentInit
          );
          clearInterval(interval);
          setPaymentCheckInterval(null);
        }
      } catch (error: any) {
        addDebugLog("Payment check error", error);
      }
    }, 5000);

    setPaymentCheckInterval(interval);
  };

  const handleInitializePayment = async () => {
    try {
      setPaymentStep("processing");
      addDebugLog("Initializing payment", {
        amount: PAYMENT_AMOUNT,
      });

      const paymentResponse =
        await initializeGaragePayment(
          PAYMENT_AMOUNT
        );
      addDebugLog(
        "Payment initialization response",
        paymentResponse
      );

      if (paymentResponse?.checkoutUrl) {
        sessionStorage.setItem(
          "pendingTxRef",
          paymentResponse.tx_ref
        );

        const newWindow = window.open(
          paymentResponse.checkoutUrl,
          "_blank"
        );

        if (newWindow) {
          setPaymentStep("success");
          startPaymentStatusCheck(
            paymentResponse.tx_ref
          );
        } else {
          alert(MESSAGES.error.popupBlocked);
          setPaymentStep("success");
          startPaymentStatusCheck(
            paymentResponse.tx_ref
          );
        }
      } else {
        setPaymentStep("failed");
        setPaymentErrorMsg(
          MESSAGES.error.paymentInit
        );
      }
    } catch (error: any) {
      addDebugLog(
        "Payment initialization error",
        error
      );
      setPaymentStep("failed");
      setPaymentErrorMsg(
        error?.message ||
          MESSAGES.error.paymentInit
      );
    }
  };

  const handlePaymentComplete = async () => {
    if (paymentStep === "completed") {
      await refreshUser();
      setShowPaymentModal(false);
      setPaymentStep("idle");
      sessionStorage.removeItem("pendingTxRef");
      showSuccess(
        MESSAGES.success.paymentSuccess
      );
    } else {
      const txRef = sessionStorage.getItem(
        "pendingTxRef"
      );

      if (txRef) {
        try {
          const status =
            await verifyPayment(txRef);
          if (
            status === "completed" ||
            status === "successful"
          ) {
            setPaymentStep("completed");
          } else {
            alert(MESSAGES.error.paymentVerify);
          }
        } catch (error) {
          alert(MESSAGES.error.paymentVerify);
        }
      }
    }
  };

  const resetPayment = () => {
    setPaymentStep("idle");
    setPaymentErrorMsg("");
    setShowPaymentModal(false);
    clearPayment();
    sessionStorage.removeItem("pendingTxRef");

    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }
  };

  // Garage handlers
  const handleCreateGarageClick = () => {
    if (!user) return;

    if (user.canCreateGarage === true) {
      setActiveModal("create");
      setFormData(DEFAULT_FORM_STATE);
      setFormErrors({});
    } else {
      setShowPaymentModal(true);
      setPaymentStep("processing");
      handleInitializePayment();
    }
  };

  const handleCreateGarageSubmit = async () => {
    if (!validateForm()) {
      addDebugLog(
        "Form validation failed",
        formErrors
      );
      return;
    }

    if (!user) {
      addDebugLog("No user found");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert(MESSAGES.error.auth);
      return;
    }

    const garagePayload = {
      name: formData.name,
      description:
        formData.description || "No description",
      coordinates: [38.7578, 9.0054],
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
      },
      contactInfo: {
        phone: formData.phone,
        email: formData.email,
        website: formData.website || undefined,
      },
      businessHours: {
        monday: {
          open: formData.mondayOpen,
          close: formData.mondayClose,
          closed: formData.mondayClosed,
        },
        tuesday: {
          open: formData.tuesdayOpen,
          close: formData.tuesdayClose,
          closed: formData.tuesdayClosed,
        },
        wednesday: {
          open: formData.wednesdayOpen,
          close: formData.wednesdayClose,
          closed: formData.wednesdayClosed,
        },
        thursday: {
          open: formData.thursdayOpen,
          close: formData.thursdayClose,
          closed: formData.thursdayClosed,
        },
        friday: {
          open: formData.fridayOpen,
          close: formData.fridayClose,
          closed: formData.fridayClosed,
        },
        saturday: {
          open: formData.saturdayOpen,
          close: formData.saturdayClose,
          closed: formData.saturdayClosed,
        },
        sunday: {
          open: formData.sundayOpen,
          close: formData.sundayClose,
          closed: formData.sundayClosed,
        },
      },
    };

    addDebugLog(
      "Creating garage with payload:",
      garagePayload
    );

    try {
      showLoading(MESSAGES.loading.creating);
      addDebugLog(
        "Sending create garage request"
      );

      const created = await createGarage(
        garagePayload
      );
      addDebugLog(
        "Create garage response:",
        created
      );

      if (created) {
        setActiveModal(null);
        showSuccess(
          MESSAGES.success.garageCreated
        );
        await loadUserGarage();
        setFormData(DEFAULT_FORM_STATE);
      }
    } catch (error: any) {
      addDebugLog("Error in garage creation:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Please try again.";
      alert(
        `${MESSAGES.error.createGarage}${errorMessage}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleEditGarageClick = () => {
    if (!garage) return;

    const typedGarage = garage as PopulatedGarage;

    setFormData({
      name: typedGarage.name || "",
      description: typedGarage.description || "",
      phone: typedGarage.contactInfo?.phone || "",
      email: typedGarage.contactInfo?.email || "",
      website:
        typedGarage.contactInfo?.website || "",
      street: typedGarage.address?.street || "",
      city: typedGarage.address?.city || "",
      state: typedGarage.address?.state || "",
      country:
        typedGarage.address?.country ||
        "Ethiopia",
      zipCode: typedGarage.address?.zipCode || "",
      mondayOpen:
        typedGarage.businessHours?.monday?.open ||
        "09:00",
      mondayClose:
        typedGarage.businessHours?.monday
          ?.close || "18:00",
      mondayClosed:
        typedGarage.businessHours?.monday
          ?.closed || false,
      tuesdayOpen:
        typedGarage.businessHours?.tuesday
          ?.open || "09:00",
      tuesdayClose:
        typedGarage.businessHours?.tuesday
          ?.close || "18:00",
      tuesdayClosed:
        typedGarage.businessHours?.tuesday
          ?.closed || false,
      wednesdayOpen:
        typedGarage.businessHours?.wednesday
          ?.open || "09:00",
      wednesdayClose:
        typedGarage.businessHours?.wednesday
          ?.close || "18:00",
      wednesdayClosed:
        typedGarage.businessHours?.wednesday
          ?.closed || false,
      thursdayOpen:
        typedGarage.businessHours?.thursday
          ?.open || "09:00",
      thursdayClose:
        typedGarage.businessHours?.thursday
          ?.close || "18:00",
      thursdayClosed:
        typedGarage.businessHours?.thursday
          ?.closed || false,
      fridayOpen:
        typedGarage.businessHours?.friday?.open ||
        "09:00",
      fridayClose:
        typedGarage.businessHours?.friday
          ?.close || "18:00",
      fridayClosed:
        typedGarage.businessHours?.friday
          ?.closed || false,
      saturdayOpen:
        typedGarage.businessHours?.saturday
          ?.open || "09:00",
      saturdayClose:
        typedGarage.businessHours?.saturday
          ?.close || "15:00",
      saturdayClosed:
        typedGarage.businessHours?.saturday
          ?.closed || false,
      sundayOpen:
        typedGarage.businessHours?.sunday?.open ||
        "09:00",
      sundayClose:
        typedGarage.businessHours?.sunday
          ?.close || "15:00",
      sundayClosed:
        typedGarage.businessHours?.sunday
          ?.closed || true,
    });

    setFormErrors({});
    setActiveModal("edit");
  };

  const handleUpdateGarage = async () => {
    if (!validateForm()) return;
    if (!garage?._id) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      address: {
        street: formData.street || "",
        city: formData.city || "",
        state: formData.state || "",
        country: formData.country || "Ethiopia",
        zipCode: formData.zipCode || "",
      },
      contactInfo: {
        phone: formData.phone,
        email: formData.email,
        website: formData.website || undefined,
      },
      businessHours: {
        monday: {
          open: formData.mondayOpen,
          close: formData.mondayClose,
          closed: formData.mondayClosed,
        },
        tuesday: {
          open: formData.tuesdayOpen,
          close: formData.tuesdayClose,
          closed: formData.tuesdayClosed,
        },
        wednesday: {
          open: formData.wednesdayOpen,
          close: formData.wednesdayClose,
          closed: formData.wednesdayClosed,
        },
        thursday: {
          open: formData.thursdayOpen,
          close: formData.thursdayClose,
          closed: formData.thursdayClosed,
        },
        friday: {
          open: formData.fridayOpen,
          close: formData.fridayClose,
          closed: formData.fridayClosed,
        },
        saturday: {
          open: formData.saturdayOpen,
          close: formData.saturdayClose,
          closed: formData.saturdayClosed,
        },
        sunday: {
          open: formData.sundayOpen,
          close: formData.sundayClose,
          closed: formData.sundayClosed,
        },
      },
    };

    try {
      showLoading(MESSAGES.loading.updating);
      addDebugLog("Updating garage", {
        id: garage._id,
        payload,
      });

      const updated = await updateGarage(
        garage._id,
        payload
      );
      addDebugLog(
        "Update garage response",
        updated
      );

      if (updated) {
        setActiveModal(null);
        showSuccess(
          MESSAGES.success.garageUpdated
        );
        await loadUserGarage();
      }
    } catch (error: any) {
      addDebugLog("Error updating garage", error);
      alert(
        `${MESSAGES.error.updateGarage}${error?.response?.data?.message || error.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  // Service handlers
  const handleCreateServiceClick = () => {
    setServiceForm(DEFAULT_SERVICE_FORM);
    setFormErrors({});
    setActiveModal("create-service");
  };

  const handleCreateServiceSubmit = async () => {
    if (!validateServiceForm()) return;
    if (!garage?._id) return;

    const payload = {
      name: serviceForm.name,
      description: serviceForm.description,
      price: serviceForm.price,
      duration: serviceForm.duration,
      category: serviceForm.category,
      garageId: garage._id,
    };

    try {
      showLoading(
        MESSAGES.loading.creatingService
      );
      const created =
        await createService(payload);
      addDebugLog(
        "Create service response",
        created
      );

      if (created) {
        setActiveModal(null);
        showSuccess(
          MESSAGES.success.serviceCreated
        );
        await refreshServices();
        setServiceForm(DEFAULT_SERVICE_FORM);
      }
    } catch (error: any) {
      addDebugLog(
        "Error creating service",
        error
      );
      alert(
        `${MESSAGES.error.createService}${error?.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleEditService = (
    service: GarageService
  ) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      category: service.category,
    });
    setFormErrors({});
    setActiveModal("edit-service");
  };

  const handleUpdateService = async () => {
    if (!validateServiceForm()) return;
    if (!selectedService) return;

    const payload = {
      name: serviceForm.name,
      description: serviceForm.description,
      price: serviceForm.price,
      duration: serviceForm.duration,
      category: serviceForm.category,
    };

    try {
      showLoading(
        MESSAGES.loading.updatingService
      );
      const updated = await updateService(
        selectedService._id,
        payload
      );
      addDebugLog(
        "Update service response",
        updated
      );

      if (updated) {
        setActiveModal(null);
        showSuccess(
          MESSAGES.success.serviceUpdated
        );
        await refreshServices();
        setSelectedService(null);
        setServiceForm(DEFAULT_SERVICE_FORM);
      }
    } catch (error: any) {
      addDebugLog(
        "Error updating service",
        error
      );
      alert(
        `${MESSAGES.error.updateService}${error?.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleToggleAvailability = async (
    service: GarageService
  ) => {
    try {
      showLoading(
        MESSAGES.loading.togglingService(
          service.isAvailable
            ? "Disabling"
            : "Enabling"
        )
      );
      const updated = await toggleAvailability(
        service._id
      );
      addDebugLog(
        "Toggle availability response",
        updated
      );

      showSuccess(
        MESSAGES.success.serviceToggled(
          service.isAvailable
            ? "disabled"
            : "enabled"
        )
      );
      await refreshServices();
    } catch (error: any) {
      addDebugLog(
        "Error toggling availability",
        error
      );
      alert(
        `${MESSAGES.error.toggleService}${error?.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleDeleteService = async (
    service: GarageService
  ) => {
    if (
      !confirm(
        MESSAGES.confirm.deleteService(
          service.name
        )
      )
    )
      return;

    try {
      showLoading(
        MESSAGES.loading.deletingService
      );
      await deleteService(service._id);
      addDebugLog("Delete service response");

      showSuccess(
        MESSAGES.success.serviceDeleted
      );
      await refreshServices();
      if (selectedService?._id === service._id) {
        setSelectedService(null);
        setActiveModal(null);
      }
    } catch (error: any) {
      addDebugLog(
        "Error deleting service",
        error
      );
      alert(
        `${MESSAGES.error.deleteService}${error?.message || "Please try again."}`
      );
    } finally {
      hideLoading();
    }
  };

  const handleViewServiceDetails = (
    service: GarageService
  ) => {
    setSelectedService(service);
    setActiveModal("service-details");
  };

  const handleViewServiceAnalytics = async (
    service: GarageService
  ) => {
    try {
      showLoading(
        MESSAGES.loading.loadingAnalytics
      );
      await fetchServiceAnalytics(service._id);
      setSelectedService(service);
      setActiveModal("service-analytics");
    } catch (error: any) {
      addDebugLog(
        "Error fetching analytics",
        error
      );
      alert(MESSAGES.error.loadAnalytics);
    } finally {
      hideLoading();
    }
  };

  // Booking handlers
  const handleBookingSelect = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleStatusUpdateClick = (
    booking: any
  ) => {
    setUpdatingBooking(booking);
    setShowBookingStatusModal(true);
    setShowBookingDetails(false);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Styles effect
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = scrollbarStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex">
        <div className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl"></div>
        <div className="flex-1 p-8">
          <ContentLoadingSpinner message="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Loading and Success Modals */}
      {isLoading && (
        <GlobalLoadingSpinner
          message={loadingMessage}
        />
      )}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() =>
            setShowSuccessModal(false)
          }
        />
      )}

      {/* Garage Modals */}
      {activeModal === "edit" && (
        <EditGarageModal
          isOpen={activeModal === "edit"}
          onClose={() => setActiveModal(null)}
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          onSubmit={handleUpdateGarage}
          isLoading={isLoading}
        />
      )}

      {activeModal === "create" && (
        <CreateGarageModal
          isOpen={activeModal === "create"}
          onClose={() => {
            setActiveModal(null);
            setFormData(DEFAULT_FORM_STATE);
            setFormErrors({});
          }}
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          onSubmit={handleCreateGarageSubmit}
          isLoading={isLoading}
        />
      )}

      {activeModal === "create-service" &&
        typedGarage && (
          <CreateServiceModal
            isOpen={
              activeModal === "create-service"
            }
            onClose={() => {
              setActiveModal(null);
              setServiceForm(
                DEFAULT_SERVICE_FORM
              );
              setFormErrors({});
            }}
            formData={serviceForm}
            setFormData={setServiceForm}
            formErrors={formErrors}
            onSubmit={handleCreateServiceSubmit}
            isLoading={isLoading}
            garageId={typedGarage._id}
          />
        )}

      {activeModal === "edit-service" && (
        <EditServiceModal
          isOpen={activeModal === "edit-service"}
          onClose={() => {
            setActiveModal(null);
            setSelectedService(null);
            setServiceForm(DEFAULT_SERVICE_FORM);
            setFormErrors({});
          }}
          formData={serviceForm}
          setFormData={setServiceForm}
          formErrors={formErrors}
          onSubmit={handleUpdateService}
          isLoading={isLoading}
          service={selectedService}
        />
      )}

      {activeModal === "service-details" &&
        selectedService && (
          <ServiceDetailsModal
            isOpen={
              activeModal === "service-details"
            }
            onClose={() => {
              setActiveModal(null);
              setSelectedService(null);
            }}
            service={selectedService}
            onEdit={() =>
              setActiveModal("edit-service")
            }
            onToggleAvailability={() => {
              setActiveModal(null);
              handleToggleAvailability(
                selectedService
              );
            }}
            onDelete={() => {
              setActiveModal(null);
              handleDeleteService(
                selectedService
              );
            }}
            onViewAnalytics={() => {
              setActiveModal("service-analytics");
              handleViewServiceAnalytics(
                selectedService
              );
            }}
          />
        )}

      {activeModal === "service-analytics" &&
        selectedService && (
          <ServiceAnalyticsModal
            isOpen={
              activeModal === "service-analytics"
            }
            onClose={() => {
              setActiveModal(null);
              setSelectedService(null);
            }}
            service={selectedService}
            analytics={analytics}
          />
        )}

      {/* Booking Modals */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={showBookingDetails}
          onClose={() => {
            setShowBookingDetails(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onStatusUpdate={handleStatusUpdateClick}
        />
      )}

      {updatingBooking && (
        <BookingStatusModal
          isOpen={showBookingStatusModal}
          onClose={() => {
            setShowBookingStatusModal(false);
            setUpdatingBooking(null);
          }}
          booking={updatingBooking}
          bookingId={updatingBooking._id}
          onSuccess={() => refreshServices()}
          useBookingStatus={useBookingStatus}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={resetPayment}
          paymentStep={paymentStep}
          paymentAmount={PAYMENT_AMOUNT}
          onRetry={handleInitializePayment}
          onContinue={handlePaymentComplete}
          error={paymentErrorMsg}
        />
      )}

      {/* Debug Panel */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50 w-80 p-3 bg-gray-900 text-green-400 text-xs rounded-lg overflow-auto max-h-40 font-mono">
          <p className="text-white font-bold mb-1">
            🔍 DEBUG LOGS:
          </p>
          <p className="text-yellow-400">
            canCreateGarage:{" "}
            {user?.canCreateGarage
              ? "true"
              : "false"}
          </p>
          {debugLogs.map((log, i) => (
            <div
              key={i}
              className="border-b border-gray-700 pb-1 mb-1 last:border-0"
            >
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-xl shadow-2xl transition-all duration-300 z-40 ${isSidebarOpen ? "w-72" : "w-24"}`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200">
              {isSidebarOpen ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    GarageFlow
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                  <Car className="h-5 w-5 text-white" />
                </div>
              )}
              <button
                onClick={() =>
                  setIsSidebarOpen(!isSidebarOpen)
                }
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {user?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full flex items-center w-fit ${
                          user?.canCreateGarage
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user?.canCreateGarage ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />{" "}
                            Can Create
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3 w-3 mr-1" />{" "}
                            Payment Required
                          </>
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-3">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() =>
                          setActiveTab(item.id)
                        }
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                          activeTab === item.id
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : "mx-auto"}`}
                        />
                        {isSidebarOpen && (
                          <span className="font-medium">
                            {item.label}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Sidebar Footer */}
            {!isSidebarOpen && (
              <div className="px-3 py-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto ${
                    user?.canCreateGarage
                      ? "bg-green-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {user?.canCreateGarage ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
              >
                <LogOut
                  className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : "mx-auto"}`}
                />
                {isSidebarOpen && (
                  <span>Logout</span>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-24"}`}
        >
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="px-8 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {activeTab === "dashboard" &&
                      "Dashboard Overview"}
                    {activeTab === "garage" &&
                      "My Garage"}
                    {activeTab === "bookingss" &&
                      "Bookings Management"}
                    {activeTab === "services" &&
                      "Services Management"}
                    {activeTab === "profile" &&
                      "Profile Settings"}
                    {activeTab === "settings" &&
                      "System Settings"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(
                      new Date().toISOString(),
                      "full"
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {!user?.canCreateGarage &&
                    !typedGarage && (
                      <div
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 cursor-pointer hover:bg-yellow-200 flex items-center"
                        onClick={
                          handleCreateGarageClick
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Payment Required
                      </div>
                    )}
                  <button className="p-2 hover:bg-gray-100 rounded-full relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <Menu
                    as="div"
                    className="relative"
                  >
                    <Menu.Button className="flex items-center space-x-3 focus:outline-none">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {user?.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() =>
                                  setActiveTab(
                                    "profile"
                                  )
                                }
                                className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700 w-full text-left flex items-center`}
                              >
                                <User className="h-4 w-4 mr-2" />{" "}
                                Your Profile
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() =>
                                  setActiveTab(
                                    "settings"
                                  )
                                }
                                className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700 w-full text-left flex items-center`}
                              >
                                <Settings className="h-4 w-4 mr-2" />{" "}
                                Settings
                              </button>
                            )}
                          </Menu.Item>
                          <hr className="my-1" />
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={
                                  handleLogout
                                }
                                className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-red-600 w-full text-left flex items-center`}
                              >
                                <LogOut className="h-4 w-4 mr-2" />{" "}
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-8">
            {garageLoading && !garage ? (
              <ContentLoadingSpinner message="Loading your garage..." />
            ) : (
              <>
                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full transform -translate-x-24 translate-y-24"></div>
                      <div className="relative">
                        <h2 className="text-3xl font-bold mb-2 flex items-center">
                          {getGreeting()},{" "}
                          {user?.name}!{" "}
                          <Sparkles className="h-6 w-6 ml-2 text-yellow-300" />
                        </h2>
                        <p className="text-blue-100 text-lg max-w-2xl">
                          {typedGarage
                            ? `Here's what's happening with your garage today. You have ${typedGarage?.stats?.totalBookings || 0} total bookings and ${typedGarage?.stats?.completedBookings || 0} completed services.`
                            : user?.canCreateGarage
                              ? MESSAGES.empty.noGarage.description(
                                  true
                                )
                              : MESSAGES.empty.noGarage.description(
                                  false
                                )}
                        </p>
                      </div>
                    </div>

                    {typedGarage && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                          title="Total Bookings"
                          value={
                            typedGarage?.stats
                              ?.totalBookings || 0
                          }
                          icon={Calendar}
                          color="blue"
                          trend="12"
                        />
                        <StatCard
                          title="Completed"
                          value={
                            typedGarage?.stats
                              ?.completedBookings ||
                            0
                          }
                          icon={CheckSquare}
                          color="green"
                        />
                        <StatCard
                          title="Average Rating"
                          value={
                            typedGarage?.stats?.averageRating?.toFixed(
                              1
                            ) || "0.0"
                          }
                          icon={Star}
                          color="yellow"
                        />
                        <StatCard
                          title="Total Reviews"
                          value={
                            typedGarage?.stats
                              ?.totalReviews || 0
                          }
                          icon={Users}
                          color="purple"
                        />
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {!typedGarage ? (
                          <QuickActionCard
                            title={
                              user?.canCreateGarage
                                ? QUICK_ACTIONS
                                    .createGarage
                                    .title
                                : QUICK_ACTIONS
                                    .makePayment
                                    .title
                            }
                            description={
                              user?.canCreateGarage
                                ? QUICK_ACTIONS
                                    .createGarage
                                    .description
                                : QUICK_ACTIONS
                                    .makePayment
                                    .description
                            }
                            icon={
                              user?.canCreateGarage
                                ? QUICK_ACTIONS
                                    .createGarage
                                    .icon
                                : QUICK_ACTIONS
                                    .makePayment
                                    .icon
                            }
                            color={
                              user?.canCreateGarage
                                ? QUICK_ACTIONS
                                    .createGarage
                                    .color
                                : QUICK_ACTIONS
                                    .makePayment
                                    .color
                            }
                            onClick={
                              handleCreateGarageClick
                            }
                          />
                        ) : (
                          <>
                            <QuickActionCard
                              title={
                                QUICK_ACTIONS
                                  .editGarage
                                  .title
                              }
                              description={
                                QUICK_ACTIONS
                                  .editGarage
                                  .description
                              }
                              icon={
                                QUICK_ACTIONS
                                  .editGarage.icon
                              }
                              color={
                                QUICK_ACTIONS
                                  .editGarage
                                  .color
                              }
                              onClick={
                                handleEditGarageClick
                              }
                            />
                            <QuickActionCard
                              title={
                                QUICK_ACTIONS
                                  .manageServices
                                  .title
                              }
                              description={
                                QUICK_ACTIONS
                                  .manageServices
                                  .description
                              }
                              icon={
                                QUICK_ACTIONS
                                  .manageServices
                                  .icon
                              }
                              color={
                                QUICK_ACTIONS
                                  .manageServices
                                  .color
                              }
                              onClick={
                                handleCreateServiceClick
                              }
                            />
                            <QuickActionCard
                              title={
                                QUICK_ACTIONS
                                  .viewBookings
                                  .title
                              }
                              description={
                                QUICK_ACTIONS
                                  .viewBookings
                                  .description
                              }
                              icon={
                                QUICK_ACTIONS
                                  .viewBookings
                                  .icon
                              }
                              color={
                                QUICK_ACTIONS
                                  .viewBookings
                                  .color
                              }
                              onClick={() =>
                                setActiveTab(
                                  "bookings"
                                )
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {typedGarage && (
                      <div className="bg-white rounded-3xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Garage Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Status
                            </p>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  typedGarage.status ===
                                  "active"
                                    ? "bg-green-500"
                                    : typedGarage.status ===
                                        "pending"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                              ></div>
                              <span className="font-medium text-gray-900 capitalize">
                                {
                                  typedGarage.status
                                }
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Verification
                            </p>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${typedGarage.isVerified ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span className="font-medium text-gray-900">
                                {typedGarage.isVerified
                                  ? "Verified"
                                  : "Not Verified"}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Active
                            </p>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${typedGarage.isActive ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span className="font-medium text-gray-900">
                                {typedGarage.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Paid On
                            </p>
                            <p className="font-medium text-gray-900">
                              {typedGarage.paidAt
                                ? formatDate(
                                    typedGarage.paidAt,
                                    "short"
                                  )
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Garage Tab */}
                {activeTab === "garage" && (
                  <div className="max-w-6xl mx-auto space-y-10">
                    {typedGarage ? (
                      <div className="rounded-3xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm">
                        {/* Header */}
                        <div className="relative h-56 bg-gradient-to-br from-indigo-600/90 via-blue-600/80 to-purple-600/90">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <button
                            onClick={
                              handleEditGarageClick
                            }
                            className="absolute top-5 right-5 bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
                          >
                            <Edit3 size={16} />{" "}
                            Edit
                          </button>
                        </div>

                        {/* Content */}
                        <div className="px-8 pb-10 relative">
                          {/* Icon */}
                          <div className="absolute -top-12 left-8 w-24 h-24 rounded-2xl bg-white/90 backdrop-blur shadow-xl flex items-center justify-center">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                              <Car
                                size={28}
                                className="text-white"
                              />
                            </div>
                          </div>

                          {/* Title */}
                          <div className="ml-32 pt-6">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                              {typedGarage.name}
                            </h2>
                            <p className="text-gray-500 mt-2 leading-relaxed max-w-xl">
                              {
                                typedGarage.description
                              }
                            </p>
                          </div>

                          {/* Grid */}
                          <div className="grid md:grid-cols-2 gap-6 mt-10">
                            {/* Contact */}
                            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 backdrop-blur border border-white/40 shadow-sm">
                              <h3 className="flex items-center gap-2 text-gray-800 font-semibold mb-5">
                                <Phone
                                  size={18}
                                  className="text-blue-600"
                                />{" "}
                                Contact
                                Information
                              </h3>
                              <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3">
                                  <Phone
                                    size={16}
                                    className="text-blue-500/70"
                                  />
                                  <span className="text-gray-500 w-20">
                                    Phone
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {
                                      typedGarage
                                        .contactInfo
                                        ?.phone
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Mail
                                    size={16}
                                    className="text-indigo-500/70"
                                  />
                                  <span className="text-gray-500 w-20">
                                    Email
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {
                                      typedGarage
                                        .contactInfo
                                        ?.email
                                    }
                                  </span>
                                </div>
                                {typedGarage
                                  .contactInfo
                                  ?.website && (
                                  <div className="flex items-center gap-3">
                                    <Globe
                                      size={16}
                                      className="text-purple-500/70"
                                    />
                                    <span className="text-gray-500 w-20">
                                      Website
                                    </span>
                                    <a
                                      href={
                                        typedGarage
                                          .contactInfo
                                          .website
                                      }
                                      target="_blank"
                                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                      Visit
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Address */}
                            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-50/80 to-indigo-50/60 border border-white/40 shadow-sm">
                              <h3 className="flex items-center gap-2 text-gray-800 font-semibold mb-5">
                                <MapPin
                                  size={18}
                                  className="text-purple-600"
                                />{" "}
                                Address
                              </h3>
                              <div className="space-y-2 text-gray-700 leading-relaxed">
                                <p>
                                  {
                                    typedGarage
                                      .address
                                      ?.street
                                  }
                                </p>
                                <p>
                                  {
                                    typedGarage
                                      .address
                                      ?.city
                                  }
                                  ,{" "}
                                  {
                                    typedGarage
                                      .address
                                      ?.state
                                  }{" "}
                                  {
                                    typedGarage
                                      .address
                                      ?.zipCode
                                  }
                                </p>
                                <p className="text-gray-500">
                                  {
                                    typedGarage
                                      .address
                                      ?.country
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Business Hours */}
                          <div className="mt-8 max-w-6xl mx-auto px-4">
                            {/* Compact Header */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                                    <Clock
                                      className="text-white"
                                      size={18}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-slate-800">
                                    Weekly Hours
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono">
                                      UTC+3
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      Ethiopian
                                      Time
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Live Time */}
                              {(() => {
                                const now =
                                  DateTime.now().setZone(
                                    "Africa/Addis_Ababa"
                                  );
                                const today = now
                                  .toFormat(
                                    "cccc"
                                  )
                                  .toLowerCase();
                                const todayHours =
                                  typedGarage
                                    .businessHours?.[
                                    today
                                  ];
                                const isOpenNow =
                                  todayHours &&
                                  !todayHours.closed &&
                                  todayHours.open &&
                                  todayHours.close &&
                                  now.hour >=
                                    parseInt(
                                      todayHours.open.split(
                                        ":"
                                      )[0]
                                    ) &&
                                  now.hour <
                                    parseInt(
                                      todayHours.close.split(
                                        ":"
                                      )[0]
                                    );

                                return (
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                                      <span className="text-xs font-mono text-slate-600">
                                        {now.toFormat(
                                          "hh:mm:ss a"
                                        )}
                                      </span>
                                    </div>
                                    <div
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isOpenNow ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                                    >
                                      <div className="relative">
                                        <div
                                          className={`absolute inset-0 rounded-full ${isOpenNow ? "bg-green-400" : "bg-red-400"} blur-sm animate-ping opacity-75`}
                                        />
                                        <div
                                          className={`relative w-2 h-2 rounded-full ${isOpenNow ? "bg-green-500" : "bg-red-500"}`}
                                        />
                                      </div>
                                      <span
                                        className={`text-xs font-medium ${isOpenNow ? "text-green-700" : "text-red-700"}`}
                                      >
                                        {isOpenNow
                                          ? "Open Now"
                                          : "Closed Now"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                              {typedGarage.businessHours &&
                                Object.entries(
                                  typedGarage.businessHours
                                ).map(
                                  ([
                                    day,
                                    hours,
                                  ]) => {
                                    const ethiopianNow =
                                      DateTime.now().setZone(
                                        "Africa/Addis_Ababa"
                                      );
                                    const todayName =
                                      ethiopianNow
                                        .toFormat(
                                          "cccc"
                                        )
                                        .toLowerCase();
                                    const isToday =
                                      todayName ===
                                      day;
                                    const isClosed =
                                      hours.closed;

                                    const now =
                                      ethiopianNow;
                                    const currentHour =
                                      now.hour;
                                    const currentMinute =
                                      now.minute;
                                    const currentTimeValue =
                                      currentHour +
                                      currentMinute /
                                        60;

                                    const openHour =
                                      hours.open
                                        ? parseInt(
                                            hours.open.split(
                                              ":"
                                            )[0]
                                          ) +
                                          parseInt(
                                            hours.open.split(
                                              ":"
                                            )[1]
                                          ) /
                                            60
                                        : 0;
                                    const closeHour =
                                      hours.close
                                        ? parseInt(
                                            hours.close.split(
                                              ":"
                                            )[0]
                                          ) +
                                          parseInt(
                                            hours.close.split(
                                              ":"
                                            )[1]
                                          ) /
                                            60
                                        : 0;

                                    const isCurrentlyOpen =
                                      isToday &&
                                      !isClosed &&
                                      hours.open &&
                                      hours.close &&
                                      currentTimeValue >=
                                        openHour &&
                                      currentTimeValue <
                                        closeHour;

                                    let openTime =
                                      null;
                                    let closeTime =
                                      null;

                                    if (
                                      !isClosed &&
                                      hours.open &&
                                      hours.close
                                    ) {
                                      try {
                                        openTime =
                                          DateTime.fromFormat(
                                            hours.open,
                                            "HH:mm",
                                            {
                                              zone: "Africa/Addis_Ababa",
                                            }
                                          ).toFormat(
                                            "h:mm"
                                          );
                                        closeTime =
                                          DateTime.fromFormat(
                                            hours.close,
                                            "HH:mm",
                                            {
                                              zone: "Africa/Addis_Ababa",
                                            }
                                          ).toFormat(
                                            "h:mm a"
                                          );
                                      } catch (e) {}
                                    }

                                    return (
                                      <div
                                        key={day}
                                        className={`relative rounded-xl p-3 transition-all ${
                                          isToday
                                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg ring-2 ring-amber-200 ring-offset-2"
                                            : "bg-white border border-slate-200 hover:border-slate-300"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <p
                                            className={`text-sm font-semibold capitalize ${isToday ? "text-white" : "text-slate-700"}`}
                                          >
                                            {day.slice(
                                              0,
                                              3
                                            )}
                                          </p>
                                          <div className="relative">
                                            {isCurrentlyOpen && (
                                              <>
                                                <div className="absolute -inset-1 bg-green-400 rounded-full blur-sm animate-ping opacity-75" />
                                                <div className="absolute -inset-1 bg-green-300 rounded-full blur-md animate-pulse opacity-50" />
                                                <div className="relative w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                  <span className="text-white text-[8px] font-bold">
                                                    OPEN
                                                  </span>
                                                </div>
                                              </>
                                            )}
                                            {isToday &&
                                              isClosed && (
                                                <>
                                                  <div className="absolute -inset-1 bg-red-400 rounded-full blur-sm animate-ping opacity-75" />
                                                  <div className="absolute -inset-1 bg-red-300 rounded-full blur-md animate-pulse opacity-50" />
                                                  <div className="relative w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-white text-[8px] font-bold">
                                                      OFF
                                                    </span>
                                                  </div>
                                                </>
                                              )}
                                            {isToday &&
                                              !isCurrentlyOpen &&
                                              !isClosed && (
                                                <>
                                                  <div className="absolute -inset-1 bg-amber-400 rounded-full blur-sm animate-pulse opacity-50" />
                                                  <div className="relative w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-white text-[8px] font-bold">
                                                      TODAY
                                                    </span>
                                                  </div>
                                                </>
                                              )}
                                            {!isToday &&
                                              !isClosed && (
                                                <div className="relative w-4 h-4 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                </div>
                                              )}
                                            {!isToday &&
                                              isClosed && (
                                                <div className="relative w-4 h-4 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
                                                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                                                </div>
                                              )}
                                          </div>
                                        </div>

                                        {/* Time Display */}
                                        {isClosed ? (
                                          <div className="text-center py-1">
                                            <p
                                              className={`text-xs ${isToday ? "text-white/70" : "text-slate-400"}`}
                                            >
                                              Rest
                                              day
                                              😴
                                            </p>
                                            {isToday && (
                                              <p className="text-[10px] text-white/50 mt-1">
                                                Closed
                                                all
                                                day
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                              <span
                                                className={
                                                  isToday
                                                    ? "text-white/70"
                                                    : "text-slate-400"
                                                }
                                              >
                                                Open
                                              </span>
                                              <span
                                                className={`font-mono font-medium ${isToday ? "text-white" : "text-slate-700"}`}
                                              >
                                                {
                                                  openTime
                                                }
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span
                                                className={
                                                  isToday
                                                    ? "text-white/70"
                                                    : "text-slate-400"
                                                }
                                              >
                                                Close
                                              </span>
                                              <span
                                                className={`font-mono font-medium ${isToday ? "text-white" : "text-slate-700"}`}
                                              >
                                                {
                                                  closeTime
                                                }
                                              </span>
                                            </div>
                                            {isCurrentlyOpen && (
                                              <p className="text-[10px] text-green-300 mt-1 animate-pulse text-center">
                                                ●
                                                Open
                                                Now
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="mt-10 grid md:grid-cols-3 gap-5">
                            <div className="rounded-xl p-4 bg-blue-50/80 border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium mb-1">
                                Created
                              </p>
                              <p className="font-semibold text-gray-800">
                                {formatDate(
                                  typedGarage.createdAt,
                                  "short"
                                )}
                              </p>
                            </div>
                            <div className="rounded-xl p-4 bg-green-50/80 border border-green-100">
                              <p className="text-xs text-green-600 font-medium mb-1">
                                Updated
                              </p>
                              <p className="font-semibold text-gray-800">
                                {formatDate(
                                  typedGarage.updatedAt,
                                  "short"
                                )}
                              </p>
                            </div>
                            <div className="rounded-xl p-4 bg-purple-50/80 border border-purple-100">
                              <p className="text-xs text-purple-600 font-medium mb-1">
                                Verification
                              </p>
                              <p className="font-semibold text-gray-800">
                                {typedGarage.verifiedAt
                                  ? formatDate(
                                      typedGarage.verifiedAt,
                                      "short"
                                    )
                                  : "Not verified"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Building2 className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {
                            MESSAGES.empty
                              .noGarage.title
                          }
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {MESSAGES.empty.noGarage.description(
                            user?.canCreateGarage ||
                              false
                          )}
                        </p>
                        <button
                          onClick={
                            handleCreateGarageClick
                          }
                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium"
                        >
                          {user?.canCreateGarage
                            ? "Create Garage"
                            : "Make Payment"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Bookings Tab */}
                {activeTab === "bookings" &&
                  (typedGarage ? (
                    <BookingsList
                      garage={typedGarage}
                      onBookingSelect={
                        handleBookingSelect
                      }
                      onStatusUpdate={
                        handleStatusUpdateClick
                      }
                    />
                  ) : (
                    <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                      <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="h-10 w-10 text-yellow-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {
                          MESSAGES.empty
                            .noBookings.title
                        }
                      </h3>
                      <p className="text-gray-600">
                        {
                          MESSAGES.empty
                            .noBookings
                            .description
                        }
                      </p>
                    </div>
                  ))}

                {/* Services Tab */}
                {activeTab === "services" &&
                  typedGarage && (
                    <ServicesList
                      garage={typedGarage}
                      onEdit={handleEditService}
                      onToggleAvailability={
                        handleToggleAvailability
                      }
                      onDelete={
                        handleDeleteService
                      }
                      onViewDetails={
                        handleViewServiceDetails
                      }
                      onViewAnalytics={
                        handleViewServiceAnalytics
                      }
                    />
                  )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Profile Settings
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                          {user?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {user?.name}
                          </h4>
                          <p className="text-gray-600">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={
                              user?.name || ""
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={
                              user?.email || ""
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                          </label>
                          <input
                            type="text"
                            value={
                              user?.role || ""
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Garage Creation Status
                          </label>
                          <div
                            className={`w-full px-4 py-3 border-2 rounded-xl flex items-center ${
                              user?.canCreateGarage
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-yellow-200 bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {user?.canCreateGarage ? (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2" />{" "}
                                Enabled
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-5 w-5 mr-2" />{" "}
                                Payment Required
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      System Settings
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Notification Preferences
                        </h4>
                        <div className="space-y-3">
                          <label className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 mr-3 h-5 w-5"
                            />
                            <span className="text-gray-700">
                              Email notifications
                              for new bookings
                            </span>
                          </label>
                          <label className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 mr-3 h-5 w-5"
                            />
                            <span className="text-gray-700">
                              SMS notifications
                              for booking updates
                            </span>
                          </label>
                          <label className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 mr-3 h-5 w-5"
                            />
                            <span className="text-gray-700">
                              Weekly report emails
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Styles */}
      <style jsx>{animationStyles}</style>
    </div>
  );
}
