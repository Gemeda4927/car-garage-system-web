"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  HiOutlineArrowRight,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineShare,
  HiOutlineMinus,
  HiOutlineH1,
  HiOutlineChevronDown,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineCreditCard,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineBuildingOffice,
  HiOutlineMapPin,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import { HiOutlineLogout, HiOutlineMenu, HiOutlineX } from "react-icons/hi";

// Helper component for dashboard sections in desktop menu
const DashboardSection = ({
  title,
  items,
  setUserMenuOpen,
}: {
  title: string;
  items: any[];
  setUserMenuOpen: (open: boolean) => void;
}) => (
  <div className="mb-2">
    {title && (
      <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {title}
      </p>
    )}
    {items.map((item, index) => (
      <Link
        key={index}
        href={item.href}
        onClick={() => setUserMenuOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 group rounded-lg"
      >
        <span className="text-lg text-gray-400 group-hover:text-indigo-500 transition-colors">
          {item.icon}
        </span>
        <div className="flex flex-col">
          <span className="font-medium">
            {item.label}
          </span>
          {item.description && (
            <span className="text-xs text-gray-500">
              {item.description}
            </span>
          )}
        </div>
      </Link>
    ))}
  </div>
);

// Helper component for mobile sections
const MobileSection = ({
  title,
  items,
  setMenuOpen,
}: {
  title: string;
  items: any[];
  setMenuOpen: (open: boolean) => void;
}) => (
  <div className="mb-4">
    {title && (
      <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </p>
    )}
    <div className="flex flex-col gap-1">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-all duration-300"
        >
          <span className="text-xl text-gray-400">
            {item.icon}
          </span>
          <div className="flex flex-col">
            <span className="font-medium">
              {item.label}
            </span>
            {item.description && (
              <span className="text-xs text-gray-500">
                {item.description}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      label: "Services",
      icon: (
        <HiOutlineWrenchScrewdriver className="w-5 h-5" />
      ),
      href: "/services",
      description: "Explore our premium car care services",
    },
    {
      label: "Locations",
      icon: (
        <HiOutlineMapPin className="w-5 h-5" />
      ),
      href: "/locations",
      description: "Find a garage near you",
    },
    {
      label: "About",
      icon: (
        <HiOutlineUserGroup className="w-5 h-5" />
      ),
      href: "/about",
      description: "Learn about our story",
    },
    {
      label: "Contact",
      icon: (
        <HiOutlinePhone className="w-5 h-5" />
      ),
      href: "/contact",
      description: "Get in touch with us",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

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

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileImage = () => {
    if (user?.profileImage && !profileImageError) {
      return user.profileImage;
    }
    return null;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "garage_owner":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <HiOutlineShieldCheck className="w-4 h-4" />
        );
      case "garage_owner":
        return (
          <HiOutlineBuildingOffice className="w-4 h-4" />
        );
      default:
        return (
          <HiOutlineUser className="w-4 h-4" />
        );
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "garage_owner":
        return "Garage Owner";
      case "admin":
        return "Admin";
      default:
        return "Customer";
    }
  };

  // Get dashboard items based on user role
  const getDashboardItems = () => {
    if (!user) return [];

    switch (user.role) {
      case "admin":
        return [
          {
            label: "Dashboard",
            icon: <HiOutlineChartBar />,
            href: "/admin/dashboard",
            description: "Platform overview",
          },
          {
            label: "Garages",
            icon: <HiOutlineBuildingOffice />,
            href: "/admin/garages",
            description: "Manage garages",
          },
          {
            label: "Users",
            icon: <HiOutlineUserGroup />,
            href: "/admin/users",
            description: "Manage users",
          },
          {
            label: "Profile",
            icon: <HiOutlineUser />,
            href: "/admin/profile",
            description: "Your information",
          },
          {
            label: "Settings",
            icon: <HiOutlineCog />,
            href: "/admin/settings",
            description: "Account settings",
          },
        ];

      case "garage_owner":
        return [
          {
            label: "Dashboard",
            icon: <HiOutlineChartBar />,
            href: "/owner/dashboard",
            description: "Garage overview",
          },
          {
            label: "My Garage",
            icon: <HiOutlineBuildingOffice />,
            href: "/owner/garage",
            description: "Manage your garage",
          },
          {
            label: "Bookings",
            icon: <HiOutlineCalendar />,
            href: "/owner/bookings",
            description: "View bookings",
          },
          {
            label: "Services",
            icon: <HiOutlineWrenchScrewdriver />,
            href: "/owner/services",
            description: "Manage services",
          },
          {
            label: "Staff",
            icon: <HiOutlineUserGroup />,
            href: "/owner/staff",
            description: "Manage staff",
          },
          {
            label: "Earnings",
            icon: <HiOutlineCreditCard />,
            href: "/owner/earnings",
            description: "View earnings",
          },
          {
            label: "Schedule",
            icon: <HiOutlineClock />,
            href: "/owner/schedule",
            description: "Manage schedule",
          },
          {
            label: "Reviews",
            icon: <HiOutlineStar />,
            href: "/owner/reviews",
            description: "Customer reviews",
          },
          {
            label: "Profile",
            icon: <HiOutlineUser />,
            href: "/owner/profile",
            description: "Your information",
          },
          {
            label: "Settings",
            icon: <HiOutlineCog />,
            href: "/owner/settings",
            description: "Account settings",
          },
        ];

      default: // customer
        return [
          {
            label: "Dashboard",
            icon: <HiOutlineChartBar />,
            href: "/dashboard",
            description: "Your overview",
          },
          {
            label: "My Bookings",
            icon: <HiOutlineCalendar />,
            href: "/bookings",
            description: "View your bookings",
          },
          {
            label: "Favorites",
            icon: <HiOutlineStar />,
            href: "/favorites",
            description: "Saved garages",
          },
          {
            label: "Payments",
            icon: <HiOutlineCreditCard />,
            href: "/payments",
            description: "Payment methods",
          },
          {
            label: "History",
            icon: <HiOutlineClock />,
            href: "/history",
            description: "Past bookings",
          },
          {
            label: "Profile",
            icon: <HiOutlineUser />,
            href: "/profile",
            description: "Your information",
          },
          {
            label: "Settings",
            icon: <HiOutlineCog />,
            href: "/settings",
            description: "Account settings",
          },
        ];
    }
  };

  // Group dashboard items for better organization
  const getDashboardSections = () => {
    const items = getDashboardItems();

    if (user?.role === "admin") {
      return {
        main: items.slice(0, 1),
        management: items.slice(1, 3),
        account: items.slice(3),
      };
    }

    if (user?.role === "garage_owner") {
      return {
        main: items.slice(0, 1),
        garage: items.slice(1, 5),
        business: items.slice(5, 8),
        account: items.slice(8),
      };
    }

    // Customer
    return {
      main: items.slice(0, 1),
      bookings: items.slice(1, 5),
      account: items.slice(5),
    };
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50"
          : "bg-gradient-to-b from-black/20 to-transparent"
      }`}
    >
      <div className="mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="relative flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <div className="absolute inset-0 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <HiOutlineSparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                SCRG
              </span>
              <span className="text-[10px] font-medium text-gray-500 -mt-1">
                Premium Car Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative group px-4 py-2"
              >
                <div className="flex items-center gap-2 text-sm font-medium transition-colors relative z-10">
                  <span
                    className={`transition-colors duration-300 ${
                      isActive(item.href)
                        ? "text-indigo-600"
                        : "text-gray-700 group-hover:text-indigo-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`transition-colors duration-300 ${
                      isActive(item.href)
                        ? "text-indigo-600"
                        : "text-gray-700 group-hover:text-indigo-600"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
                  <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap">
                    {item.description}
                  </div>
                </div>

                {/* Active/Highlight indicator */}
                <span
                  className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300 ${
                    isActive(item.href)
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* User Menu / CTA - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div
                className="relative"
                ref={userMenuRef}
              >
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 group"
                >
                  <div className="relative">
                    {getProfileImage() ? (
                      <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-white shadow-md">
                        <Image
                          src={getProfileImage()!}
                          alt={user.name}
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                          onError={() => setProfileImageError(true)}
                        />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {getUserInitials()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">
                      {user?.name?.split(" ")[0] || "User"}
                    </span>
                    <span className="text-[10px] text-gray-500 leading-tight flex items-center gap-1">
                      {getRoleIcon(user?.role)}
                      {getRoleDisplayName(user?.role)}
                    </span>
                  </div>
                  <HiOutlineChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50"
                    >
                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {getProfileImage() ? (
                              <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-white shadow-md">
                                <Image
                                  src={getProfileImage()!}
                                  alt={user.name}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                  onError={() => setProfileImageError(true)}
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {getUserInitials()}
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-xs rounded-full border ${getRoleBadgeColor(user.role)}`}
                            >
                              {getRoleIcon(user.role)}
                              {getRoleDisplayName(user.role)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Quick stats for garage owners */}
                        {user.role === "garage_owner" && user.garageName && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              <span className="font-medium text-gray-700">Garage:</span> {user.garageName}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Dashboard items organized by sections */}
                      <div className="py-2 max-h-96 overflow-y-auto">
                        {user?.role === "admin" && (
                          <>
                            <DashboardSection
                              title="Main"
                              items={getDashboardSections().main}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                            <DashboardSection
                              title="Management"
                              items={getDashboardSections().management}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                            <DashboardSection
                              title="Account"
                              items={getDashboardSections().account}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                          </>
                        )}

                        {user?.role === "garage_owner" && (
                          <>
                            <DashboardSection
                              title="Main"
                              items={getDashboardSections().main}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                            <DashboardSection
                              title="Garage"
                              items={getDashboardSections().garage}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                            <DashboardSection
                              title="Business"
                              items={getDashboardSections().business}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                            <DashboardSection
                              title="Account"
                              items={getDashboardSections().account}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                          </>
                        )}

                        {user?.role === "customer" && (
                          <>
                            <DashboardSection
                              title="Main"
                              items={getDashboardSections().main}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                            <DashboardSection
                              title="My Bookings"
                              items={getDashboardSections().bookings}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                            <DashboardSection
                              title="Account"
                              items={getDashboardSections().account}
                              setUserMenuOpen={setUserMenuOpen}
                            />
                          </>
                        )}
                      </div>

                      {/* Logout button */}
                      <div className="border-t border-gray-100 pt-2 pb-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                        >
                          <HiOutlineLogout className="text-lg text-red-400 group-hover:text-red-600" />
                          <span className="font-medium">
                            Sign Out
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/partner"
                  className="group relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:text-white transition-colors duration-300">
                    Partner With Us
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300" />
                </Link>

                <Link
                  href="/login"
                  className="group relative px-6 py-2.5 rounded-full text-sm font-semibold text-white overflow-hidden shadow-lg hover:shadow-pink-400/30 transition-shadow duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-indigo-300 transition-all duration-300 flex items-center justify-center group"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiOutlineX className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiOutlineMenu className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed top-20 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {/* User info for mobile if authenticated */}
              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {getProfileImage() ? (
                        <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-white shadow-md">
                          <Image
                            src={getProfileImage()!}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                            onError={() => setProfileImageError(true)}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {getUserInitials()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs rounded-full border ${getRoleBadgeColor(user.role)}`}
                      >
                        {getRoleIcon(user.role)}
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation items */}
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span
                        className={`text-xl ${
                          isActive(item.href)
                            ? "text-indigo-600"
                            : "text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Dashboard items for mobile */}
              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4"
                >
                  <div className="border-t border-gray-200 pt-4">
                    {user?.role === "admin" && (
                      <>
                        <MobileSection
                          title="Main"
                          items={getDashboardSections().main}
                          setMenuOpen={setMenuOpen}
                        />
                        <MobileSection
                          title="Management"
                          items={getDashboardSections().management}
                          setMenuOpen={setMenuOpen}
                        />
                        <MobileSection
                          title="Account"
                          items={getDashboardSections().account}
                          setMenuOpen={setMenuOpen}
                        />
                      </>
                    )}

                    {user?.role === "garage_owner" && (
                      <>
                        <MobileSection
                          title="Main"
                          items={getDashboardSections().main}
                          setMenuOpen={setMenuOpen}
                        />
                        <MobileSection
                          title="Garage"
                          items={getDashboardSections().garage}
                          setMenuOpen={setMenuOpen}
                        />
                        <MobileSection
                          title="Business"
                          items={getDashboardSections().business}
                          setMenuOpen={setMenuOpen}
                        />
                        <MobileSection
                          title="Account"
                          items={getDashboardSections().account}
                          setMenuOpen={setMenuOpen}
                        />
                      </>
                    )}

                    {user?.role === "customer" && (
                      <>
                        <MobileSection
                          title="Main"
                          items={getDashboardSections().main}
                          setMenuOpen={setMenuOpen}
                        />
                        <MobileSection
                          title="My Bookings"
                          items={getDashboardSections().bookings}
                          setMenuOpen={setMenuOpen}
                        />
                        <MobileSection
                          title="Account"
                          items={getDashboardSections().account}
                          setMenuOpen={setMenuOpen}
                        />
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* CTA buttons for mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex flex-col gap-3"
              >
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all duration-300"
                  >
                    <HiOutlineLogout className="text-xl" />
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/partner"
                      onClick={() => setMenuOpen(false)}
                      className="text-center py-3.5 rounded-xl border-2 border-indigo-200 text-indigo-600 font-semibold hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300"
                    >
                      Partner With Us
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-center py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="text-center py-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-300"
                    >
                      Don&apos;t have an account? Sign up
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}