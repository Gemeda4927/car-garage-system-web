"use client";

import { useState, useEffect } from "react";
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

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "car_owner" as "car_owner" | "garage_owner",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    await register(form);
  };

  // Handle success & errors
  useEffect(() => {
    if (data) {
      toast.success(
        "Account created successfully!"
      );
      clear();

      if (form.role === "garage_owner") {
        router.push("/owner/dashboard");
      } else {
        router.push("/dashboard");
      }
    }

    if (error) toast.error(error);
  }, [data, error, router, clear, form.role]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Toaster position="top-right" />

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg" />
          <h1 className="text-3xl font-bold text-gray-800">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">
            Join us and manage your garage easily
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Name */}
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="pl-12 w-full py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="pl-12 w-full py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
            <input
              type={
                showPassword ? "text" : "password"
              }
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="pl-12 pr-12 w-full py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
            <div
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-indigo-600 transition"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="relative">
            <PhoneIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              className="pl-12 w-full py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Role */}
          <div className="relative">
            <UserGroupIcon className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="pl-12 w-full py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            >
              <option value="car_owner">
                Car Owner
              </option>
              <option value="garage_owner">
                Garage Owner
              </option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition"
          >
            Register
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>

      {/* Loading Modal */}
      {loading && (
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
              <p className="text-gray-600 text-sm mt-2 animate-pulse">
                Please wait a moment...
              </p>
            </div>

            <div className="flex justify-center space-x-1">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
