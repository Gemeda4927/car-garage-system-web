"use client";

import Image from "next/image";
import {
  Star,
  MapPin,
  Wrench,
  Clock,
} from "lucide-react";

const garages = [
  {
    id: 1,
    name: "Premium Auto Garage",
    location: "Addis Ababa, Bole",
    rating: 4.9,
    status: "Open",
    services: [
      "Engine Repair",
      "Diagnostics",
      "Full Service",
    ],
    image:
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=1200",
  },
  {
    id: 2,
    name: "QuickFix Garage",
    location: "Addis Ababa, Mexico",
    rating: 4.6,
    status: "Open",
    services: [
      "Oil Change",
      "Tire Service",
      "Battery",
    ],
    image:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=1200",
  },
  {
    id: 3,
    name: "Smart Auto Care",
    location: "Adama",
    rating: 4.8,
    status: "Closed",
    services: [
      "Electrical",
      "AC Repair",
      "Inspection",
    ],
    image:
      "https://images.unsplash.com/photo-1581091012184-5c1f8b3e6a0d?q=80&w=1200",
  },
  {
    id: 4,
    name: "Elite Motors Garage",
    location: "Hawassa",
    rating: 4.7,
    status: "Open",
    services: [
      "Transmission",
      "Detailing",
      "Car Wash",
    ],
    image:
      "https://images.unsplash.com/photo-1597002974111-9c5f8b19c7f3?q=80&w=1200",
  },
  {
    id: 5,
    name: "Urban Auto Hub",
    location: "Bahir Dar",
    rating: 4.5,
    status: "Open",
    services: [
      "Brake Service",
      "Suspension",
      "Alignment",
    ],
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200",
  },
];

export default function GaragePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Discover Trusted Garages 🚗
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            Book reliable automotive services near
            you with confidence.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {garages.map((garage) => (
            <div
              key={garage.id}
              className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-56 w-full">
                <Image
                  src={garage.image}
                  alt={garage.name}
                  fill
                  className="object-cover"
                />

                {/* Status Badge */}
                <div
                  className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${
                    garage.status === "Open"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {garage.status}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {garage.name}
                </h2>

                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <MapPin
                    size={16}
                    className="text-indigo-500"
                  />
                  {garage.location}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-3">
                  <Star
                    size={16}
                    className="text-yellow-500 fill-yellow-500"
                  />
                  <span className="font-semibold text-gray-700">
                    {garage.rating}
                  </span>
                  <span className="text-gray-500 text-sm">
                    (120 reviews)
                  </span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {garage.services.map(
                    (service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      >
                        {service}
                      </span>
                    )
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition">
                    Book Now
                  </button>

                  <button className="flex-1 py-2 rounded-xl border border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-50 transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
