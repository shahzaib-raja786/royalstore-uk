"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  User,
  Package,
  History,
  Settings,
  Star,
  Upload,
  X,
  ShoppingBag,
  Calendar,
  DollarSign,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Shield,
  Award,
  Heart,
  Gift,
  ArrowRight,
} from "lucide-react";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [orderHistory, setOrderHistory] = useState([]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returningOrderId, setReturningOrderId] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Current Orders", icon: Package },
    { id: "history", label: "Order History", icon: History },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, ordersRes] = await Promise.all([
          fetch("/api/user", { credentials: "include" }),
          fetch("/api/order", { credentials: "include" }),
        ]);

        const userJson = await userRes.json();
        const ordersJson = await ordersRes.json();

        if (userJson.success) setUser(userJson.data);
        if (ordersJson.success) {
          setOrders(ordersJson.ordersWithoutReview || []);
          setOrderHistory(ordersJson.ordersWithReview || []);
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
        toast.error("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
        setUser(data.data);
        setUser((prev) => ({ ...prev, password: "" }));
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const refreshOrders = async () => {
    try {
      const ordersRes = await fetch("/api/order", { credentials: "include" });
      const ordersJson = await ordersRes.json();
      if (ordersJson.success) {
        setOrders(ordersJson.ordersWithoutReview || []);
        setOrderHistory(ordersJson.ordersWithReview || []);
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;

    try {
      const res = await fetch("/api/order/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: cancellingOrderId,
          reason: cancelReason || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.requestType === "direct_cancellation") {
          toast.success("Order cancelled successfully!");
        } else if (data.requestType === "cancellation_request") {
          toast.success("Cancellation request submitted! Our team will review it shortly.", {
            duration: 5000,
          });
        }

        await refreshOrders();
        setShowCancelModal(false);
        setCancellingOrderId(null);
        setCancelReason("");
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order failed:", err);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const handleReturnOrder = async () => {
    if (!returningOrderId) return;

    try {
      const res = await fetch("/api/order/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: returningOrderId,
          reason: returnReason || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message, { duration: 6000 });
        await refreshOrders();
        setShowReturnModal(false);
        setReturningOrderId(null);
        setReturnReason("");
      } else {
        toast.error(data.message || "Failed to request return");
      }
    } catch (err) {
      console.error("Return request failed:", err);
      toast.error("Failed to request return. Please try again.");
    }
  };

  const handleReview = async (productId, orderId, rating, comment, images) => {
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product: productId,
          order: orderId,
          rating,
          comment,
          images,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Review added successfully!");
        await refreshOrders();
      } else {
        toast.error(data.error || "Failed to add review");
      }
    } catch (err) {
      console.error("Review failed", err);
      toast.error("Failed to add review");
    }
  };

  return (
    <div className="min-h-screen py-6 md:py-10 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Mobile Optimization Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header - Optimized for Mobile */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12 px-2"
        >
          <div className="inline-flex flex-col items-center gap-4 mb-6">
            <div className="p-3 md:p-4 bg-gradient-to-br from-[#de5422] to-orange-600 rounded-2xl shadow-lg">
              <User className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="text-[#de5422]">{user?.name || "User"}</span>!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg">Manage your account and orders</p>
            </div>
          </div>

          {/* Stats - Responsive Grid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 max-w-sm mx-auto"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Orders</p>
                  <p className="text-xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <History className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">History</p>
                  <p className="text-xl font-bold text-gray-900">{orderHistory.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Tabs - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-nowrap gap-2 md:gap-4 justify-center mb-8 md:mb-10 px-2 overflow-x-auto scrollbar-hide"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm md:text-base whitespace-nowrap transition-all duration-200 ${isActive
                  ? "bg-[#de5422] text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Content Sections - Mobile Optimized */}
        <div className="max-w-5xl mx-auto px-2 sm:px-4 md:px-6">
          <AnimatePresence mode="wait">
            {/* Profile Section - Mobile Optimized */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#de5422] to-orange-600 px-5 md:px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Settings className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-white">Profile Settings</h2>
                      <p className="text-orange-100 text-xs md:text-sm mt-0.5">
                        Manage your account information
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="p-5 md:p-8">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user?.name || ""}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-[#de5422] outline-none transition-all bg-white text-sm md:text-base"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-[#de5422] outline-none transition-all bg-white text-sm md:text-base"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={user?.password || ""}
                          onChange={(e) => setUser({ ...user, password: e.target.value })}
                          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                          title="Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-[#de5422] outline-none transition-all bg-white text-sm md:text-base"
                          placeholder="Enter new password (optional)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Leave blank to keep current password
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="w-full bg-gradient-to-r from-[#de5422] to-orange-600 text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                    >
                      {updatingProfile ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating Profile...
                        </div>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Orders Section - Mobile Optimized */}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#de5422] to-orange-600 rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-5 md:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg md:text-xl font-bold text-white">Current Orders</h2>
                          <p className="text-orange-100 text-xs md:text-sm">
                            {orders.length} active order{orders.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-[#de5422]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No active orders</h3>
                    <p className="text-gray-600 mb-6 text-sm md:text-base">
                      Your current orders will appear here once you place an order
                    </p>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="bg-[#de5422] hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm md:text-base"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        onReview={handleReview}
                        onCancelRequest={(orderId) => {
                          setCancellingOrderId(orderId);
                          setShowCancelModal(true);
                        }}
                        onReturnRequest={(orderId) => {
                          setReturningOrderId(orderId);
                          setShowReturnModal(true);
                        }}
                        type="current"
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* History Section - Mobile Optimized */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#de5422] to-orange-600 rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-5 md:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                          <History className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg md:text-xl font-bold text-white">Order History</h2>
                          <p className="text-orange-100 text-xs md:text-sm">
                            {orderHistory.length} completed order{orderHistory.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {orderHistory.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No order history</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Your completed orders will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <OrderCard key={order._id} order={order} type="history" />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Cancellation Modal - Mobile Optimized */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCancelModal(false);
              setCancellingOrderId(null);
              setCancelReason("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden mx-2"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#de5422] to-orange-600 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Cancel Order</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellingOrderId(null);
                      setCancelReason("");
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <p className="text-gray-700 text-sm md:text-base">
                  Are you sure you want to cancel this order?
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm text-amber-800">
                      <p className="font-semibold mb-1">Important:</p>
                      <p>
                        If this order has been assigned to a delivery route, a cancellation request will be created for admin review.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please tell us why you're cancelling..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all duration-200 resize-none text-sm md:text-base"
                    rows={3}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-5 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellingOrderId(null);
                    setCancelReason("");
                  }}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm md:text-base"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-[#de5422] text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm md:text-base"
                >
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Return Modal - Mobile Optimized */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowReturnModal(false);
              setReturningOrderId(null);
              setReturnReason("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden mx-2"
            >
              <div className="bg-gradient-to-r from-[#de5422] to-orange-600 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Return Order</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturningOrderId(null);
                      setReturnReason("");
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-gray-700 text-sm md:text-base">Are you sure you want to return this order?</p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm text-blue-800">
                      <p className="font-semibold mb-1">Return Policy:</p>
                      <p>Returns are accepted within 30 days of delivery.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for return (optional)
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Please tell us why you're returning this order..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all duration-200 resize-none text-sm md:text-base"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturningOrderId(null);
                    setReturnReason("");
                  }}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm md:text-base"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleReturnOrder}
                  className="px-4 py-2 bg-[#de5422] text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm md:text-base"
                >
                  Confirm Return
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Optimization CSS */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Enhanced OrderCard Component - Mobile Optimized
function OrderCard({ order, onReview, onCancelRequest, onReturnRequest, type = "current" }) {
  const [expanded, setExpanded] = useState(false);

  const canCancelOrder = () => {
    if (["cancelled", "delivered", "returned", "return_requested"].includes(order.status)) {
      return false;
    }
    return true;
  };

  const canReturnOrder = () => {
    if (order.status !== "delivered") {
      return false;
    }
    const deliveryDate = order.deliveryDate || order.updatedAt;
    const daysSinceDelivery = Math.floor((new Date() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= 30;
  };

  const getCancelButtonText = () => {
    if (order.status === "cancellation_requested") {
      return "Cancellation Requested";
    }
    if (order.deliveryRoute) {
      return "Request Cancellation";
    }
    return "Cancel Order";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      cancellation_requested: "bg-orange-100 text-orange-800",
      returned: "bg-gray-100 text-gray-800",
      return_requested: "bg-amber-100 text-amber-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: <Clock className="w-4 h-4" />,
      processing: <CheckCircle className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <X className="w-4 h-4" />,
      cancellation_requested: <AlertCircle className="w-4 h-4" />,
      returned: <XCircle className="w-4 h-4" />,
      return_requested: <AlertCircle className="w-4 h-4" />,
    };
    return statusIcons[status] || <Clock className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* Order Header - Mobile Optimized */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="space-y-4">
          {/* Status and Items Count - Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
              </span>
            </div>
            <span className="text-xs text-[#de5422] bg-amber-50 px-3 py-1.5 rounded-full font-semibold">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Order Details - Stacked on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">£{order.totalPrice?.toFixed(2)}</span>
            </div>
            {order.deliveryDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">
                  Delivered {new Date(order.deliveryDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons - Stacked on Mobile */}
          <div className="flex flex-wrap gap-2 pt-2">
            {type === "current" && canCancelOrder() && (
              <button
                onClick={() => onCancelRequest(order._id)}
                disabled={order.status === "cancellation_requested"}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${order.status === "cancellation_requested"
                  ? "bg-orange-100 text-orange-700 cursor-not-allowed"
                  : "bg-red-50 border border-red-500 text-red-600 hover:bg-red-100"
                  }`}
              >
                {order.status === "cancellation_requested" ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Cancellation Pending
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3 h-3" />
                    {getCancelButtonText()}
                  </div>
                )}
              </button>
            )}
            {type === "current" && canReturnOrder() && (
              <button
                onClick={() => onReturnRequest(order._id)}
                className="px-3 py-2 bg-amber-50 border border-amber-500 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium text-xs md:text-sm flex items-center gap-2"
              >
                <Package className="w-3 h-3" />
                Return Order
              </button>
            )}
            {order.status === "return_requested" && (
              <div className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium flex items-center gap-2 text-xs md:text-sm">
                <AlertCircle className="w-3 h-3" />
                Return Pending
              </div>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-2 border border-[#de5422] text-[#de5422] rounded-lg hover:bg-amber-50 transition-colors font-medium text-xs md:text-sm"
            >
              {expanded ? "Hide Details" : "View Details"}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items - Mobile Optimized */}
      {expanded && (
        <div className="p-4 md:p-6 bg-gray-50">
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <OrderItem
                key={index}
                item={item}
                orderId={order._id}
                orderStatus={order.status}
                onReview={onReview}
                type={type}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced OrderItem Component - Mobile Optimized
function OrderItem({ item, orderId, orderStatus, onReview, type }) {
  const canReview = type === "current" && orderStatus === "delivered" && !item.isReviewed;

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-lg border border-gray-200">
      {/* Product Image and Info */}
      <div className="flex gap-3 flex-1">
        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-300">
          <Image
            src={item.product?.thumbnail || "/placeholder-product.png"}
            alt={item.product?.name || "Product"}
            fill
            className="object-cover"
            sizes="64px"
            onError={(e) => {
              e.target.src = "/placeholder-product.png";
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1 line-clamp-2">
            {item.product?.name}
          </h4>

          {item.selectedCustomizations?.length > 0 && (
            <div className="text-xs text-gray-600 mb-2">
              {item.selectedCustomizations.map((customization, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="font-medium">{customization.type}:</span>
                  <span>{customization.option}</span>
                  {customization.extraPrice > 0 && (
                    <span className="text-green-600 ml-1">(+£{customization.extraPrice})</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>Qty: {item.quantity}</span>
            <span>•</span>
            <span className="font-semibold">
              £{((item.priceAtPurchase || item.totalPrice || 0) * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Review Section - Mobile Optimized */}
      <div className="sm:w-48 flex-shrink-0">
        {type === "current" && orderId && (
          <div className="h-full">
            {item.isReviewed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-green-700 font-semibold mb-1 text-xs">
                  <Star className="w-3 h-3 fill-green-600" />
                  Review Submitted
                </div>
                <p className="text-green-600 text-xs">
                  Thank you!
                </p>
              </div>
            ) : canReview ? (
              <ReviewForm
                productId={item.product?._id}
                productName={item.product?.name}
                orderId={orderId}
                onSubmit={onReview}
              />
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold text-xs">
                  <Clock className="w-3 h-3" />
                  {orderStatus === "delivered" ? "Ready for Review" : `Order ${orderStatus}`}
                </div>
                <p className="text-amber-600 text-xs mt-0.5">
                  {orderStatus === "delivered"
                    ? "You can now review"
                    : `Review after delivery`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {type === "history" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold text-xs">
              <History className="w-3 h-3" />
              Order Completed
            </div>
            {item.isReviewed && (
              <p className="text-green-600 text-xs mt-0.5">
                Review submitted
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced ReviewForm Component - Mobile Optimized
function ReviewForm({ productId, productName, orderId, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload only image files");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        } else {
          toast.error("Failed to upload image");
        }
      } catch (err) {
        console.error("Upload failed:", err);
        toast.error("Failed to upload image");
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(productId, orderId, rating, comment.trim(), images);
      setIsExpanded(false);
      setComment("");
      setImages([]);
      setRating(5);
    } catch (error) {
      console.error("Review submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#de5422] p-3">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-[#de5422] text-sm">Write Review</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#de5422] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-all ${star <= rating ? "text-yellow-400 scale-110" : "text-gray-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition text-sm resize-none"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Add Photos ({images.length}/5)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-100 transition flex-1">
                  <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <span className="text-gray-600 text-xs block">Upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 5 || uploading}
                  />
                </label>

                {uploading && (
                  <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div>
                <div className="flex gap-2 flex-wrap">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-300">
                        <Image
                          src={url}
                          fill
                          alt={`Preview ${index + 1}`}
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !comment.trim()}
              className="w-full bg-[#de5422] hover:bg-orange-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Review"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}