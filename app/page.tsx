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
  MapPin,
  Phone,
  Mail,
  Calendar,
  Wrench,
  Car,
  Award,
  Quote,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  Heart,
  Headphones,
  Key,
  Settings,
  Battery,
  Wind,
  Droplet,
  Thermometer,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-24 border-b border-gray-100 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* LEFT CONTENT */}
            <div className="space-y-8">
              {/* Badge with animation */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>
                  Trusted by 1,000+ vehicle owners
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  NEW
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl md:text-6xl">
                Smarter Way to{" "}
                <span className="relative">
                  <span className="relative z-10 text-indigo-600">
                    Manage & Book Garages
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-indigo-200"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,5 Q25,0 50,5 T100,5"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                  </svg>
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
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:scale-105 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>

                <Link
                  href="/garages"
                  className="group rounded-xl border-2 border-gray-200 px-7 py-3.5 font-semibold text-gray-700 transition-all hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/50"
                >
                  <span className="flex items-center gap-2">
                    Explore Garages
                    <Zap className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </Link>
              </div>

              {/* Trust Indicators with enhanced icons */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div className="flex items-center gap-2 group">
                  <div className="p-2 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Secure Payments
                  </span>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="p-2 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    24/7 Support
                  </span>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="p-2 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Verified Providers
                  </span>
                </div>
              </div>

              {/* Partner logos */}
              <div className="pt-6">
                <p className="text-xs text-gray-400 mb-3">
                  Trusted by leading automotive
                  brands
                </p>
                <div className="flex items-center gap-6 opacity-60">
                  <span className="text-sm font-semibold text-gray-400">
                    MERCEDES
                  </span>
                  <span className="text-sm font-semibold text-gray-400">
                    BMW
                  </span>
                  <span className="text-sm font-semibold text-gray-400">
                    AUDI
                  </span>
                  <span className="text-sm font-semibold text-gray-400">
                    TOYOTA
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative">
              {/* Main Image with decorative elements */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-2xl">
                  <Image
                    src="/image.png"
                    alt="Modern Garage Interior"
                    width={900}
                    height={700}
                    priority
                    className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-xl border border-gray-100 hidden lg:block hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      500+
                    </p>
                    <p className="text-xs text-gray-500">
                      Active Partner Garages
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 rounded-xl bg-white p-4 shadow-xl border border-gray-100 hidden lg:block hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2.5">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      10K+
                    </p>
                    <p className="text-xs text-gray-500">
                      Happy Customers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="py-24 border-b border-gray-100 bg-gradient-to-br from-white to-indigo-50/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* About Image */}
            <div className="relative">
              <div className="relative h-[600px] overflow-hidden rounded-3xl shadow-2xl group">
                <Image
                  src="/image2.png"
                  alt="Professional mechanic working on luxury vehicle"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent"></div>

                {/* Floating badges */}
                <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-4 py-2 shadow-lg">
                  <Award className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold text-gray-900">
                    10+ Years Excellence
                  </span>
                </div>

                <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 shadow-lg">
                  <Star className="h-4 w-4 text-white" />
                  <span className="font-semibold text-white">
                    4.9/5 Rating
                  </span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-6 -left-6 h-32 w-32 rounded-full bg-indigo-200/50 blur-3xl"></div>
              <div className="absolute -z-10 -bottom-6 -right-6 h-40 w-40 rounded-full bg-purple-200/50 blur-3xl"></div>
            </div>

            {/* About Content */}
            <div className="space-y-8">
              {/* Section Tag */}
              <div className="inline-flex items-center gap-3 rounded-full bg-indigo-100 px-5 py-2.5">
                <div className="rounded-full bg-indigo-600 p-1">
                  <Award className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-semibold text-indigo-700">
                  WHY CHOOSE US
                </span>
                <span className="text-indigo-400">
                  •
                </span>
                <span className="text-sm text-indigo-600">
                  Premium Service
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Revolutionizing
                </span>
                <br />
                Garage Management{" "}
                <span className="relative">
                  Across Africa
                  <svg
                    className="absolute -bottom-2 left-0 h-3 w-full text-indigo-300"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,5 Q25,0 50,5 T100,5"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </span>
              </h2>

              {/* Description */}
              <div className="relative pl-6 border-l-4 border-indigo-600">
                <p className="text-lg leading-relaxed text-gray-700">
                  We&apos;re on a mission to
                  transform how vehicle owners
                  interact with garage services.
                  Our platform bridges the gap
                  between premium garage providers
                  and car enthusiasts who demand
                  the best care for their
                  vehicles.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-5 pt-4">
                {[
                  {
                    icon: ShieldCheck,
                    color:
                      "from-indigo-500 to-indigo-600",
                    title: "100% Verified",
                    desc: "Strict verification",
                  },
                  {
                    icon: Clock,
                    color:
                      "from-purple-500 to-purple-600",
                    title: "Real-time",
                    desc: "Live tracking",
                  },
                  {
                    icon: CheckCircle2,
                    color:
                      "from-green-500 to-green-600",
                    title: "Secure",
                    desc: "Encrypted payments",
                  },
                  {
                    icon: Users,
                    color:
                      "from-orange-500 to-orange-600",
                    title: "24/7 Support",
                    desc: "Always available",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group rounded-2xl bg-white p-5 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-xl bg-gradient-to-br ${item.color} p-3 text-white shadow-lg`}
                      >
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Benefits */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  "Certified Mechanics",
                  "Genuine Parts",
                  "Warranty Included",
                  "Free Pickup",
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <div className="rounded-full bg-green-100 p-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Link */}
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 pt-4 text-lg font-semibold text-indigo-600 hover:text-indigo-700 transition-all"
              >
                <span>
                  Discover our complete story
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-all">
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">
                    1,000+
                  </span>{" "}
                  vehicle owners trust us
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Stats Strip */}
          <div className="mt-20 grid grid-cols-3 gap-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <div className="text-center">
              <p className="text-4xl font-bold">
                50K+
              </p>
              <p className="text-sm text-indigo-100 mt-1">
                Services Completed
              </p>
            </div>
            <div className="text-center border-x border-indigo-400">
              <p className="text-4xl font-bold">
                98%
              </p>
              <p className="text-sm text-indigo-100 mt-1">
                Customer Satisfaction
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">
                24/7
              </p>
              <p className="text-sm text-indigo-100 mt-1">
                Support Available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section className="py-24 border-b border-gray-100 bg-gradient-to-b from-white to-indigo-50/20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 shadow-lg shadow-indigo-200">
              <Wrench className="h-4 w-4 text-white" />
              <span className="font-semibold text-white tracking-wide">
                PREMIUM SERVICES
              </span>
              <span className="text-indigo-200">
                ✦
              </span>
              <span className="text-sm text-indigo-100">
                6+ Offerings
              </span>
            </div>

            <h2 className="mt-8 text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Comprehensive
              </span>
              <br />
              Garage Solutions
            </h2>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              From routine maintenance to premium
              storage, we offer everything your
              vehicle needs under one platform
              with unmatched quality and care.
            </p>

            {/* Decorative elements */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="h-1.5 w-12 rounded-full bg-indigo-600"></div>
              <div className="h-1.5 w-4 rounded-full bg-indigo-300"></div>
              <div className="h-1.5 w-4 rounded-full bg-indigo-300"></div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Car,
                color: "indigo",
                title: "Premium Storage",
                desc: "Climate-controlled garaging with 24/7 surveillance and regular maintenance checks.",
                features: [
                  "Climate controlled units",
                  "24/7 CCTV monitoring",
                ],
                number: "01",
                link: "/services/storage",
                linkText: "Explore Storage",
              },
              {
                icon: Wrench,
                color: "purple",
                title: "Maintenance & Repairs",
                desc: "Expert mechanical services from certified professionals using genuine parts.",
                features: [
                  "Certified mechanics",
                  "Genuine OEM parts",
                ],
                number: "02",
                link: "/services/maintenance",
                linkText: "View Services",
              },
              {
                icon: Calendar,
                color: "blue",
                title: "Instant Booking",
                desc: "Real-time slot availability with automated reminders and flexible rescheduling.",
                features: [
                  "Real-time availability",
                  "SMS/Email reminders",
                ],
                number: "03",
                link: "/services/booking",
                linkText: "Book Now",
              },
              {
                icon: ShieldCheck,
                color: "green",
                title: "Vehicle Protection",
                desc: "Comprehensive insurance coverage and security packages for complete peace of mind.",
                features: [
                  "Full coverage insurance",
                  "Security systems",
                ],
                number: "04",
                link: "/services/protection",
                linkText: "Protect Vehicle",
              },
              {
                icon: MapPin,
                color: "orange",
                title: "Pickup & Delivery",
                desc: "Convenient vehicle collection and drop-off services at your preferred location.",
                features: [
                  "Free pickup within city",
                  "Real-time tracking",
                ],
                number: "05",
                link: "/services/pickup",
                linkText: "Schedule Pickup",
              },
              {
                icon: Clock,
                color: "red",
                title: "Emergency Assistance",
                desc: "24/7 roadside assistance and emergency repair services across all major cities.",
                features: [
                  "24/7 roadside help",
                  "45-min response time",
                ],
                number: "06",
                link: "/services/emergency",
                linkText: "Get Help Now",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="group relative rounded-3xl bg-white p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-${service.color}-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}
                  ></div>
                  <div
                    className={`relative w-fit rounded-2xl bg-gradient-to-br from-${service.color}-600 to-${service.color}-700 p-4 text-white shadow-lg shadow-${service.color}-200 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className="h-7 w-7" />
                  </div>
                </div>

                <h3
                  className={`mt-8 text-2xl font-bold text-gray-900 group-hover:text-${service.color}-600 transition-colors`}
                >
                  {service.title}
                </h3>

                <p className="mt-3 text-gray-600 leading-relaxed">
                  {service.desc}
                </p>

                <ul className="mt-6 space-y-2">
                  {service.features.map(
                    (feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle2
                          className={`h-4 w-4 text-${service.color}-600`}
                        />
                        <span>{feature}</span>
                      </li>
                    )
                  )}
                </ul>

                <Link
                  href={service.link}
                  className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold text-${service.color}-600 group/link`}
                >
                  <span>{service.linkText}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>

                <div className="absolute bottom-4 right-4 text-8xl font-black text-gray-100 opacity-30 select-none">
                  {service.number}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-20 relative rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white blur-3xl animate-pulse animation-delay-2000"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white sm:text-4xl">
                Need a Custom Service Package?
              </h3>
              <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
                We offer tailored solutions for
                fleet owners, luxury car
                collectors, and businesses.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-indigo-600 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <Phone className="h-5 w-5" />
                  Talk to Our Team
                </Link>
                <Link
                  href="/services/custom"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Explore Custom Plans
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-24 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 rounded-full bg-indigo-100 px-5 py-2.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-indigo-700">
                WHY SMARTGARAGE
              </span>
            </div>
            <h2 className="mt-8 text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Features
              </span>
              <br />
              For Modern Vehicle Care
            </h2>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                desc: "Real-time insights into garage performance and vehicle health",
              },
              {
                icon: ShieldCheck,
                title: "Secure Platform",
                desc: "Bank-grade encryption for all transactions and data",
              },
              {
                icon: Headphones,
                title: "24/7 Concierge",
                desc: "Dedicated support team available around the clock",
              },
              {
                icon: Zap,
                title: "Instant Matching",
                desc: "AI-powered garage recommendations based on your needs",
              },
              {
                icon: Key,
                title: "Keyless Access",
                desc: "Secure digital access to your vehicle storage",
              },
              {
                icon: Settings,
                title: "Custom Solutions",
                desc: "Tailored packages for unique vehicle requirements",
              },
              {
                icon: Battery,
                title: "EV Charging",
                desc: "Dedicated charging stations for electric vehicles",
              },
              {
                icon: Heart,
                title: "Premium Care",
                desc: "White-glove service for luxury and classic cars",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <feature.icon className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="mt-4 font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <section className="py-24 border-b border-gray-100 bg-gradient-to-b from-white to-indigo-50/30 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-200 blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-200 blur-3xl opacity-20"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 relative">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 shadow-lg shadow-indigo-200">
              <MessageCircle className="h-4 w-4 text-white" />
              <span className="font-semibold text-white tracking-wide">
                CLIENT STORIES
              </span>
              <span className="text-indigo-200">
                ✦
              </span>
              <span className="text-sm text-indigo-100">
                4.9/5 Rating
              </span>
            </div>

            <h2 className="mt-8 text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                What Our Clients
              </span>
              <br />
              Say About Us
            </h2>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Don&apos;t just take our word for it
              — hear from some of our satisfied
              vehicle owners and garage partners
              across Africa.
            </p>

            {/* Rating badge */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                Based on 2,500+ reviews
              </span>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Nasir Mohammed",
                role: "Luxury Car Collector",
                company: "12 cars",
                image:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
                text: "This platform has completely transformed how I manage my classic car collection. The booking system is seamless and the garages are top-notch. I finally found a service I can trust completely.",
                time: "2 months ago",
              },
              {
                name: "Gemeda Tamiru",
                role: "Auto Hub Lagos",
                company: "Partner since 2023",
                image:
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
                text: "As a garage owner, this platform has increased my visibility and bookings by 200%. The verification process ensures quality customers and the dashboard gives me complete control over my schedule.",
                time: "1 week ago",
              },
              {
                name: "Yasin Robe",
                role: "Fleet Manager",
                company: "15 vehicles",
                image:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
                text: "The real-time tracking and instant booking features are game-changers. I manage a fleet of 15 vehicles and this platform has reduced my stress levels significantly.",
                time: "3 weeks ago",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group relative rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <div className="absolute top-6 right-6 text-6xl font-serif text-indigo-100 opacity-50">
                  &quot;
                </div>

                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed relative z-10">
                  &quot;{testimonial.text}&quot;
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-md opacity-50"></div>
                    <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-xl">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span>
                        {testimonial.role}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-indigo-600">
                        {testimonial.company}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    Verified review •{" "}
                    {testimonial.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Video Testimonial Section */}
          <div className="mt-20 grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-[300px] lg:h-[400px] rounded-3xl overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537"
                alt="Video testimonial thumbnail"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50"></div>
                  <div className="relative h-20 w-20 rounded-full bg-white/90 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white transition-all group/play">
                    <div className="h-0 w-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-indigo-600 ml-1"></div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium">
                Watch Client Stories • 2:34
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></div>
                <span className="text-sm font-semibold text-indigo-700">
                  FEATURED VIDEO
                </span>
              </div>

              <h3 className="text-3xl font-bold text-gray-900">
                See How We&apos;re Transforming
                Vehicle Care
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Watch real clients share their
                experiences with our platform.
                From classic car collectors to
                fleet managers, discover why
                thousands trust us with their
                vehicles.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-400 shadow-lg"
                    ></div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Join 1,000+ satisfied clients
                  </p>
                  <p className="text-xs text-gray-500">
                    Trusted by vehicle owners
                    across Africa
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-20 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              {
                icon: Users,
                color: "indigo",
                value: "1,000+",
                label: "Happy Clients",
              },
              {
                icon: Car,
                color: "purple",
                value: "500+",
                label: "Partner Garages",
              },
              {
                icon: Calendar,
                color: "blue",
                value: "50K+",
                label: "Bookings Completed",
              },
              {
                icon: Star,
                color: "green",
                value: "4.9/5",
                label: "Average Rating",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <div className="text-center">
                  <div
                    className={`inline-block rounded-xl bg-${stat.color}-100 p-3 mb-4`}
                  >
                    <stat.icon
                      className={`h-6 w-6 text-${stat.color}-600`}
                    />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-gray-200">
            {[
              {
                icon: ShieldCheck,
                text: "Verified Reviews",
              },
              {
                icon: CheckCircle2,
                text: "Real Customers",
              },
              {
                icon: Clock,
                text: "Updated Weekly",
              },
            ].map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-500"
              >
                <badge.icon className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">
                  {badge.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
                <Phone className="h-4 w-4" />
                Get in Touch
              </div>

              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                We&apos;d Love to Hear From You
              </h2>

              <p className="text-lg text-gray-600">
                Whether you have a question about
                our services, want to partner with
                us, or need assistance with your
                account, our team is ready to
                help.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Phone,
                    title: "Phone",
                    value: "+234 (555) 123-4567",
                  },
                  {
                    icon: Mail,
                    title: "Email",
                    value:
                      "hello@smartgarage.africa",
                  },
                  {
                    icon: MapPin,
                    title: "Head Office",
                    value:
                      "48 Adeola Odeku, Victoria Island, Lagos",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 group hover:bg-indigo-50 p-3 rounded-xl transition-colors"
                  >
                    <div className="rounded-lg bg-indigo-100 p-3 group-hover:bg-indigo-200 transition-colors">
                      <item.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {item.title}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div className="rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Business Hours
                </h3>
                <div className="mt-4 space-y-2">
                  {[
                    {
                      day: "Monday - Friday",
                      hours: "8:00 AM - 8:00 PM",
                    },
                    {
                      day: "Saturday",
                      hours: "9:00 AM - 6:00 PM",
                    },
                    {
                      day: "Sunday",
                      hours: "10:00 AM - 4:00 PM",
                    },
                  ].map((schedule, index) => (
                    <div
                      key={index}
                      className="flex justify-between"
                    >
                      <span className="text-gray-600">
                        {schedule.day}
                      </span>
                      <span
                        className={`font-semibold ${schedule.day === "Sunday" ? "text-indigo-600" : "text-gray-900"}`}
                      >
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900">
                Send us a Message
              </h3>
              <p className="mt-2 text-gray-600">
                We&apos;ll get back to you within
                24 hours.
              </p>

              <form className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                    placeholder="+234 123 456 7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Experience Premium Vehicle
            Care?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Join thousands of satisfied vehicle
            owners and garage partners today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-indigo-600 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          {/* Main Footer Content */}
          <div className="grid gap-10 lg:grid-cols-4 md:grid-cols-2">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-md opacity-50"></div>
                  <div className="relative h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SmartGarage
                </h4>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Premium vehicle care and storage
                solutions across Africa. Trusted
                by 1,000+ vehicle owners and 500+
                partner garages.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-3">
                {[
                  "facebook",
                  "twitter",
                  "linkedin",
                  "instagram",
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-indigo-600 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <svg
                        className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {social ===
                          "facebook" && (
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        )}
                        {social === "twitter" && (
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.775-5.802 14.005 14.005 0 001.543-6.144c0-.21-.005-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        )}
                        {social ===
                          "linkedin" && (
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        )}
                        {social ===
                          "instagram" && (
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                        )}
                      </svg>
                    </div>
                  </a>
                ))}
              </div>

              {/* App Store Badges */}
              <div className="flex gap-2 pt-2">
                <a
                  href="#"
                  className="flex items-center gap-1 rounded-lg bg-black px-3 py-2 text-white hover:bg-gray-800 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div>
                    <div className="text-[8px]">
                      Download on
                    </div>
                    <div className="text-xs font-semibold">
                      App Store
                    </div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-1 rounded-lg bg-black px-3 py-2 text-white hover:bg-gray-800 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3.609 1.814L13.792 12 3.61 22.186 18.217 12 3.608 1.814zm16.391 10.186l-2.5-2.5v5l2.5-2.5z" />
                  </svg>
                  <div>
                    <div className="text-[8px]">
                      Get it on
                    </div>
                    <div className="text-xs font-semibold">
                      Google Play
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="mt-6 space-y-3">
                {[
                  "About Us",
                  "Our Services",
                  "Partner Garages",
                  "Pricing Plans",
                  "FAQ",
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      href={`/${item.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-600 hover:text-indigo-600 text-sm flex items-center gap-2 group"
                    >
                      <span className="h-1 w-1 rounded-full bg-gray-400 group-hover:bg-indigo-600 transition-colors"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Contact Us
              </h4>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    48 Adeola Odeku, Victoria
                    Island,
                    <br />
                    Lagos, Nigeria
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      +234 (555) 123-4567
                    </span>
                    <p className="text-xs text-gray-500">
                      24/7 Support
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      hello@smartgarage.africa
                    </span>
                    <p className="text-xs text-gray-500">
                      Response within 24h
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Newsletter & Hours */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Newsletter
              </h4>
              <p className="mt-4 text-sm text-gray-600">
                Subscribe to get updates on new
                services, offers, and garage
                openings.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 rounded-l-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button className="rounded-r-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  By subscribing, you agree to our
                  Privacy Policy.
                </p>
              </div>

              {/* Business Hours */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900">
                  Business Hours
                </h4>
                <div className="mt-3 space-y-2 text-sm">
                  {[
                    {
                      day: "Monday - Friday",
                      hours: "8:00 AM - 8:00 PM",
                    },
                    {
                      day: "Saturday",
                      hours: "9:00 AM - 6:00 PM",
                    },
                    {
                      day: "Sunday",
                      hours: "10:00 AM - 4:00 PM",
                    },
                  ].map((schedule, index) => (
                    <div
                      key={index}
                      className="flex justify-between"
                    >
                      <span className="text-gray-600">
                        {schedule.day}
                      </span>
                      <span
                        className={`font-medium ${schedule.day === "Sunday" ? "text-indigo-600" : "text-gray-900"}`}
                      >
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()}{" "}
                SmartGarage. All rights reserved.
                <span className="mx-2 text-gray-300">
                  |
                </span>
                <span className="text-xs text-gray-500">
                  Premium vehicle care across
                  Africa
                </span>
              </p>

              <div className="flex items-center gap-6">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  We accept:
                </span>
                <div className="flex items-center gap-1">
                  {["VISA", "MC", "PAYPAL"].map(
                    (method, index) => (
                      <div
                        key={index}
                        className="h-6 w-10 rounded bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 hover:bg-gray-300 transition-colors"
                      >
                        {method}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px)
              scale(1);
          }
          33% {
            transform: translate(30px, -50px)
              scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px)
              scale(0.9);
          }
          100% {
            transform: translate(0px, 0px)
              scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
