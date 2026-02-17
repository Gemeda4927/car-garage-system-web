"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  HiOutlineArrowRight,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineShare,
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } =
    useAuth();

  const navItems = [
    {
      label: "Services",
      icon: <HiOutlineBriefcase />,
      href: "/services",
    },
    {
      label: "Locations",
      icon: <HiOutlineLocationMarker />,
      href: "/locations",
    },
    {
      label: "About",
      icon: <HiOutlineUserGroup />,
      href: "/about",
    },
    {
      label: "Contact",
      icon: <HiOutlinePhone />,
      href: "/contact",
    },
  ];

  useEffect(() => {
    const handleScroll = () =>
      setScrolled(window.scrollY > 20);
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/"
      ? pathname === href
      : pathname.startsWith(href);

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "garage_owner":
        return "/owner/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-md border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              SCRG
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center gap-1 transition-all duration-300 group ${
                  isActive(item.href)
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                <span className="text-lg">
                  {item.icon}
                </span>
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300 ${
                    isActive(item.href)
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* USER MENU / CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setUserMenuOpen(!userMenuOpen)
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user?.name
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.split(" ")[0] ||
                      "User"}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                        {user?.role?.replace(
                          "_",
                          " "
                        )}
                      </span>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <HiOutlineShare className="text-lg" />{" "}
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <HiOutlineUser className="text-lg" />{" "}
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <HiOutlineCog className="text-lg" />{" "}
                      Settings
                    </Link>

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                    >
                      <HiOutlineLogout className="text-lg" />{" "}
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/partner"
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                >
                  Partner With Us
                </Link>

                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg hover:shadow-pink-400/40 hover:scale-105 transition-all duration-300 flex items-center gap-1"
                >
                  Get Started{" "}
                  <HiOutlineArrowRight className="text-lg" />
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg transition hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <HiOutlineX className="h-6 w-6" />
            ) : (
              <HiOutlineMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden fixed top-16 left-0 w-full bg-white shadow-lg transition-all duration-500 overflow-hidden ${
          menuOpen
            ? "max-h-[600px] py-4"
            : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-3 px-6 text-lg font-medium text-gray-700">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 py-2 transition ${
                isActive(item.href)
                  ? "text-indigo-600"
                  : "hover:text-indigo-600"
              }`}
            >
              <span className="text-xl">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href={getDashboardLink()}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-2 hover:text-indigo-600 transition"
              >
                <HiOutlineShare className="text-xl" />{" "}
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-2 hover:text-indigo-600 transition"
              >
                <HiOutlineUser className="text-xl" />{" "}
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-2 hover:text-indigo-600 transition"
              >
                <HiOutlineCog className="text-xl" />{" "}
                Settings
              </Link>
            </>
          )}

          <div className="pt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 py-2 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
              >
                <HiOutlineLogout className="text-xl" />{" "}
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/partner"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="text-center py-2 rounded-full border-2 border-gray-300 font-semibold hover:border-indigo-500 hover:text-indigo-600 transition"
                >
                  Partner With Us
                </Link>
                <Link
                  href="/login"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="text-center py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition"
                >
                  Get Started
                </Link>
                <Link
                  href="/register"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="text-center py-1 text-sm text-gray-500 hover:text-indigo-600 transition"
                >
                  Don&apos;t have an account? Sign
                  up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
