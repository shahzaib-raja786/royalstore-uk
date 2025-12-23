"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, LogOut, Search, Menu, X } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const router = useRouter();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    // Fetch Company Profile
    apiClient.get("/api/company-profile")
      .then((data) => {
        if (data.success && data.profile) {
          setCompanyInfo(data.profile);
        }
      })
      .catch((err) => console.error("Failed to fetch company info:", err));

    // Check if auth state is cached
    const cachedAuth = localStorage.getItem("isLoggedIn");
    if (cachedAuth !== null) {
      setIsLoggedIn(cachedAuth === "true");
      setAuthChecked(true);
    }

    const checkAuth = async () => {
      try {
        const data = await apiClient.get("/api/check-auth");
        const loggedIn = data.authenticated === true;
        setIsLoggedIn(loggedIn);
        localStorage.setItem("isLoggedIn", loggedIn.toString());
      } catch {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
      } finally {
        setAuthChecked(true);
      }
    };

    // Only check auth if not already checked or cached
    if (!authChecked) {
      checkAuth();
    }

    const fetchCartCount = async () => {
      try {
        const data = await apiClient.get("/api/cart/count");
        if (typeof data.totalItems === "number") setCartCount(data.totalItems);
      } catch (err) {
        console.error("Cart count fetch error:", err);
        setCartCount(0);
      }
    };

    if (isLoggedIn) {
      fetchCartCount();
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('button[aria-label="Menu"]')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLoggedIn, authChecked]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/logout");
      setIsLoggedIn(false);
      setDropdownOpen(false);
      setCartCount(0);
      localStorage.removeItem("isLoggedIn");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productlisting?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  // Render company name - always show full name
  const renderBrand = () => {
    const name = companyInfo?.name || "Furniture Logistics UK";
    const logo = companyInfo?.logo;

    return (
      <Link 
        href="/" 
        className="flex items-center gap-2 min-w-0 whitespace-nowrap"
      >
        {logo ? (
          <img 
            src={logo} 
            alt={name} 
            className="h-8 w-auto object-contain sm:h-10 flex-shrink-0" 
          />
        ) : null}
        <span className="text-gray-900 font-bold text-lg sm:text-xl md:text-2xl">
          {name}
        </span>
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 w-full z-40 font-[Poppins]">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4 md:py-5">
        {/* Logo/Brand */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-shrink-0 min-w-0"
        >
          {renderBrand()}
        </motion.div>

        {/* Desktop Search - Only on desktop */}
        <div className="hidden md:flex justify-center flex-1 mx-4">
          <form
            onSubmit={handleSearch}
            className="relative w-full max-w-md flex"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-black rounded-l-full pl-5 pr-4 py-2 outline-none focus:ring-2 focus:ring-[#de5422] focus:border-transparent transition-all duration-300"
            />
            <button
              type="submit"
              className="bg-[#de5422] px-4 py-2 rounded-r-full hover:bg-[#c4491e] focus:ring-2 focus:ring-[#de5422] focus:ring-offset-1 transition-colors duration-300 flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 text-base font-medium flex-shrink-0">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Link
              href="/"
              className="hover:text-[#de5422] text-xl font-semibold transition-colors duration-200 px-3 py-2"
            >
              Home
            </Link>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Link
              href="/about"
              className="hover:text-[#de5422] text-xl font-semibold transition-colors duration-200 px-3 py-2"
            >
              About
            </Link>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Link
              href="/news"
              className="hover:text-[#de5422] text-xl font-semibold transition-colors duration-200 px-3 py-2"
            >
              News
            </Link>
          </motion.div>

          {/* Cart - Only visible if logged in */}
          {isLoggedIn && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="relative ml-2 cursor-pointer"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-[#de5422] transition-colors duration-200" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute -top-2 -right-2 bg-[#de5422] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </motion.div>
          )}

          {/* Login / Profile */}
          {!isLoggedIn ? (
            <div className="flex gap-2 ml-4 flex-nowrap items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Link
                  href="/login"
                  className="px-4 py-2 whitespace-nowrap rounded-full bg-[#de5422] text-white hover:bg-[#c4491e] transition-colors duration-300 text-sm"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Link
                  href="/signup"
                  className="px-4 py-2 whitespace-nowrap rounded-full border border-[#de5422] text-[#de5422] hover:bg-[#f9f2f0] transition-colors duration-300 text-sm"
                >
                  Sign Up
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="relative ml-4" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#de5422] hover:bg-[#c4491e] transition-colors duration-200"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                <User className="w-6 h-6 text-white" />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 z-50"
                  >
                    <Link
                      href="/account"
                      className="block px-4 py-3 hover:bg-[#f9f2f0] transition-colors duration-200 border-b border-gray-100 text-gray-700 hover:text-[#de5422]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Manage Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Icons */}
        <div className="flex md:hidden items-center gap-4 flex-shrink-0">
          {/* Cart Icon (only if logged in) */}
          {isLoggedIn && (
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className="relative cursor-pointer"
              onClick={() => {
                router.push("/cart");
                setMenuOpen(false);
              }}
            >
              <ShoppingCart className="w-5 h-5 text-[#de5422]" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute -top-1 -right-1 bg-[#de5422] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </motion.div>
          )}

          {/* Mobile Menu Button - Always orange color */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-[#de5422]" />
            ) : (
              <Menu className="w-5 h-5 text-[#de5422]" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - No Search Bar */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white shadow-lg border-t border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2, ease: "easeOut" }}
              >
                <Link
                  href="/"
                  className="block py-3 px-3 rounded-lg hover:text-[#de5422] hover:bg-gray-50 transition-colors duration-200 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.2, ease: "easeOut" }}
              >
                <Link
                  href="/about"
                  className="block py-3 px-3 rounded-lg hover:text-[#de5422] hover:bg-gray-50 transition-colors duration-200 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.2, ease: "easeOut" }}
              >
                <Link
                  href="/news"
                  className="block py-3 px-3 rounded-lg hover:text-[#de5422] hover:bg-gray-50 transition-colors duration-200 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  News
                </Link>
              </motion.div>

              <div className="border-t border-gray-200 pt-4">
                {isLoggedIn ? (
                  <>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25, duration: 0.2, ease: "easeOut" }}
                    >
                      <Link
                        href="/account"
                        className="block py-3 px-3 rounded-lg hover:text-[#de5422] hover:bg-gray-50 transition-colors duration-200 font-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Account
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.2, ease: "easeOut" }}
                    >
                      <button
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left py-3 px-3 rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.2, ease: "easeOut" }}
                    className="flex flex-col gap-3 mt-2"
                  >
                    <Link
                      href="/login"
                      className="px-4 py-3 rounded-full bg-[#de5422] text-white text-center hover:bg-[#c4491e] transition-colors font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-3 rounded-full border border-[#de5422] text-[#de5422] text-center hover:bg-[#f9f2f0] transition-colors font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}