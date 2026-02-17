
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import {
  FaFacebook,
  FaApple,
} from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [rememberMe, setRememberMe] =
    useState(false);
  const [focusedField, setFocusedField] =
    useState<string | null>(null);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const result = await login({
      email,
      password,
    });

    if (result.success && result.data) {
      // Redirect based on role
      switch (result.data.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "garage_owner":
          router.push("/owner/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 mb-4 shadow-lg shadow-indigo-200" />
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-gray-500 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Sign In
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Social Login */}
          <div className="flex gap-3 mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all group">
              <FcGoogle className="h-5 w-5" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                Google
              </span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all group">
              <FaFacebook className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                Facebook
              </span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all group">
              <FaApple className="h-5 w-5 text-gray-900" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                Apple
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div
                className={`relative group ${focusedField === "email" ? "ring-2 ring-indigo-600 ring-offset-2" : ""}`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineMail
                    className={`h-5 w-5 transition-colors ${focusedField === "email" ? "text-indigo-600" : "text-gray-400"}`}
                  />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  onFocus={() =>
                    setFocusedField("email")
                  }
                  onBlur={() =>
                    setFocusedField(null)
                  }
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all bg-gray-50/50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div
                className={`relative group ${focusedField === "password" ? "ring-2 ring-indigo-600 ring-offset-2" : ""}`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed
                    className={`h-5 w-5 transition-colors ${focusedField === "password" ? "text-indigo-600" : "text-gray-400"}`}
                  />
                </div>
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  onFocus={() =>
                    setFocusedField("password")
                  }
                  onBlur={() =>
                    setFocusedField(null)
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all bg-gray-50/50 hover:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                <p className="text-red-600 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <HiOutlineArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Create Account Link - Added at bottom */}
            <div className="text-center mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                New to SmartGarage?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Create your account
                </Link>
              </p>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-4">
              By signing in, you agree to our{" "}
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

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}