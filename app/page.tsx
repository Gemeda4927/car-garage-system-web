"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-24 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* ================= LEFT CONTENT ================= */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Trusted by 1,000+ vehicle owners
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl md:text-6xl">
                Smarter Way to
                <span className="block text-indigo-600">
                  Manage & Book Garages
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-lg leading-relaxed text-gray-600">
                A secure digital platform
                connecting car owners with
                verified garages. Book instantly,
                monitor availability in real-time,
                and simplify vehicle storage
                management.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/garages"
                  className="rounded-xl border border-gray-300 px-7 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Explore Garages
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-8 pt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Secure Payments
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  24/7 Support
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  Verified Providers
                </div>
              </div>
            </div>

            {/* ================= RIGHT IMAGE ================= */}
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-2xl">
                <Image
                  src="/image.png" // Put inside public folder
                  alt="Modern Garage Interior"
                  width={900}
                  height={700}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
