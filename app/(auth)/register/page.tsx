"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/lib/hooks/useRegister";
import toast, { Toaster } from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const RegisterPage = () => {
  const router = useRouter();
  const {
    register,
    loading,
    error,
    data,
    clear,
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "car_owner" as "car_owner" | "garage_owner",
  });

  // Prefetch dashboard routes on mount for faster navigation
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/owner/dashboard");
  }, [router]);

  // Validate form fields
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Full name is required";
    } else if (form.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (form.password.length > 50) {
      errors.password = "Password must be less than 50 characters";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!phoneRegex.test(form.phone)) {
        errors.phone = "Please enter a valid phone number";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  // Handle input changes with validation
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await register(form);
      // Don't redirect here - let the useEffect handle it
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Registration failed. Please try again.");
    }
  };

  // Handle success & errors with optimized redirect
  useEffect(() => {
    if (data && !loading && !isRedirecting) {
      console.log(`✅ Registration successful for: ${form.email}`);
      toast.success("Account created successfully!");
      clear();
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRedirecting(true);
      
      // Determine redirect path based on role
      let redirectPath = "/dashboard";
      if (form.role === "garage_owner") {
        redirectPath = "/owner/dashboard";
      }
      
      console.log(`🔄 Redirecting to: ${redirectPath}`);
      
      // Small delay to ensure toast is shown and state is updated
      setTimeout(() => {
        router.replace(redirectPath);
      }, 500);
    }

    if (error && !loading) {
      console.error("Registration error:", error);
      toast.error(error);
      setIsRedirecting(false);
    }
  }, [data, error, loading, router, clear, form.role, form.email, isRedirecting]);

  // Show loading spinner while redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">
            Join us and manage your garage easily
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                disabled={loading || isRedirecting}
                className={`pl-12 w-full py-3 rounded-xl border ${
                  formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                } focus:ring-2 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed`}
                autoComplete="name"
              />
            </div>
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                disabled={loading || isRedirecting}
                className={`pl-12 w-full py-3 rounded-xl border ${
                  formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                } focus:ring-2 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed`}
                autoComplete="email"
              />
            </div>
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                disabled={loading || isRedirecting}
                className={`pl-12 pr-12 w-full py-3 rounded-xl border ${
                  formErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                } focus:ring-2 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed`}
                autoComplete="new-password"
              />
              <div
                onClick={() => !loading && !isRedirecting && setShowPassword(!showPassword)}
                className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-indigo-600 transition"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </div>
            </div>
            {formErrors.password && (
              <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.password}</p>
            )}
            {!formErrors.password && form.password && (
              <p className="text-green-500 text-xs mt-1 ml-2">✓ Strong password</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="relative">
              <PhoneIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                disabled={loading || isRedirecting}
                className={`pl-12 w-full py-3 rounded-xl border ${
                  formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                } focus:ring-2 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed`}
                autoComplete="tel"
              />
            </div>
            {formErrors.phone && (
              <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.phone}</p>
            )}
          </div>

          {/* Role */}
          <div className="relative">
            <UserGroupIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={loading || isRedirecting}
              className="pl-12 w-full py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="car_owner">Car Owner</option>
              <option value="garage_owner">Garage Owner</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isRedirecting}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => !loading && !isRedirecting && router.push("/login")}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>

      {/* Loading Modal with improved animation */}
      {loading && !isRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-fadeIn">
          {/* Glow Background */}
          <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-3xl rounded-full animate-pulse" />

          {/* Modal Card */}
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl p-10 text-center space-y-6 w-[320px] animate-scaleIn">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-600 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-white"></div>
            </div>

            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                Creating Your Account
              </h3>
              <p className="text-gray-600 text-sm mt-2">
                Please wait a moment...
              </p>
            </div>

            <div className="flex justify-center space-x-1">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></span>
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-200"></span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;