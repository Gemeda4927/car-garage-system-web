// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

// Heroicons (Hi)
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePhone,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

import { FcGoogle } from "react-icons/fc";

import {
  FaFacebook,
  FaApple,
  FaTools,
  FaWarehouse,
} from "react-icons/fa";

type UserRole = "user" | "garage_owner";

interface GarageOwnerData {
  businessName: string;
  businessRegNumber: string;
  taxId: string;
  yearsOfExperience: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  businessPhone: string;
  businessEmail: string;
  website: string;
  serviceCategories: string[];
  specializedBrands: string[];
  numberOfBays: string;
  staffCount: string;
  mondayHours: string;
  tuesdayHours: string;
  wednesdayHours: string;
  thursdayHours: string;
  fridayHours: string;
  saturdayHours: string;
  sundayHours: string;
  emergencyServices: boolean;
  certifications: string[];
  insuranceProvider: string;
  insuranceNumber: string;
  licenseNumber: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  description: string;
  specialties: string;
  establishedYear: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  garageInfo?: GarageOwnerData;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  businessName?: string;
  businessRegNumber?: string;
  address?: string;
  businessPhone?: string;
  businessEmail?: string;
  licenseNumber?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  description?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } =
    useAuth();

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] =
    useState<UserRole>("user");
  const [showPassword, setShowPassword] =
    useState(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);
  const [focusedField, setFocusedField] =
    useState<string | null>(null);
  const [errors, setErrors] =
    useState<ValidationErrors>({});
  const [currentStep, setCurrentStep] =
    useState(1);
  const [touchedFields, setTouchedFields] =
    useState<Set<string>>(new Set());

  // Garage owner specific fields
  const [garageData, setGarageData] =
    useState<GarageOwnerData>({
      businessName: "",
      businessRegNumber: "",
      taxId: "",
      yearsOfExperience: "",
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
      zipCode: "",
      businessPhone: "",
      businessEmail: "",
      website: "",
      serviceCategories: [],
      specializedBrands: [],
      numberOfBays: "",
      staffCount: "",
      mondayHours: "9:00 AM - 6:00 PM",
      tuesdayHours: "9:00 AM - 6:00 PM",
      wednesdayHours: "9:00 AM - 6:00 PM",
      thursdayHours: "9:00 AM - 6:00 PM",
      fridayHours: "9:00 AM - 6:00 PM",
      saturdayHours: "10:00 AM - 4:00 PM",
      sundayHours: "Closed",
      emergencyServices: false,
      certifications: [],
      insuranceProvider: "",
      insuranceNumber: "",
      licenseNumber: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      description: "",
      specialties: "",
      establishedYear: "",
    });

  const [selectedServices, setSelectedServices] =
    useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] =
    useState<string[]>([]);
  const [
    selectedCertifications,
    setSelectedCertifications,
  ] = useState<string[]>([]);

  const serviceOptions = [
    "Oil Change",
    "Brake Service",
    "Engine Repair",
    "Transmission",
    "AC Service",
    "Electrical",
    "Tire Service",
    "Wheel Alignment",
    "Battery Service",
    "Diagnostics",
    "Inspection",
    "Detailing",
    "Paint Service",
    "Body Repair",
    "Performance Tuning",
  ];

  const brandOptions = [
    "Toyota",
    "Honda",
    "Mercedes-Benz",
    "BMW",
    "Audi",
    "Lexus",
    "Ford",
    "Chevrolet",
    "Nissan",
    "Hyundai",
    "Kia",
    "Mazda",
    "Volkswagen",
    "Porsche",
    "Ferrari",
    "Lamborghini",
    "Range Rover",
    "Jeep",
    "Mitsubishi",
    "Subaru",
  ];

  const certificationOptions = [
    "ASE Certified",
    "Manufacturer Trained",
    "EV Certified",
    "Hybrid Specialist",
    "Diesel Specialist",
    "Performance Specialist",
    "Classic Car Specialist",
    "Insurance Approved",
    "Government Licensed",
  ];

  // Validation functions
  const validateField = (
    field: string,
    value: string
  ): string | undefined => {
    switch (field) {
      case "name":
        if (!value) return "Name is required";
        if (value.length < 2)
          return "Name must be at least 2 characters";
        return undefined;

      case "email":
        if (!value) return "Email is required";
        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value
          )
        )
          return "Please enter a valid email address";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8)
          return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value))
          return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value))
          return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value))
          return "Password must contain at least one number";
        return undefined;

      case "phone":
        if (!value)
          return "Phone number is required";
        if (
          !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
            value
          )
        ) {
          return "Please enter a valid phone number";
        }
        return undefined;

      case "businessName":
        if (!value)
          return "Business name is required";
        return undefined;

      case "businessRegNumber":
        if (!value)
          return "Business registration number is required";
        return undefined;

      case "address":
        if (!value)
          return "Business address is required";
        return undefined;

      case "businessPhone":
        if (!value)
          return "Business phone is required";
        if (
          !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
            value
          )
        ) {
          return "Please enter a valid phone number";
        }
        return undefined;

      case "businessEmail":
        if (!value)
          return "Business email is required";
        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value
          )
        )
          return "Please enter a valid email address";
        return undefined;

      case "licenseNumber":
        if (!value)
          return "Business license number is required";
        return undefined;

      case "bankName":
        if (!value)
          return "Bank name is required";
        return undefined;

      case "accountNumber":
        if (!value)
          return "Account number is required";
        if (!/^\d+$/.test(value))
          return "Account number must contain only digits";
        if (value.length < 10)
          return "Account number must be at least 10 digits";
        return undefined;

      case "accountName":
        if (!value)
          return "Account name is required";
        return undefined;

      case "description":
        if (!value)
          return "Business description is required";
        if (value.length < 20)
          return "Description must be at least 20 characters";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (
    field: string,
    value: string
  ) => {
    setTouchedFields((prev) =>
      new Set(prev).add(field)
    );
    const error = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleChange = (
    field: string,
    value: string,
    setter: (value: string) => void
  ) => {
    setter(value);
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateStep = (
    step: number
  ): boolean => {
    const newErrors: ValidationErrors = {};

    if (step === 1) {
      // Validate common fields
      const nameError = validateField(
        "name",
        name
      );
      if (nameError) newErrors.name = nameError;

      const emailError = validateField(
        "email",
        email
      );
      if (emailError)
        newErrors.email = emailError;

      const phoneError = validateField(
        "phone",
        phone
      );
      if (phoneError)
        newErrors.phone = phoneError;

      const passwordError = validateField(
        "password",
        password
      );
      if (passwordError)
        newErrors.password = passwordError;

      if (password !== confirmPassword) {
        newErrors.confirmPassword =
          "Passwords do not match";
      }

      if (role === "garage_owner") {
        const businessNameError = validateField(
          "businessName",
          garageData.businessName
        );
        if (businessNameError)
          newErrors.businessName =
            businessNameError;

        const businessRegError = validateField(
          "businessRegNumber",
          garageData.businessRegNumber
        );
        if (businessRegError)
          newErrors.businessRegNumber =
            businessRegError;

        const addressError = validateField(
          "address",
          garageData.address
        );
        if (addressError)
          newErrors.address = addressError;

        const businessPhoneError = validateField(
          "businessPhone",
          garageData.businessPhone
        );
        if (businessPhoneError)
          newErrors.businessPhone =
            businessPhoneError;

        const businessEmailError = validateField(
          "businessEmail",
          garageData.businessEmail
        );
        if (businessEmailError)
          newErrors.businessEmail =
            businessEmailError;

        const licenseError = validateField(
          "licenseNumber",
          garageData.licenseNumber
        );
        if (licenseError)
          newErrors.licenseNumber = licenseError;
      }
    } else if (step === 2) {
      const bankNameError = validateField(
        "bankName",
        garageData.bankName
      );
      if (bankNameError)
        newErrors.bankName = bankNameError;

      const accountNumberError = validateField(
        "accountNumber",
        garageData.accountNumber
      );
      if (accountNumberError)
        newErrors.accountNumber =
          accountNumberError;

      const accountNameError = validateField(
        "accountName",
        garageData.accountName
      );
      if (accountNameError)
        newErrors.accountName = accountNameError;

      const descriptionError = validateField(
        "description",
        garageData.description
      );
      if (descriptionError)
        newErrors.description = descriptionError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(1)) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateStep(role === "user" ? 1 : 2)) {
      // Scroll to first error
      const firstErrorField =
        Object.keys(errors)[0];
      const element = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const registerData: RegisterData = {
      name,
      email,
      password,
      phone,
      role,
    };

    if (role === "garage_owner") {
      registerData.garageInfo = garageData;
    }

    const result = await register(registerData);

    if (result.success) {
      router.push("/dashboard");
    }
  };

  const handleGarageDataChange = (
    field: keyof GarageOwnerData,
    value: unknown
  ) => {
    setGarageData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleServiceToggle = (
    service: string
  ) => {
    setSelectedServices((prev) => {
      const newServices = prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service];
      handleGarageDataChange(
        "serviceCategories",
        newServices
      );
      return newServices;
    });
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) => {
      const newBrands = prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand];
      handleGarageDataChange(
        "specializedBrands",
        newBrands
      );
      return newBrands;
    });
  };

  const handleCertificationToggle = (
    cert: string
  ) => {
    setSelectedCertifications((prev) => {
      const newCerts = prev.includes(cert)
        ? prev.filter((c) => c !== cert)
        : [...prev, cert];
      handleGarageDataChange(
        "certifications",
        newCerts
      );
      return newCerts;
    });
  };

  const getFieldError = (
    fieldName: keyof ValidationErrors
  ) => {
    return touchedFields.has(fieldName) &&
      errors[fieldName]
      ? errors[fieldName]
      : undefined;
  };

  const getFieldClassName = (
    fieldName: keyof ValidationErrors
  ) => {
    const error = getFieldError(fieldName);
    return `w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600 transition-all bg-gray-50/50 hover:bg-white ${
      error
        ? "border-red-500 bg-red-50/50"
        : "border-gray-200"
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 mb-4 shadow-lg shadow-indigo-200 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="text-gray-500 mt-2">
            Join SmartGarage today
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Sign Up
            </h2>
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

          {/* Social Sign Up */}
          <div className="flex gap-3 mb-8">
            {[
              {
                icon: (
                  <FcGoogle className="h-5 w-5" />
                ),
                label: "Google",
              },
              {
                icon: (
                  <FaFacebook className="h-5 w-5 text-blue-600" />
                ),
                label: "Facebook",
              },
              {
                icon: (
                  <FaApple className="h-5 w-5 text-gray-900" />
                ),
                label: "Apple",
              },
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

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or sign up with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Account Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === "user"
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <HiOutlineUser
                    className={`h-6 w-6 mx-auto mb-2 ${
                      role === "user"
                        ? "text-indigo-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${role === "user" ? "text-indigo-600" : "text-gray-700"}`}
                  >
                    Vehicle Owner
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRole("garage_owner")
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === "garage_owner"
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <FaWarehouse
                    className={`h-6 w-6 mx-auto mb-2 ${
                      role === "garage_owner"
                        ? "text-indigo-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${role === "garage_owner" ? "text-indigo-600" : "text-gray-700"}`}
                  >
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
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) =>
                        handleChange(
                          "name",
                          e.target.value,
                          setName
                        )
                      }
                      onFocus={() =>
                        setFocusedField("name")
                      }
                      onBlur={() => {
                        setFocusedField(null);
                        handleBlur("name", name);
                      }}
                      placeholder="John Doe"
                      className={getFieldClassName(
                        "name"
                      )}
                    />
                    {getFieldError("name") && (
                      <p className="text-red-500 text-xs mt-1">
                        {getFieldError("name")}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) =>
                        handleChange(
                          "email",
                          e.target.value,
                          setEmail
                        )
                      }
                      onFocus={() =>
                        setFocusedField("email")
                      }
                      onBlur={() => {
                        setFocusedField(null);
                        handleBlur(
                          "email",
                          email
                        );
                      }}
                      placeholder="john@example.com"
                      className={getFieldClassName(
                        "email"
                      )}
                    />
                    {getFieldError("email") && (
                      <p className="text-red-500 text-xs mt-1">
                        {getFieldError("email")}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Phone Number{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) =>
                        handleChange(
                          "phone",
                          e.target.value,
                          setPhone
                        )
                      }
                      onFocus={() =>
                        setFocusedField("phone")
                      }
                      onBlur={() => {
                        setFocusedField(null);
                        handleBlur(
                          "phone",
                          phone
                        );
                      }}
                      placeholder="+234 123 456 7890"
                      className={getFieldClassName(
                        "phone"
                      )}
                    />
                    {getFieldError("phone") && (
                      <p className="text-red-500 text-xs mt-1">
                        {getFieldError("phone")}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Password{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={password}
                        onChange={(e) =>
                          handleChange(
                            "password",
                            e.target.value,
                            setPassword
                          )
                        }
                        onFocus={() =>
                          setFocusedField(
                            "password"
                          )
                        }
                        onBlur={() => {
                          setFocusedField(null);
                          handleBlur(
                            "password",
                            password
                          );
                        }}
                        placeholder="••••••••"
                        className={`${getFieldClassName("password")} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {getFieldError("password") ? (
                      <p className="text-red-500 text-xs mt-1">
                        {getFieldError(
                          "password"
                        )}
                      </p>
                    ) : (
                      password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`h-1 w-1 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                            />
                            <span
                              className={
                                password.length >=
                                8
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            >
                              At least 8
                              characters
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`h-1 w-1 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                            />
                            <span
                              className={
                                /[A-Z]/.test(
                                  password
                                )
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            >
                              One uppercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`h-1 w-1 rounded-full ${/[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                            />
                            <span
                              className={
                                /[a-z]/.test(
                                  password
                                )
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            >
                              One lowercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`h-1 w-1 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                            />
                            <span
                              className={
                                /[0-9]/.test(
                                  password
                                )
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            >
                              One number
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirm Password{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        onFocus={() =>
                          setFocusedField(
                            "confirmPassword"
                          )
                        }
                        onBlur={() => {
                          setFocusedField(null);
                          if (
                            password !==
                            confirmPassword
                          ) {
                            setErrors((prev) => ({
                              ...prev,
                              confirmPassword:
                                "Passwords do not match",
                            }));
                          }
                        }}
                        placeholder="••••••••"
                        className={`${getFieldClassName("confirmPassword")} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword &&
                      touchedFields.has(
                        "confirmPassword"
                      ) && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    {confirmPassword &&
                      password ===
                        confirmPassword && (
                        <p className="text-green-500 text-xs mt-1">
                          ✓ Passwords match
                        </p>
                      )}
                  </div>
                </div>

                {/* Garage Owner Step 1 Fields */}
                {role === "garage_owner" && (
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                      <FaWarehouse className="h-4 w-4 text-indigo-600" />
                      Business Information
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Business Name */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Name{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={
                            garageData.businessName
                          }
                          onChange={(e) =>
                            handleGarageDataChange(
                              "businessName",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleBlur(
                              "businessName",
                              garageData.businessName
                            )
                          }
                          placeholder="Premium Auto Care"
                          className={getFieldClassName(
                            "businessName"
                          )}
                        />
                        {getFieldError(
                          "businessName"
                        ) && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError(
                              "businessName"
                            )}
                          </p>
                        )}
                      </div>

                      {/* Registration Number */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Registration Number{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="businessRegNumber"
                          value={
                            garageData.businessRegNumber
                          }
                          onChange={(e) =>
                            handleGarageDataChange(
                              "businessRegNumber",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleBlur(
                              "businessRegNumber",
                              garageData.businessRegNumber
                            )
                          }
                          placeholder="RC-123456"
                          className={getFieldClassName(
                            "businessRegNumber"
                          )}
                        />
                        {getFieldError(
                          "businessRegNumber"
                        ) && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError(
                              "businessRegNumber"
                            )}
                          </p>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Business Address{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={
                            garageData.address
                          }
                          onChange={(e) =>
                            handleGarageDataChange(
                              "address",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleBlur(
                              "address",
                              garageData.address
                            )
                          }
                          placeholder="123 Auto Avenue, Lagos"
                          className={getFieldClassName(
                            "address"
                          )}
                        />
                        {getFieldError(
                          "address"
                        ) && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError(
                              "address"
                            )}
                          </p>
                        )}
                      </div>

                      {/* Business Phone */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Phone{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>
                        <input
                          type="tel"
                          name="businessPhone"
                          value={
                            garageData.businessPhone
                          }
                          onChange={(e) =>
                            handleGarageDataChange(
                              "businessPhone",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleBlur(
                              "businessPhone",
                              garageData.businessPhone
                            )
                          }
                          placeholder="+234 123 456 7890"
                          className={getFieldClassName(
                            "businessPhone"
                          )}
                        />
                        {getFieldError(
                          "businessPhone"
                        ) && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError(
                              "businessPhone"
                            )}
                          </p>
                        )}
                      </div>

                      {/* Business Email */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Email{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>
                        <input
                          type="email"
                          name="businessEmail"
                          value={
                            garageData.businessEmail
                          }
                          onChange={(e) =>
                            handleGarageDataChange(
                              "businessEmail",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleBlur(
                              "businessEmail",
                              garageData.businessEmail
                            )
                          }
                          placeholder="contact@garage.com"
                          className={getFieldClassName(
                            "businessEmail"
                          )}
                        />
                        {getFieldError(
                          "businessEmail"
                        ) && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError(
                              "businessEmail"
                            )}
                          </p>
                        )}
                      </div>

                      {/* License Number */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          License Number{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={
                            garageData.licenseNumber
                          }
                          onChange={(e) =>
                            handleGarageDataChange(
                              "licenseNumber",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleBlur(
                              "licenseNumber",
                              garageData.licenseNumber
                            )
                          }
                          placeholder="BL-123456"
                          className={getFieldClassName(
                            "licenseNumber"
                          )}
                        />
                        {getFieldError(
                          "licenseNumber"
                        ) && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError(
                              "licenseNumber"
                            )}
                          </p>
                        )}
                      </div>

                      {/* Years of Experience */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          value={
                            garageData.yearsOfExperience
                          }
                          onChange={(e) =>
                            handleGarageDataChange(
                              "yearsOfExperience",
                              e.target.value
                            )
                          }
                          placeholder="5"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all bg-gray-50/50 hover:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Button */}
                {role === "garage_owner" && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      Next: Bank Details
                      <HiOutlineArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Bank Details */}
            {role === "garage_owner" &&
              currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      ← Back
                    </button>
                    <span className="text-sm text-gray-500">
                      Step 2 of 2
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HiOutlineCurrencyDollar className="h-5 w-5 text-indigo-600" />
                    Bank Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Bank Name */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Bank Name{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={
                          garageData.bankName
                        }
                        onChange={(e) =>
                          handleGarageDataChange(
                            "bankName",
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          handleBlur(
                            "bankName",
                            garageData.bankName
                          )
                        }
                        placeholder="First Bank"
                        className={getFieldClassName(
                          "bankName"
                        )}
                      />
                      {getFieldError(
                        "bankName"
                      ) && (
                        <p className="text-red-500 text-xs mt-1">
                          {getFieldError(
                            "bankName"
                          )}
                        </p>
                      )}
                    </div>

                    {/* Account Number */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Account Number{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={
                          garageData.accountNumber
                        }
                        onChange={(e) =>
                          handleGarageDataChange(
                            "accountNumber",
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          handleBlur(
                            "accountNumber",
                            garageData.accountNumber
                          )
                        }
                        placeholder="0123456789"
                        className={getFieldClassName(
                          "accountNumber"
                        )}
                      />
                      {getFieldError(
                        "accountNumber"
                      ) && (
                        <p className="text-red-500 text-xs mt-1">
                          {getFieldError(
                            "accountNumber"
                          )}
                        </p>
                      )}
                    </div>

                    {/* Account Name */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Account Name{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        value={
                          garageData.accountName
                        }
                        onChange={(e) =>
                          handleGarageDataChange(
                            "accountName",
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          handleBlur(
                            "accountName",
                            garageData.accountName
                          )
                        }
                        placeholder="Premium Auto Care Ltd"
                        className={getFieldClassName(
                          "accountName"
                        )}
                      />
                      {getFieldError(
                        "accountName"
                      ) && (
                        <p className="text-red-500 text-xs mt-1">
                          {getFieldError(
                            "accountName"
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Business Description */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Business Description{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>
                    <textarea
                      name="description"
                      value={
                        garageData.description
                      }
                      onChange={(e) =>
                        handleGarageDataChange(
                          "description",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleBlur(
                          "description",
                          garageData.description
                        )
                      }
                      placeholder="Tell us about your garage, your mission, and what makes you unique..."
                      rows={4}
                      className={getFieldClassName(
                        "description"
                      )}
                    />
                    {getFieldError(
                      "description"
                    ) ? (
                      <p className="text-red-500 text-xs mt-1">
                        {getFieldError(
                          "description"
                        )}
                      </p>
                    ) : (
                      garageData.description &&
                      garageData.description
                        .length < 20 && (
                        <p className="text-amber-500 text-xs mt-1">
                          {20 -
                            garageData.description
                              .length}{" "}
                          more characters needed
                        </p>
                      )
                    )}
                  </div>

                  {/* Services & Specialties */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                      <FaTools className="h-4 w-4 text-indigo-600" />
                      Services & Specialties
                    </h4>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Services Offered
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {serviceOptions.map(
                          (service) => (
                            <label
                              key={service}
                              className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedServices.includes(
                                  service
                                )}
                                onChange={() =>
                                  handleServiceToggle(
                                    service
                                  )
                                }
                                className="rounded text-indigo-600"
                              />
                              <span className="text-sm text-gray-700">
                                {service}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Specialized Brands
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {brandOptions.map(
                          (brand) => (
                            <label
                              key={brand}
                              className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(
                                  brand
                                )}
                                onChange={() =>
                                  handleBrandToggle(
                                    brand
                                  )
                                }
                                className="rounded text-indigo-600"
                              />
                              <span className="text-sm text-gray-700">
                                {brand}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                      <HiOutlineClock className="h-4 w-4 text-indigo-600" />
                      Business Hours
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          day: "mondayHours",
                          label: "Monday",
                        },
                        {
                          day: "tuesdayHours",
                          label: "Tuesday",
                        },
                        {
                          day: "wednesdayHours",
                          label: "Wednesday",
                        },
                        {
                          day: "thursdayHours",
                          label: "Thursday",
                        },
                        {
                          day: "fridayHours",
                          label: "Friday",
                        },
                        {
                          day: "saturdayHours",
                          label: "Saturday",
                        },
                        {
                          day: "sundayHours",
                          label: "Sunday",
                        },
                      ].map(({ day, label }) => (
                        <div
                          key={day}
                          className="space-y-1"
                        >
                          <label className="text-sm font-medium text-gray-700">
                            {label}
                          </label>
                          <input
                            type="text"
                            value={
                              garageData[
                                day as keyof GarageOwnerData
                              ] as string
                            }
                            onChange={(e) =>
                              handleGarageDataChange(
                                day as keyof GarageOwnerData,
                                e.target.value
                              )
                            }
                            placeholder="9:00 AM - 6:00 PM"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                      <HiOutlineShieldCheck className="h-4 w-4 text-indigo-600" />
                      Certifications
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {certificationOptions.map(
                        (cert) => (
                          <label
                            key={cert}
                            className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(
                                cert
                              )}
                              onChange={() =>
                                handleCertificationToggle(
                                  cert
                                )
                              }
                              className="rounded text-indigo-600"
                            />
                            <span className="text-sm text-gray-700">
                              {cert}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* API Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            {(role === "user" ||
              (role === "garage_owner" &&
                currentStep === 2)) && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
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
                    <span>
                      Creating account...
                    </span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <HiOutlineArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}

            {/* Terms */}
            <p className="text-center text-xs text-gray-500">
              By signing up, you agree to our{" "}
              <Link
                href="/terms"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>

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
