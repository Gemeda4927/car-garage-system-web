"use client";

import { useGarages } from "@/lib/hooks/useGarage";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaStar,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";

export default function GaragesPage() {
  const { garages, loading, error, refetch } =
    useGarages();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium animate-pulse">
          Loading garages...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 text-lg font-medium">
          {error}
        </p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
        Garages Near You
      </h1>

      {garages.length === 0 ? (
        <p className="text-center text-gray-500">
          No garages found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {garages.map((garage) => (
            <div
              key={garage._id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 border border-gray-200 flex flex-col overflow-hidden"
            >
              {/* Placeholder Image */}
              <div className="h-48 w-full bg-gray-200 overflow-hidden">
                <img
                  src={`https://source.unsplash.com/400x200/?garage,car&sig=${garage._id}`}
                  alt={garage.name}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {garage.name}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {garage.isActive ? (
                    <span className="px-3 py-1 bg-gradient-to-r from-green-200 to-green-300 text-green-800 font-semibold rounded-full text-sm flex items-center gap-1">
                      <FaCheckCircle /> Open
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gradient-to-r from-red-200 to-red-300 text-red-800 font-semibold rounded-full text-sm flex items-center gap-1">
                      Closed
                    </span>
                  )}
                  {garage.isVerified && (
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 font-semibold rounded-full text-sm flex items-center gap-1">
                      <FaCheckCircle /> Verified
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {garage.description}
                </p>

                {/* Info Row */}
                <div className="flex flex-col gap-2 mb-4 text-gray-700">
                  <p className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" />{" "}
                    {garage.formattedAddress}
                  </p>
                  <p className="flex items-center gap-1 text-yellow-500">
                    <FaStar />{" "}
                    {garage.averageRating} (
                    {garage.totalReviews} reviews)
                  </p>
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-500" />{" "}
                    {garage.bookings.length}{" "}
                    Booking
                    {garage.bookings.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                {/* Action Button */}
                {garage.isActive && (
                  <Link
                    href={`/garages/${garage._id}`}
                    className="mt-auto inline-block w-full text-center px-4 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
