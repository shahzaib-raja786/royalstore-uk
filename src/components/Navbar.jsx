"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, LogOut, Search, Menu, X } from "lucide-react";
import { apiClient } from "@/lib/api";
export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const router = useRouter();
  const searchRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const dropdownRef = useRef(null);

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
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target)
      ) {
        setDesktopSearchOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLoggedIn, authChecked]);
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/logout");
      setIsLoggedIn(false);
      setDropdownOpen(false);
      localStorage.removeItem("isLoggedIn"); // Clear cache
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
      setSearchOpen(false);
      setDesktopSearchOpen(false);
    }
  };

  // Helper to split company name for styling if needed, or just default behavior
  const renderBrand = () => {
    const name = companyInfo?.name || "Furniture Logistics UK";
    const logo = companyInfo?.logo;

    return (
      <Link href="/" className="flex items-center gap-2">
        {logo ? (
          <img src={logo} alt={name} className="h-8 w-auto object-contain sm:h-10" />
        ) : null}
        <span className="text-gray-900">{name.split(' ')[0]}</span>{' '}
        {name.split(' ').slice(1).join(' ')}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 w-full z-40 font-[Poppins]">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4 md:py-5">
        {/* Logo */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl font-bold bg-[#de5422] bg-clip-text text-transparent cursor-pointer flex-1 md:flex-none flex items-center"
        >
          {renderBrand()}
        </motion.div>

        {/* Desktop Search */}
        <div className="hidden md:flex justify-center w-full mx-4">
          <form
            onSubmit={handleSearch}
            className="relative w-full max-w-md flex"
            ref={desktopSearchRef}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setDesktopSearchOpen(true)}
              className="w-full border border-black rounded-l-full pl-5 pr-4 py-2 outline-none focus:ring-1 focus:ring-[#de5422] focus:border-transparent transition-all duration-300"
            />
            <button
              type="submit"
              className="bg-[#de5422] px-4 py-2 rounded-r-full hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 focus:ring-1 transition-colors flex items-center justify-center"
            >
              <Search className="w-5 h-5 text-white cursor-pointer" />
            </button>
          </form>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 text-base font-medium flex-1 justify-end">
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="hover:text-[#de5422] text-xl font-semibold transition-colors duration-200 px-2 py-1"
            >
              Home
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/about"
              className="hover:text-[#de5422] text-xl font-semibold transition-colors duration-200 px-2 py-1"
            >
              About
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/news"
              className="hover:text-[#de5422] text-xl font-semibold transition-colors duration-200 px-2 py-1"
            >
              News
            </Link>
          </motion.div>

          {/* Cart → only visible if logged in */}
          {isLoggedIn && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative ml-2"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="w-6 h-6 cursor-pointer hover:text-[#de5422] transition-colors duration-200" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#de5422] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </motion.div>
          )}

          {/* Login / Profile */}
          {!isLoggedIn ? (
            <div className="flex gap-2 ml-4 flex-nowrap items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="px-4 py-2 whitespace-nowrap rounded-full bg-[#de5422] text-white hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 transition-colors duration-300 text-sm"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600  bg-[#de5422] transition-colors duration-200"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <User className="w-6 h-6 text-white" />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 z-50"
                  >
                    <Link
                      href="/account"
                      className="block px-4 py-3 hover:bg-[#f9f2f0] transition-colors duration-200 border-b border-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Manage Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-red-50 text-[#de5422] transition-colors duration-200"
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
        <div className="flex md:hidden items-center gap-4">
          {/* Mobile Search Icon */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Search className="w-5 h-5 text-[#de5422]" />
          </motion.button>

          {/* Cart Icon (only if logged in) */}
          {isLoggedIn && (
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="relative"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="w-5 h-5 text-[#de5422]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#de5422] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </motion.div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-[#de5422]" />
            ) : (
              <Menu className="w-5 h-5 text-[#de5422]" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 px-4 py-3"
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 outline-none focus:ring-1 focus:ring-[#de5422] focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#de5422] p-1.5 rounded-r-full"
              >
                <Search className="w-6 h-8 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg border-t border-gray-200"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              <Link
                href="/"
                className="py-2 hover:text-[#de5422] transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="py-2 hover:text-[#de5422] transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/news"
                className="py-2 hover:text-[#de5422] transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                News
              </Link>

              <div className="border-t border-gray-200 pt-4 mt-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/account"
                      className="block py-2 hover:text-[#de5422] transition-colors font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left py-2 flex items-center gap-2 text-[#de5422] font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-full bg-[#de5422] text-white text-center hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600  transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 rounded-full border border-[#de5422] text-[#de5422] text-center hover:bg-[#f9f2f0] transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
