"use client";

import { useEffect, useState, Fragment } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Package,
  User,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Map,
  ShoppingCart,
  Loader,
  MoreVertical,
  Zap,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal"; // Assuming ConfirmModal is in this path

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedCity, setSelectedCity] = useState("all");
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({});
  const [simpleOrderData, setSimpleOrderData] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  // Refund State
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState(null);

  // Auto Assign State
  const [autoAssignModal, setAutoAssignModal] = useState(false);
  const [autoAssignStep, setAutoAssignStep] = useState(1); // 1: Date, 2: Preview
  const [autoAssignDate, setAutoAssignDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [previewData, setPreviewData] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);

  // View Mode
  const [viewMode, setViewMode] = useState("unassigned"); // "unassigned", "all", "route"

  // Stats
  const [todayStats, setTodayStats] = useState({ count: 0, revenue: 0 });

  // ✅ Handle Refund
  const handleRefund = async (orderId) => {
    setButtonLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`/api/admin/order/${orderId}/refund`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Refund processed successfully!");
        fetchOrders(); // Refresh to update status
      } else {
        toast.error(data.message || "Failed to process refund");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("An error occurred during refund processing");
    } finally {
      setButtonLoading(prev => ({ ...prev, [orderId]: false }));
      setShowRefundConfirm(false);
      setRefundOrderId(null);
    }
  };

  // ✅ Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/order");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);

        // Calculate Today's Stats
        const today = new Date().toDateString();
        const todaysOrders = data.orders.filter(o =>
          new Date(o.createdAt).toDateString() === today
        );
        setTodayStats({
          count: todaysOrders.length,
          revenue: todaysOrders.reduce((acc, o) => acc + o.totalPrice, 0)
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    }
    setLoading(false);
  };

  // ✅ Fetch routes
  const fetchRoutes = async () => {
    try {
      const res = await fetch("/api/delivery");
      const data = await res.json();
      if (data.success) setRoutes(data.routes || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Failed to load routes");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRoutes();
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMobileMenuOpen(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ✅ Fetch simplified order data
  const fetchSimpleOrderData = async (orderId) => {
    try {
      const response = await fetch(`/api/order/${orderId}/simple`, {
        credentials: "include"
      });
      const data = await response.json();

      if (data.success) {
        setSimpleOrderData(prev => ({
          ...prev,
          [orderId]: data.order
        }));
      }
    } catch (error) {
      console.error("Error fetching simplified order:", error);
    }
  };

  // ✅ Add or remove route assignment
  const toggleOrderRoute = async (orderId, routeId, action) => {
    setButtonLoading(prev => ({ ...prev, [orderId]: true }));

    // 🟢 Find the selected route to include its deliveryDate
    const selected = routes.find(r => r._id === routeId);

    try {
      const res = await fetch(`/api/admin/order/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId,
          orderId,
          action,
          deliveryDate: selected?.deliveryDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          `${action === "add" ? "✅ Order assigned to route" : "🗑️ Order removed from route"}`
        );
        fetchOrders();
        setMobileMenuOpen(null);
      } else {
        toast.error(data.message || "Failed to update route assignment");
      }
    } catch (error) {
      console.error("Error updating route:", error);
      toast.error("Failed to update route assignment");
    }

    setButtonLoading(prev => ({ ...prev, [orderId]: false }));
  };

  // Auto Assign Functions
  const openAutoAssign = () => {
    setAutoAssignModal(true);
    setAutoAssignStep(1);
    setPreviewData(null);
    setOverrides({});
  };

  const handleAnalyze = async () => {
    setAutoAssignLoading(true);
    try {
      const res = await fetch("/api/delivery/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryDate: autoAssignDate,
          dryRun: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewData(data.preview);

        // Initialize overrides
        const initialOverrides = {};
        if (data.preview?.newRoutes) {
          data.preview.newRoutes.forEach(r => {
            initialOverrides[r.city] = r.suggestedDate || autoAssignDate;
          });
        }
        if (data.preview?.existingRoutes) {
          data.preview.existingRoutes.forEach(r => {
            initialOverrides[r.city] = r.suggestedDate || autoAssignDate;
          });
        }
        setOverrides(initialOverrides);

        setAutoAssignStep(2);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Analysis failed");
    } finally {
      setAutoAssignLoading(false);
    }
  };

  const handleExecuteAutoAssign = async () => {
    setAutoAssignLoading(true);
    try {
      // Build assignments
      const assignments = [];
      const AllCities = [];
      if (previewData?.newRoutes) AllCities.push(...previewData.newRoutes.map(r => r.city));
      if (previewData?.existingRoutes) AllCities.push(...previewData.existingRoutes.map(r => r.city));

      [...new Set(AllCities)].forEach(city => {
        if (overrides[city]) {
          assignments.push({ city, date: overrides[city] });
        }
      });

      const res = await fetch("/api/delivery/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryDate: autoAssignDate, // Fallback
          dryRun: false,
          assignments
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setAutoAssignModal(false);
        fetchOrders();
        fetchRoutes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Execution failed");
    } finally {
      setAutoAssignLoading(false);
    }
  };

  const updateOverrideDate = (city, date) => {
    setOverrides(prev => ({ ...prev, [city]: date }));
  };

  // ✅ City filter
  const cities = [...new Set(orders.map(o => o.shippingAddress?.city).filter(Boolean))];

  // ✅ Filtered orders logic
  const filteredOrders = orders.filter(order => {
    // 1. Primary Filter (View Mode)
    if (viewMode === "unassigned") {
      if (order.deliveryRoute) return false;
      // Also filter out 'cancelled', 'returned' status? assuming user wants active orders
      if (["cancelled", "returned", "delivered"].includes(order.status)) return false;
    } else if (viewMode === "route") {
      if (!selectedRoute) return false;
      if (order.deliveryRoute !== selectedRoute._id) return false;
    }
    // "all" doesn't filter by route status

    // 2. Secondary Filter (City)
    if (selectedCity !== "all" && order.shippingAddress?.city !== selectedCity) return false;

    return true;
  });

  // ✅ Filter out active routes
  const activeRoutes = routes.filter(
    r => r.status !== "shipped" && r.status !== "delivered"
  );

  // Mobile Order Card Component
  const OrderCard = ({ order, index }) => {
    const isAssigned = !!order.deliveryRoute;
    const isExpanded = expandedOrder === order._id;
    const isBtnLoading = buttonLoading[order._id];

    // Determine which route it is assigned to (for display)
    const assignedRoute = routes.find(r => r._id === order.deliveryRoute);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        {/* Order Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {order.user?.name || "Unknown Customer"}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {order.shippingAddress?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">{order.shippingAddress?.city}</span>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(mobileMenuOpen === order._id ? null : order._id);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen === order._id && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                  <button
                    onClick={() => {
                      if (!isExpanded) fetchSimpleOrderData(order._id);
                      setExpandedOrder(isExpanded ? null : order._id);
                      setMobileMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>

                  {/* Route Actions only visible if a route is selected in context, OR generalized logic */}
                  {viewMode === "route" && selectedRoute && (
                    <button
                      onClick={() => toggleOrderRoute(order._id, selectedRoute._id, isAssigned ? "remove" : "add")}
                      disabled={isBtnLoading}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isBtnLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : isAssigned ? (
                        <>
                          <X className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Remove from Route</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Assign to Route</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-bold text-green-600 text-sm">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>
            {isAssigned ? (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                <Truck className="w-3 h-3" />
                {assignedRoute?.city || 'Assigned'}
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Unassigned
              </span>
            )}
          </div>
        </div>

        {/* Expanded Order Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-gray-100 bg-gray-50"
            >
              <div className="p-4">
                {simpleOrderData[order._id] ? (
                  <div className="space-y-4">
                    {/* Simplified for brevity - reuse detailed components if needed */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Status</span>
                        <span className="font-medium capitalize">{simpleOrderData[order._id].status}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium">{new Date(simpleOrderData[order._id].createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="font-medium mb-2">Products</h4>
                        {simpleOrderData[order._id].products.map((p, idx) => (
                          <div key={idx} className="flex justify-between text-xs mb-1">
                            <span>{p.quantity}x {p.productName}</span>
                            <span>${p.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="w-5 h-5 text-[#de5422] animate-spin" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6 flex justify-center items-center">
        <Loader className="w-10 h-10 text-[#de5422] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Stats & Title */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-orange-100 p-6 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-500 text-sm mt-1">Track orders and manage delivery routes efficiently.</p>
              </div>
              <button
                onClick={openAutoAssign}
                className="bg-gradient-to-r from-[#de5422] to-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span>Auto Assign</span>
              </button>
            </div>

            <div className="flex gap-6 mt-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 text-[#de5422] rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Routes</p>
                  <p className="text-xl font-bold text-gray-900">{activeRoutes.length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Today's Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white p-6"
          >
            <h2 className="text-lg font-semibold mb-1 opacity-90">Today's Overview</h2>
            <p className="text-xs opacity-75 mb-6">{new Date().toDateString()}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{todayStats.count}</p>
                <p className="text-sm opacity-80 mt-1">New Orders</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">${todayStats.revenue.toFixed(0)}</p>
                <p className="text-sm opacity-80 mt-1">Revenue</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* View Toggles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 flex gap-1 w-full sm:w-fit overflow-x-auto">
          <button
            onClick={() => setViewMode("unassigned")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewMode === "unassigned" ? "bg-orange-100 text-[#de5422]" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Unassigned Orders
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewMode === "all" ? "bg-orange-100 text-[#de5422]" : "text-gray-600 hover:bg-gray-50"}`}
          >
            All Orders
          </button>
          <button
            onClick={() => setViewMode("route")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewMode === "route" ? "bg-orange-100 text-[#de5422]" : "text-gray-600 hover:bg-gray-50"}`}
          >
            By Route
          </button>
        </div>

        {/* Route Selector (Only visible in 'route' mode) */}
        {viewMode === "route" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Select Operations Route</h3>

            {activeRoutes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No active delivery routes found.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {activeRoutes.map(route => (
                  <button
                    key={route._id}
                    onClick={() => setSelectedRoute(selectedRoute?._id === route._id ? null : route)}
                    className={`group relative px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${selectedRoute?._id === route._id
                      ? "border-[#de5422] bg-orange-50 ring-2 ring-orange-200 ring-offset-2"
                      : "border-gray-100 bg-white hover:border-orange-200 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className={`w-4 h-4 ${selectedRoute?._id === route._id ? "text-[#de5422]" : "text-gray-400"}`} />
                      <span className={`font-semibold ${selectedRoute?._id === route._id ? "text-[#de5422]" : "text-gray-700"}`}>
                        {route.city}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 pl-6">
                      {new Date(route.deliveryDate).toLocaleDateString()}
                    </div>
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${route.status === 'processing' ? 'bg-blue-400' : 'bg-yellow-400'
                      }`} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Orders Table/Grid */}
        <motion.div
          layout
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtering by:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-white border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="all">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredOrders.length} orders
            </div>
          </div>

          {/* List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block sm:hidden p-4 space-y-3">
                {filteredOrders.map((order, index) => (
                  <OrderCard key={order._id} order={order} index={index} />
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Info</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">View Detail</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => {
                      const isAssigned = !!order.deliveryRoute;
                      const assignedRoute = routes.find(r => r._id === order.deliveryRoute);
                      // Find matching existing route for auto-assign
                      const matchingRoute = !isAssigned && routes.find(r =>
                        r.city.toLowerCase() === order.shippingAddress.city?.toLowerCase() &&
                        (r.status === 'pending' || r.status === 'processing')
                      );
                      const isBtnLoading = buttonLoading[order._id];

                      // Action Logic
                      const showAssignAction = viewMode === "route" && selectedRoute;

                      const isExpanded = expandedOrder === order._id;

                      return (
                        <Fragment key={order._id}>
                          <tr className="hover:bg-orange-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-mono text-xs text-gray-500">#{order._id.slice(-6)}</span>
                                <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                  {order.user?.name?.[0] || "?"}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{order.user?.name}</div>
                                  <div className="text-xs text-gray-500">{order.shippingAddress?.city}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-green-600">${order.totalPrice.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4">
                              {isAssigned ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Truck className="w-3.5 h-3.5" />
                                  {assignedRoute?.city}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            {/* View Detail Column - New Button */}
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  if (!isExpanded) fetchSimpleOrderData(order._id);
                                  setExpandedOrder(isExpanded ? null : order._id);
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${isExpanded
                                  ? "bg-orange-50 text-[#de5422] border-orange-200"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-[#de5422] hover:text-[#de5422]"
                                  }`}
                              >
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {isExpanded ? "Hide" : "View Detail"}
                              </button>
                            </td>

                            <td className="px-6 py-4 text-right">
                              {showAssignAction ? (
                                <button
                                  onClick={() => toggleOrderRoute(order._id, selectedRoute._id, order.deliveryRoute === selectedRoute._id ? "remove" : "add")}
                                  disabled={isBtnLoading}
                                  className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${order.deliveryRoute === selectedRoute._id
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-green-600 hover:bg-green-50"
                                    }`}
                                  title={order.deliveryRoute === selectedRoute._id ? "Remove from Route" : "Assign to Route"}
                                >
                                  {isBtnLoading ? <Loader className="w-5 h-5 animate-spin" /> :
                                    (order.deliveryRoute === selectedRoute._id ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />)
                                  }
                                </button>
                              ) : (
                                <button className="text-gray-400 hover:text-[#de5422]">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              )}

                              {/* Auto Assign Button for Unassigned Orders with Matching Route */}
                              {matchingRoute && (
                                <button
                                  onClick={() => toggleOrderRoute(order._id, matchingRoute._id, "add")}
                                  disabled={isBtnLoading}
                                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md hover:scale-105"
                                  title={`Auto Assign to existing ${matchingRoute.city} route`}
                                >
                                  {isBtnLoading ? <Loader className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                  Auto Assign
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* Expanded Detail Row - Re-implemented */}
                          <AnimatePresence>
                            {isExpanded && (
                              <tr>
                                <td colSpan="6" className="p-0 border-b border-gray-100">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-50/50 overflow-hidden"
                                  >
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {simpleOrderData[order._id] ? (
                                        <>
                                          {/* Product List */}
                                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                              <Package className="w-4 h-4 text-[#de5422]" />
                                              Products ({simpleOrderData[order._id].products.length})
                                            </h4>
                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                              {simpleOrderData[order._id].products.map((p, idx) => (
                                                <div key={idx} className="flex gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                                                  <img
                                                    src={p.image || "/fallback.png"}
                                                    alt={p.productName}
                                                    className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                                  />
                                                  <div className="flex-1">
                                                    <div className="flex justify-between font-medium text-gray-900">
                                                      <span>{p.productName}</span>
                                                      <span>${p.total}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                      Qty: {p.quantity} × ${p.price}
                                                    </div>
                                                    {p.customizations?.length > 0 && (
                                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {p.customizations.map((c, i) => (
                                                          <span key={i} className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100">
                                                            {c.type}: {c.option}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Shipping & Payment Info */}
                                          <div className="space-y-4">
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#de5422]" />
                                                Shipping Details
                                              </h4>
                                              <div className="text-sm space-y-2 text-gray-600">
                                                <div className="flex justify-between">
                                                  <span>Name:</span>
                                                  <span className="font-medium text-gray-900">{simpleOrderData[order._id].shippingInfo?.customerName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span>Phone:</span>
                                                  <span className="font-medium text-gray-900">{simpleOrderData[order._id].shippingInfo?.phone}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span>Email:</span>
                                                  <span className="font-medium text-gray-900 truncate max-w-[200px]">{simpleOrderData[order._id].shippingInfo?.email}</span>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                  <p className="font-medium text-gray-900">Address:</p>
                                                  <p>{simpleOrderData[order._id].shippingInfo?.address?.street}</p>
                                                  <p>{simpleOrderData[order._id].shippingInfo?.address?.city}, {simpleOrderData[order._id].shippingInfo?.address?.postalCode}</p>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                Payment Info
                                              </h4>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Amount:</span>
                                                <span className="font-bold text-green-600 text-lg">${simpleOrderData[order._id].totalPrice.toFixed(2)}</span>
                                              </div>
                                              <div className="flex justify-between text-sm mt-1">
                                                <span className="text-gray-600">Method:</span>
                                                <span className="font-medium capitalize">{order.paymentMethod}</span>
                                              </div>
                                              <div className="flex justify-between text-sm mt-1">
                                                <span className="text-gray-600">Payment Status:</span>
                                                <span className={`font-semibold capitalize ${order.paymentStatus === "paid" ? "text-green-600" :
                                                  order.paymentStatus === "refunded" ? "text-orange-600" :
                                                    "text-yellow-600"
                                                  }`}>{order.paymentStatus}</span>
                                              </div>

                                              {/* Stripe Refund Button */}
                                              {order.paymentMethod === "stripe" &&
                                                order.paymentStatus === "paid" &&
                                                ["cancelled", "returned"].includes(order.status) && (
                                                  <button
                                                    onClick={() => {
                                                      setRefundOrderId(order._id);
                                                      setShowRefundConfirm(true);
                                                    }}
                                                    disabled={buttonLoading[order._id]}
                                                    className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                                  >
                                                    {buttonLoading[order._id] ? (
                                                      <Loader className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                      <DollarSign className="w-4 h-4" />
                                                    )}
                                                    Issue Stripe Refund
                                                  </button>
                                                )}
                                            </div>

                                          </div>
                                        </>
                                      ) : (
                                        <div className="col-span-2 flex justify-center py-8">
                                          <Loader className="w-8 h-8 text-[#de5422] animate-spin" />
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Auto Assign Modal */}
      <AnimatePresence>
        {autoAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-[#de5422] p-6 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Auto Assign Routes
                </h3>
                <p className="text-white/80 text-sm mt-1">Automatically group orders and create delivery routes.</p>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                {autoAssignStep === 1 ? (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3 text-sm text-orange-800">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>We will analyze all <strong>unassigned pending orders</strong> and group them by city. You can review the plan and customize dates before execution.</p>
                    </div>
                    {/* Date selection removed from Step 1 */}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <p className="text-gray-500 text-sm">Target Date (Default)</p>
                      <p className="text-lg font-bold text-gray-900">{new Date(autoAssignDate).toDateString()}</p>
                    </div>

                    {previewData?.newRoutes?.length === 0 && previewData?.existingRoutes?.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No eligible orders found to assign.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* New Routes */}
                        {previewData?.newRoutes?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-2">Creating New Routes</h4>
                            <div className="space-y-2">
                              {previewData.newRoutes.map((r, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 gap-3">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium text-gray-800">{r.city}</span>
                                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">{r.orderCount} Orders</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-green-700 font-medium">Delivery:</span>
                                    <input
                                      type="date"
                                      value={overrides[r.city] || autoAssignDate}
                                      onChange={(e) => updateOverrideDate(r.city, e.target.value)}
                                      className="bg-white border border-green-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Existing Routes */}
                        {previewData?.existingRoutes?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Updating Existing Routes</h4>
                            <div className="space-y-2">
                              {previewData.existingRoutes.map((r, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 gap-3">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium text-gray-800">{r.city}</span>
                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Add {r.orderCount} Orders</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-blue-700 font-medium">Delivery:</span>
                                    <input
                                      type="date"
                                      value={overrides[r.city] || autoAssignDate}
                                      onChange={(e) => updateOverrideDate(r.city, e.target.value)}
                                      className="bg-white border border-blue-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setAutoAssignModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>

                {autoAssignStep === 1 ? (
                  <button
                    onClick={handleAnalyze}
                    disabled={autoAssignLoading}
                    className="bg-[#de5422] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-orange-700 transition-all flex items-center gap-2"
                  >
                    {autoAssignLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Analyze Orders"}
                  </button>
                ) : (
                  <button
                    onClick={handleExecuteAutoAssign}
                    disabled={autoAssignLoading || (previewData?.newRoutes?.length === 0 && previewData?.existingRoutes?.length === 0)}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {autoAssignLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Confirm & Assign"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Confirmation Modal */}
      <ConfirmModal
        show={showRefundConfirm}
        title="Issue Stripe Refund?"
        message="Are you sure you want to issue a Stripe refund for this order? This action will return the payment to the customer and cannot be undone."
        yesText="Confirm Refund"
        variant="warning"
        onYes={() => handleRefund(refundOrderId)}
        onNo={() => {
          setShowRefundConfirm(false);
          setRefundOrderId(null);
        }}
      />
    </div>
  );
}