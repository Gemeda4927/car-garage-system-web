"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineArrowRight,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineBriefcase,
} from "react-icons/hi";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  const navItems = [
    {
      label: "Services",
      icon: <HiOutlineBriefcase />,
    },
    {
      label: "Locations",
      icon: <HiOutlineLocationMarker />,
    },
    {
      label: "About",
      icon: <HiOutlineUserGroup />,
    },
    {
      label: "Contact",
      icon: <HiOutlinePhone />,
    },
  ];

  // Navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );
    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  // Simple active link on click
  const handleSetActive = (label: string) => {
    setActive(label);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className=" mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* ================= LOGO ================= */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              SCRG
            </span>
          </div>

          {/* ================= DESKTOP NAV ================= */}
          <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={`#${item.label.toLowerCase()}`}
                onClick={() =>
                  handleSetActive(item.label)
                }
                className={`relative flex items-center gap-2 transition-all duration-300 ${
                  active === item.label
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                <span className="text-lg">
                  {item.icon}
                </span>
                {item.label}

                {/* Animated underline */}
                <span
                  className={`absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300 ${
                    active === item.label
                      ? "w-full"
                      : "w-0"
                  } group-hover:w-full`}
                />
              </Link>
            ))}
          </nav>

          {/* ================= DESKTOP CTA ================= */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="#"
              className="px-6 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
            >
              Partner With Us
            </Link>

            <Link
              href="#"
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg hover:shadow-pink-400/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Get Started
              <HiOutlineArrowRight className="text-lg" />
            </Link>
          </div>

          {/* ================= MOBILE BUTTON ================= */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg transition hover:bg-gray-100"
          >
            <div className="space-y-1">
              <span
                className={`block h-0.5 w-6 bg-black transition ${
                  menuOpen
                    ? "rotate-45 translate-y-1.5"
                    : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-black transition ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-black transition ${
                  menuOpen
                    ? "-rotate-45 -translate-y-1.5"
                    : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`md:hidden fixed top-20 left-0 w-full bg-white shadow-xl transition-all duration-500 overflow-hidden ${
          menuOpen
            ? "max-h-[500px] py-6"
            : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-6 px-8 text-lg font-medium text-gray-700">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={`#${item.label.toLowerCase()}`}
              onClick={() => {
                handleSetActive(item.label);
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <div className="pt-4 flex flex-col gap-4">
            <Link
              href="#"
              className="text-center py-3 rounded-full border border-gray-300 hover:bg-indigo-50 transition"
            >
              Partner With Us
            </Link>

            <Link
              href="#"
              className="text-center py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
