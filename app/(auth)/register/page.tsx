"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegister } from "@/lib/hooks/useRegister";
import {
  FileUploadState,
  GarageRegistrationRequest,
} from "@/lib/types/register.type";

// Heroicons v2
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePhone,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineBuildingOffice2,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple, FaTools, FaWarehouse } from "react-icons/fa";

// Payment Modal Component
const PaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 animate-fadeIn">
        <div className="text-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCreditCard className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Complete Payment</h3>
          <p className="text-gray-500 mt-2">
            Pay ₦5,000 to activate your garage account
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "card"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <HiOutlineCreditCard
                className={`h-6 w-6 mx-auto mb-2 ${
                  paymentMethod === "card" ? "text-indigo-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  paymentMethod === "card" ? "text-indigo-600" : "text-gray-700"
                }`}
              >
                Card Payment
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("transfer")}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "transfer"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <HiOutlineBuildingOffice2
                className={`h-6 w-6 mx-auto mb-2 ${
                  paymentMethod === "transfer" ? "text-indigo-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  paymentMethod === "transfer" ? "text-indigo-600" : "text-gray-700"
                }`}
              >
                Bank Transfer
              </span>
            </button>
          </div>

          {paymentMethod === "card" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Card Number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>
              <input
                type="text"
                placeholder="Cardholder Name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>
          )}

          {paymentMethod === "transfer" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bank:</span>
                <span className="font-medium text-gray-900">Guaranty Trust Bank</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium text-gray-900">0123456789</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Account Name:</span>
                <span className="font-medium text-gray-900">SmartGarage Ltd</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">₦5,000</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Make payment and click verify after transfer
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              `Pay ₦5,000`
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Modal
const SuccessModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <HiOutlineCheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600 mb-6">
          Your garage account has been activated. You can now start accepting bookings.
        </p>
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/dashboard");
          }}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const {
    formData,
    files,
    isLoading,
    isSuccess,
    isError,
    error,
    validationErrors,
    updateFormField,
    updateFile,
    register,
    reset,
    getFieldError,
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);

  useEffect(() => {
    if (formData.serviceCategories) {
      setSelectedServices(
        formData.serviceCategories.split(",").map((s) => s.trim())
      );
    }
    if (formData.specializedBrands) {
      setSelectedBrands(
        formData.specializedBrands.split(",").map((s) => s.trim())
      );
    }
    if (formData.certifications) {
      setSelectedCertifications(
        formData.certifications.split(",").map((s) => s.trim())
      );
    }
  }, [
    formData.serviceCategories,
    formData.specializedBrands,
    formData.certifications,
  ]);

  useEffect(() => {
    if (isSuccess && formData.role === "garage_owner") {
      setShowPaymentModal(true);
    } else if (isSuccess && formData.role === "user") {
      router.push("/dashboard");
    }
  }, [isSuccess, formData.role, router]);

  const serviceOptions = [
    "Oil Change", "Brake Service", "Engine Repair", "Transmission",
    "AC Service", "Electrical", "Tire Service", "Wheel Alignment",
    "Battery Service", "Diagnostics", "Inspection", "Detailing",
    "Paint Service", "Body Repair", "Performance Tuning",
  ];

  const brandOptions = [
    "Toyota", "Honda", "Mercedes-Benz", "BMW", "Audi", "Lexus",
    "Ford", "Chevrolet", "Nissan", "Hyundai", "Kia", "Mazda",
    "Volkswagen", "Porsche", "Ferrari", "Lamborghini", "Range Rover",
    "Jeep", "Mitsubishi", "Subaru",
  ];

  const certificationOptions = [
    "ASE Certified", "Manufacturer Trained", "EV Certified",
    "Hybrid Specialist", "Diesel Specialist", "Performance Specialist",
    "Classic Car Specialist", "Insurance Approved", "Government Licensed",
  ];

  const handleChange = (
    field: keyof GarageRegistrationRequest,
    value: string | boolean | number
  ) => {
    updateFormField(field, value as any);
  };

  const handleFileUpload = (
    field: keyof FileUploadState,
    file: File | null
  ) => {
    updateFile(field, file);
  };

  const handleServiceToggle = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];
    setSelectedServices(newServices);
    updateFormField("serviceCategories", newServices.join(","));
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    updateFormField("specializedBrands", newBrands.join(","));
  };

  const handleCertificationToggle = (cert: string) => {
    const newCerts = selectedCertifications.includes(cert)
      ? selectedCertifications.filter((c) => c !== cert)
      : [...selectedCertifications, cert];
    setSelectedCertifications(newCerts);
    updateFormField("certifications", newCerts.join(","));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return !!(
        formData.name &&
        formData.email &&
        formData.password &&
        formData.phone &&
        (formData.role !== "garage_owner" ||
          (formData.businessName &&
           formData.businessRegNumber &&
           formData.address &&
           formData.businessPhone &&
           formData.businessEmail &&
           formData.licenseNumber))
      );
    }
    return true; // Add real validation for step 2 if needed
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    await register();
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setShowSuccessModal(true);
    reset();
  };

  const getError = (field: keyof GarageRegistrationRequest) => {
    return getFieldError?.(field);
  };

  const getInputClassName = (field: keyof GarageRegistrationRequest) => {
    const hasError = getError(field);
    return `w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600 transition-all bg-gray-50/50 hover:bg-white ${
      hasError ? "border-red-500 bg-red-50/50" : "border-gray-200"
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 mb-4 shadow-lg shadow-indigo-200 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join SmartGarage today</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
            <p className="text-gray-500 text-sm mt-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="flex gap-3 mb-8">
            {[
              { icon: <FcGoogle className="h-5 w-5" />, label: "Google" },
              { icon: <FaFacebook className="h-5 w-5 text-blue-600" />, label: "Facebook" },
              { icon: <FaApple className="h-5 w-5 text-gray-900" />, label: "Apple" },
            ].map((item, index) => (
              <button
                key={index}
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all group"
              >
                {item.icon}
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleChange("role", "user")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === "user"
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <HiOutlineUser
                    className={`h-6 w-6 mx-auto mb-2 ${
                      formData.role === "user" ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                  <span className={`text-sm font-medium ${formData.role === "user" ? "text-indigo-600" : "text-gray-700"}`}>
                    Vehicle Owner
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange("role", "garage_owner")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === "garage_owner"
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <FaWarehouse
                    className={`h-6 w-6 mx-auto mb-2 ${
                      formData.role === "garage_owner" ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                  <span className={`text-sm font-medium ${formData.role === "garage_owner" ? "text-indigo-600" : "text-gray-700"}`}>
                    Garage Owner
                  </span>
                </button>
              </div>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <HiOutlineUser className="h-5 w-5 text-indigo-600" />
                  Basic Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      className={getInputClassName("name")}
                    />
                    {getError("name") && (
                      <p className="text-red-500 text-xs mt-1">{getError("name")}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="john@example.com"
                      className={getInputClassName("email")}
                    />
                    {getError("email") && (
                      <p className="text-red-500 text-xs mt-1">{getError("email")}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+234 123 456 7890"
                      className={getInputClassName("phone")}
                    />
                    {getError("phone") && (
                      <p className="text-red-500 text-xs mt-1">{getError("phone")}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="••••••••"
                        className={`${getInputClassName("password")} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <HiOutlineEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {getError("password") && (
                      <p className="text-red-500 text-xs mt-1">{getError("password")}</p>
                    )}
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600 transition-all bg-gray-50/50 hover:bg-white pr-12 ${
                          confirmPassword && formData.password !== confirmPassword
                            ? "border-red-500 bg-red-50/50"
                            : "border-gray-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <HiOutlineEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && formData.password !== confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                    )}
                    {confirmPassword && formData.password === confirmPassword && (
                      <p className="text-green-500 text-xs mt-1">✓ Passwords match</p>
                    )}
                  </div>
                </div>

                {formData.role === "garage_owner" && (
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                      <FaWarehouse className="h-4 w-4 text-indigo-600" />
                      Business Information
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.businessName || ""}
                          onChange={(e) => handleChange("businessName", e.target.value)}
                          placeholder="Premium Auto Care"
                          className={getInputClassName("businessName")}
                        />
                        {getError("businessName") && (
                          <p className="text-red-500 text-xs mt-1">{getError("businessName")}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Registration Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.businessRegNumber || ""}
                          onChange={(e) => handleChange("businessRegNumber", e.target.value)}
                          placeholder="RC-1234567"
                          className={getInputClassName("businessRegNumber")}
                        />
                        {getError("businessRegNumber") && (
                          <p className="text-red-500 text-xs mt-1">{getError("businessRegNumber")}</p>
                        )}
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Business Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.address || ""}
                          onChange={(e) => handleChange("address", e.target.value)}
                          placeholder="123 Mechanic Street, Lagos"
                          className={getInputClassName("address")}
                        />
                        {getError("address") && (
                          <p className="text-red-500 text-xs mt-1">{getError("address")}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.businessPhone || ""}
                          onChange={(e) => handleChange("businessPhone", e.target.value)}
                          placeholder="+234 987 654 3210"
                          className={getInputClassName("businessPhone")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.businessEmail || ""}
                          onChange={(e) => handleChange("businessEmail", e.target.value)}
                          placeholder="info@premiumautocare.com"
                          className={getInputClassName("businessEmail")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          License Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.licenseNumber || ""}
                          onChange={(e) => handleChange("licenseNumber", e.target.value)}
                          placeholder="LAG/GAR/2023/001"
                          className={getInputClassName("licenseNumber")}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                        <HiOutlineDocumentText className="h-4 w-4 text-indigo-600" />
                        Required Documents
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Profile Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload("profileImage", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Certificate of Incorporation
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload("certificateOfIncorporation", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Insurance Certificate
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload("insuranceCertificate", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Garage Agreement
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload("garageAgreement", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Business License
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload("businessLicense", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        Next: Additional Details
                        <HiOutlineArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {(formData.role !== "garage_owner" || currentStep === 1) && (
                  <div className="flex justify-end">
                    {formData.role === "garage_owner" ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        Next
                        <HiOutlineArrowRight className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading ? "Creating..." : "Create Account"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Additional Details (Garage Owner only) */}
            {formData.role === "garage_owner" && currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    ← Back to Basic Info
                  </button>
                  <span className="text-sm text-gray-500">Step 2 of 2</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <HiOutlineBuildingOffice2 className="h-5 w-5 text-indigo-600" />
                  Garage Services & Specialization
                </h3>

                {/* Services */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Services Offered (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {serviceOptions.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          selectedServices.includes(service)
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-indigo-300 text-gray-700"
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Specialized Brands
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {brandOptions.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => handleBrandToggle(brand)}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          selectedBrands.includes(brand)
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-indigo-300 text-gray-700"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Certifications
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {certificationOptions.map((cert) => (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => handleCertificationToggle(cert)}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          selectedCertifications.includes(cert)
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-indigo-300 text-gray-700"
                        }`}
                      >
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>
              </div>
            )}

            {isError && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <p className="text-center text-xs text-gray-500 mt-8">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          router.push("/dashboard");
        }}
        onSuccess={handlePaymentSuccess}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}