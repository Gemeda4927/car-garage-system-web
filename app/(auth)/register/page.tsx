"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegister } from "@/lib/hooks/useRegister";
import {
  FileUploadState,
  GarageRegistrationRequest,
  UserRole,
  GarageRegistrationFiles,
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
  HiOutlineDocumentText,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple, FaWarehouse } from "react-icons/fa";

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
          Registration Successful!
        </h3>
        <p className="text-gray-600 mb-6">
          Your account has been created successfully. You can now start using SmartGarage.
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

// Password Strength Indicator
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: "No password", color: "bg-gray-200" };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const strengths = [
      { score: 0, label: "Very Weak", color: "bg-red-500" },
      { score: 1, label: "Weak", color: "bg-orange-500" },
      { score: 2, label: "Fair", color: "bg-yellow-500" },
      { score: 3, label: "Good", color: "bg-blue-500" },
      { score: 4, label: "Strong", color: "bg-green-500" },
      { score: 5, label: "Very Strong", color: "bg-green-600" },
    ];

    return strengths[score] || strengths[0];
  };

  const strength = getStrength(password);
  const percentage = (strength.score / 5) * 100;

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-600">Password Strength:</span>
        <span className="text-xs font-medium" style={{ color: strength.color.replace('bg-', 'text-') }}>
          {strength.label}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${strength.color} transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Field Validation Message
const ValidationMessage = ({ message, type = "error" }: { message: string; type?: "error" | "info" | "success" }) => {
  const styles = {
    error: "text-red-500",
    info: "text-blue-500",
    success: "text-green-500"
  };

  const icons = {
    error: <HiOutlineExclamationCircle className="h-4 w-4" />,
    info: <HiOutlineInformationCircle className="h-4 w-4" />,
    success: <HiOutlineCheckCircle className="h-4 w-4" />
  };

  return (
    <p className={`${styles[type]} text-xs mt-1 flex items-center gap-1`}>
      {icons[type]}
      {message}
    </p>
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
    updateRole,
    register,
    reset,
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isSuccess) {
      setShowSuccessModal(true);
    }
  }, [isSuccess]);

  const handleChange = (
    field: keyof GarageRegistrationRequest,
    value: string | boolean | number
  ) => {
    setLocalError(null);
    updateFormField(field, value as any);
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const handleBlur = (field: keyof GarageRegistrationRequest) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const handleRoleChange = (role: UserRole) => {
    setLocalError(null);
    updateRole(role);
    setCurrentStep(1);
    setConfirmPassword("");
    setTouchedFields(new Set());
  };

  const handleFileUpload = (
    field: keyof GarageRegistrationFiles,
    file: File | null
  ) => {
    setLocalError(null);
    updateFile(field, file);
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      // Basic validation for step 1
      if (!formData.name?.trim()) {
        setLocalError("Full name is required");
        return false;
      }
      
      if (!formData.email?.trim()) {
        setLocalError("Email address is required");
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setLocalError("Please enter a valid email address");
        return false;
      }
      
      if (!formData.password) {
        setLocalError("Password is required");
        return false;
      }
      
      if (formData.password.length < 8) {
        setLocalError("Password must be at least 8 characters long");
        return false;
      }
      
      if (!formData.phone?.trim()) {
        setLocalError("Phone number is required");
        return false;
      }
      
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        setLocalError("Please enter a valid phone number");
        return false;
      }
      
      if (formData.role === "garage_owner") {
        if (!formData.businessName?.trim()) {
          setLocalError("Business name is required");
          return false;
        }
        
        if (!formData.businessRegNumber?.trim()) {
          setLocalError("Business registration number is required");
          return false;
        }
        
        if (!formData.address?.trim()) {
          setLocalError("Business address is required");
          return false;
        }
        
        if (!formData.businessPhone?.trim()) {
          setLocalError("Business phone is required");
          return false;
        }
        
        if (!formData.businessEmail?.trim()) {
          setLocalError("Business email is required");
          return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.businessEmail)) {
          setLocalError("Please enter a valid business email address");
          return false;
        }
        
        if (!formData.licenseNumber?.trim()) {
          setLocalError("License number is required");
          return false;
        }

        // Check required files
        const requiredFiles: (keyof GarageRegistrationFiles)[] = [
          "profileImage",
          "certificateOfIncorporation",
          "insuranceCertificate",
          "garageAgreement",
          "businessLicense"
        ];

        const missingFiles = requiredFiles.filter(key => !files[key]);
        if (missingFiles.length > 0) {
          setLocalError(`Please upload all required documents: ${missingFiles.join(", ")}`);
          return false;
        }
      }
      
      setLocalError(null);
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
      setLocalError(null);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate passwords match
    if (formData.password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    // Validate step based on role
    if (formData.role === "garage_owner") {
      if (currentStep === 1) {
        if (!validateStep(1)) return;
      }
    } else {
      // Validate vehicle owner
      if (!formData.name?.trim()) {
        setLocalError("Full name is required");
        return;
      }
      if (!formData.email?.trim()) {
        setLocalError("Email address is required");
        return;
      }
      if (!formData.password) {
        setLocalError("Password is required");
        return;
      }
      if (!formData.phone?.trim()) {
        setLocalError("Phone number is required");
        return;
      }
    }

    try {
      await register();
    } catch (err: any) {
      setLocalError(err.message || "Registration failed. Please try again.");
    }
  };

  const getFieldError = (field: keyof GarageRegistrationRequest) => {
    if (!touchedFields.has(field)) return undefined;
    
    // Check API validation errors
    if (validationErrors && validationErrors[field]) {
      return validationErrors[field];
    }
    
    // Client-side validation
    switch (field) {
      case "email":
        if (!formData.email) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return "Please enter a valid email address";
        break;
      case "phone":
        if (!formData.phone) return "Phone number is required";
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(formData.phone)) return "Please enter a valid phone number";
        break;
      case "password":
        if (!formData.password) return "Password is required";
        if (formData.password.length < 8) return "Password must be at least 8 characters";
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasNumbers = /\d/.test(formData.password);
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
          return "Password must contain uppercase, lowercase, and numbers";
        }
        break;
      case "businessEmail":
        if (formData.role === "garage_owner" && !formData.businessEmail) return "Business email is required";
        if (formData.businessEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.businessEmail)) return "Please enter a valid business email";
        }
        break;
      default:
        if (formData.role === "garage_owner") {
          const requiredFields: (keyof GarageRegistrationRequest)[] = [
            "businessName", "businessRegNumber", "address", 
            "businessPhone", "licenseNumber"
          ];
          if (requiredFields.includes(field) && !formData[field]) {
            return `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
          }
        }
    }
    
    return undefined;
  };

  const getInputClassName = (field: keyof GarageRegistrationRequest) => {
    const hasError = getFieldError(field);
    const isTouched = touchedFields.has(field);
    const isValid = isTouched && !hasError && formData[field];
    
    return `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white ${
      hasError ? "border-red-500 bg-red-50/50" : 
      isValid ? "border-green-500 bg-green-50/50" :
      "border-gray-200"
    }`;
  };

  const renderRequiredStar = (field: keyof GarageRegistrationRequest) => {
    const requiredFields: (keyof GarageRegistrationRequest)[] = [
      "name", "email", "password", "phone"
    ];
    
    if (formData.role === "garage_owner") {
      requiredFields.push(
        "businessName", "businessRegNumber", "address", 
        "businessPhone", "businessEmail", "licenseNumber"
      );
    }
    
    return requiredFields.includes(field) ? <span className="text-red-500">*</span> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">SG</span>
          </div>
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
              { icon: <FaApple className="h-5 w-5" />, label: "Apple" },
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
                  onClick={() => handleRoleChange("user")}
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
                  onClick={() => handleRoleChange("garage_owner")}
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

            {/* Progress Bar for Garage Owner */}
            {formData.role === "garage_owner" && (
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                  <span className="text-sm text-gray-500">Step {currentStep} of 2</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${currentStep * 50}%` }}
                  />
                </div>
              </div>
            )}

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
                      Full Name {renderRequiredStar("name")}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="John Doe"
                      className={getInputClassName("name")}
                    />
                    {getFieldError("name") && (
                      <ValidationMessage message={getFieldError("name")!} type="error" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address {renderRequiredStar("email")}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="john@example.com"
                      className={getInputClassName("email")}
                    />
                    {getFieldError("email") && (
                      <ValidationMessage message={getFieldError("email")!} type="error" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Phone Number {renderRequiredStar("phone")}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+251912345678"
                      className={getInputClassName("phone")}
                    />
                    {getFieldError("phone") && (
                      <ValidationMessage message={getFieldError("phone")!} type="error" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Password {renderRequiredStar("password")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        onBlur={() => handleBlur("password")}
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
                    {formData.password && <PasswordStrengthIndicator password={formData.password} />}
                    {getFieldError("password") && (
                      <ValidationMessage message={getFieldError("password")!} type="error" />
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
                        onBlur={() => setTouchedFields(prev => new Set(prev).add("confirmPassword"))}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white pr-12 ${
                          confirmPassword && formData.password !== confirmPassword
                            ? "border-red-500 bg-red-50/50"
                            : confirmPassword && formData.password === confirmPassword
                            ? "border-green-500 bg-green-50/50"
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
                      <ValidationMessage message="Passwords do not match" type="error" />
                    )}
                    {confirmPassword && formData.password === confirmPassword && (
                      <ValidationMessage message="✓ Passwords match" type="success" />
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
                          Business Name {renderRequiredStar("businessName")}
                        </label>
                        <input
                          type="text"
                          value={formData.businessName || ""}
                          onChange={(e) => handleChange("businessName", e.target.value)}
                          onBlur={() => handleBlur("businessName")}
                          placeholder="Premium Auto Care Ltd"
                          className={getInputClassName("businessName")}
                        />
                        {getFieldError("businessName") && (
                          <ValidationMessage message={getFieldError("businessName")!} type="error" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Registration Number {renderRequiredStar("businessRegNumber")}
                        </label>
                        <input
                          type="text"
                          value={formData.businessRegNumber || ""}
                          onChange={(e) => handleChange("businessRegNumber", e.target.value)}
                          onBlur={() => handleBlur("businessRegNumber")}
                          placeholder="RC-1234567"
                          className={getInputClassName("businessRegNumber")}
                        />
                        {getFieldError("businessRegNumber") && (
                          <ValidationMessage message={getFieldError("businessRegNumber")!} type="error" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Tax ID
                        </label>
                        <input
                          type="text"
                          value={formData.taxId || ""}
                          onChange={(e) => handleChange("taxId", e.target.value)}
                          placeholder="TAX-98765432"
                          className={getInputClassName("taxId")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          value={formData.yearsOfExperience || 0}
                          onChange={(e) => handleChange("yearsOfExperience", parseInt(e.target.value) || 0)}
                          placeholder="10"
                          className={getInputClassName("yearsOfExperience")}
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Business Address {renderRequiredStar("address")}
                        </label>
                        <input
                          type="text"
                          value={formData.address || ""}
                          onChange={(e) => handleChange("address", e.target.value)}
                          onBlur={() => handleBlur("address")}
                          placeholder="42 Auto Avenue, Ikeja"
                          className={getInputClassName("address")}
                        />
                        {getFieldError("address") && (
                          <ValidationMessage message={getFieldError("address")!} type="error" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city || ""}
                          onChange={(e) => handleChange("city", e.target.value)}
                          placeholder="Jimma"
                          className={getInputClassName("city")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state || ""}
                          onChange={(e) => handleChange("state", e.target.value)}
                          placeholder="Jimma"
                          className={getInputClassName("state")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country || "Ethiopia"}
                          onChange={(e) => handleChange("country", e.target.value)}
                          placeholder="Ethiopia"
                          className={getInputClassName("country")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          value={formData.zipCode || ""}
                          onChange={(e) => handleChange("zipCode", e.target.value)}
                          placeholder="100001"
                          className={getInputClassName("zipCode")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Phone {renderRequiredStar("businessPhone")}
                        </label>
                        <input
                          type="tel"
                          value={formData.businessPhone || ""}
                          onChange={(e) => handleChange("businessPhone", e.target.value)}
                          onBlur={() => handleBlur("businessPhone")}
                          placeholder="+2348034567890"
                          className={getInputClassName("businessPhone")}
                        />
                        {getFieldError("businessPhone") && (
                          <ValidationMessage message={getFieldError("businessPhone")!} type="error" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Business Email {renderRequiredStar("businessEmail")}
                        </label>
                        <input
                          type="email"
                          value={formData.businessEmail || ""}
                          onChange={(e) => handleChange("businessEmail", e.target.value)}
                          onBlur={() => handleBlur("businessEmail")}
                          placeholder="info@premiumautocare.com"
                          className={getInputClassName("businessEmail")}
                        />
                        {getFieldError("businessEmail") && (
                          <ValidationMessage message={getFieldError("businessEmail")!} type="error" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.website || ""}
                          onChange={(e) => handleChange("website", e.target.value)}
                          placeholder="https://premiumautocare.com"
                          className={getInputClassName("website")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Emergency Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.emergencyPhone || ""}
                          onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                          placeholder="+2348034567891"
                          className={getInputClassName("emergencyPhone")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          License Number {renderRequiredStar("licenseNumber")}
                        </label>
                        <input
                          type="text"
                          value={formData.licenseNumber || ""}
                          onChange={(e) => handleChange("licenseNumber", e.target.value)}
                          onBlur={() => handleBlur("licenseNumber")}
                          placeholder="BL-87654321"
                          className={getInputClassName("licenseNumber")}
                        />
                        {getFieldError("licenseNumber") && (
                          <ValidationMessage message={getFieldError("licenseNumber")!} type="error" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          value={formData.insuranceProvider || ""}
                          onChange={(e) => handleChange("insuranceProvider", e.target.value)}
                          placeholder="Leadway Assurance"
                          className={getInputClassName("insuranceProvider")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Insurance Number
                        </label>
                        <input
                          type="text"
                          value={formData.insuranceNumber || ""}
                          onChange={(e) => handleChange("insuranceNumber", e.target.value)}
                          placeholder="INS-12345678"
                          className={getInputClassName("insuranceNumber")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Insurance Expiry Date
                        </label>
                        <input
                          type="date"
                          value={formData.insuranceExpiry || ""}
                          onChange={(e) => handleChange("insuranceExpiry", e.target.value)}
                          className={getInputClassName("insuranceExpiry")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Number of Bays
                        </label>
                        <input
                          type="number"
                          value={formData.numberOfBays || 0}
                          onChange={(e) => handleChange("numberOfBays", parseInt(e.target.value) || 0)}
                          placeholder="5"
                          className={getInputClassName("numberOfBays")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Staff Count
                        </label>
                        <input
                          type="number"
                          value={formData.staffCount || 0}
                          onChange={(e) => handleChange("staffCount", parseInt(e.target.value) || 0)}
                          placeholder="12"
                          className={getInputClassName("staffCount")}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Established Year
                        </label>
                        <input
                          type="number"
                          value={formData.establishedYear || new Date().getFullYear()}
                          onChange={(e) => handleChange("establishedYear", parseInt(e.target.value) || new Date().getFullYear())}
                          placeholder="2014"
                          className={getInputClassName("establishedYear")}
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={formData.description || ""}
                          onChange={(e) => handleChange("description", e.target.value)}
                          placeholder="Premium Auto Care is a full-service automotive repair facility..."
                          rows={3}
                          className={getInputClassName("description")}
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Specialties
                        </label>
                        <textarea
                          value={formData.specialties || ""}
                          onChange={(e) => handleChange("specialties", e.target.value)}
                          placeholder="German cars, AC repair, Transmission"
                          rows={2}
                          className={getInputClassName("specialties")}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="available24_7"
                          checked={formData.available24_7 || false}
                          onChange={(e) => handleChange("available24_7", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <label htmlFor="available24_7" className="text-sm font-medium text-gray-700">
                          Available 24/7
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="emergencyServices"
                          checked={formData.emergencyServices || false}
                          onChange={(e) => handleChange("emergencyServices", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <label htmlFor="emergencyServices" className="text-sm font-medium text-gray-700">
                          Offer Emergency Services
                        </label>
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
                            Profile Image *
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload("profileImage", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                          {files.profileImage && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {files.profileImage.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Certificate of Incorporation *
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload("certificateOfIncorporation", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                          {files.certificateOfIncorporation && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {files.certificateOfIncorporation.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Insurance Certificate *
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload("insuranceCertificate", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                          {files.insuranceCertificate && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {files.insuranceCertificate.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Garage Agreement *
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload("garageAgreement", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                          {files.garageAgreement && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {files.garageAgreement.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Business License *
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload("businessLicense", e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                          />
                          {files.businessLicense && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {files.businessLicense.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                        <HiOutlineClock className="h-4 w-4 text-indigo-600" />
                        Operating Hours
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {([
                          "mondayHours",
                          "tuesdayHours",
                          "wednesdayHours",
                          "thursdayHours",
                          "fridayHours",
                          "saturdayHours",
                          "sundayHours"
                        ] as const).map((day) => (
                          <div key={day}>
                            <label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
                              {day.replace("Hours", "")}
                            </label>
                            <input
                              type="text"
                              value={formData[day] || ""}
                              onChange={(e) => handleChange(day, e.target.value)}
                              placeholder={day.includes("sunday") ? "Closed" : "8:00 AM - 6:00 PM"}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        Next: Services & Specialization
                        <HiOutlineArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {formData.role !== "garage_owner" && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
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
                        "Create Account"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Services & Specialization (Garage Owner only) */}
            {formData.role === "garage_owner" && currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    ← Back to Business Info
                  </button>
                  <span className="text-sm text-gray-500">Step 2 of 2</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <HiOutlineBuildingOffice2 className="h-5 w-5 text-indigo-600" />
                  Services & Specialization
                </h3>

                {/* Services */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Service Categories
                  </label>
                  <input
                    type="text"
                    value={formData.serviceCategories || ""}
                    onChange={(e) => handleChange("serviceCategories", e.target.value)}
                    onBlur={() => handleBlur("serviceCategories")}
                    placeholder="Oil Change, Brake Service, Engine Repair, AC Service"
                    className={getInputClassName("serviceCategories")}
                  />
                  {getFieldError("serviceCategories") && (
                    <ValidationMessage message={getFieldError("serviceCategories")!} type="error" />
                  )}
                  <p className="text-xs text-gray-500">
                    Enter services separated by commas
                  </p>
                </div>

                {/* Specialized Brands */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Specialized Brands
                  </label>
                  <input
                    type="text"
                    value={formData.specializedBrands || ""}
                    onChange={(e) => handleChange("specializedBrands", e.target.value)}
                    onBlur={() => handleBlur("specializedBrands")}
                    placeholder="Toyota, Honda, Mercedes-Benz, BMW"
                    className={getInputClassName("specializedBrands")}
                  />
                  {getFieldError("specializedBrands") && (
                    <ValidationMessage message={getFieldError("specializedBrands")!} type="error" />
                  )}
                  <p className="text-xs text-gray-500">
                    Enter vehicle brands you specialize in, separated by commas
                  </p>
                </div>

                {/* Certifications */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Certifications
                  </label>
                  <input
                    type="text"
                    value={formData.certifications || ""}
                    onChange={(e) => handleChange("certifications", e.target.value)}
                    onBlur={() => handleBlur("certifications")}
                    placeholder="ISO 9001, AAA Approved"
                    className={getInputClassName("certifications")}
                  />
                  {getFieldError("certifications") && (
                    <ValidationMessage message={getFieldError("certifications")!} type="error" />
                  )}
                  <p className="text-xs text-gray-500">
                    Enter your certifications separated by commas
                  </p>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-700">Social Media (Optional)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={formData.facebook || ""}
                        onChange={(e) => handleChange("facebook", e.target.value)}
                        placeholder="https://facebook.com/premiumautocare"
                        className={getInputClassName("facebook")}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={formData.instagram || ""}
                        onChange={(e) => handleChange("instagram", e.target.value)}
                        placeholder="https://instagram.com/premiumautocare"
                        className={getInputClassName("instagram")}
                      />
                    </div>
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

            {/* Error Display */}
            {(isError && error) || localError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm text-center">{localError || error}</p>
              </div>
            ) : null}

            {/* Validation Errors Summary */}
            {validationErrors && Object.keys(validationErrors).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-yellow-800 text-sm font-medium mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside text-xs text-yellow-700">
                  {Object.entries(validationErrors).map(([field, message]) => (
                    <li key={field}>{field}: {message}</li>
                  ))}
                </ul>
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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          reset();
        }}
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