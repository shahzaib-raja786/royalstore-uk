"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function DeliveryRoutesManager() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [city, setCity] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [addingRoute, setAddingRoute] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, routeId: null, city: "" });
  const [deleting, setDeleting] = useState(false);

  const fetchRoutes = async () => {
    try {
      const res = await fetch("/api/delivery");
      const data = await res.json();
      if (data.success) {
        setRoutes(data.routes.filter((r) => r.status !== "delivered"));
        setHistory(data.routes.filter((r) => r.status === "delivered"));
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!city || !deliveryDate) {
      toast.error("Please fill in all fields");
      return;
    }

    setAddingRoute(true);

    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, deliveryDate }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`✅ Route added successfully for ${city}!`);
        setCity("");
        setDeliveryDate("");
        fetchRoutes();
      } else {
        toast.error(data.message || "Failed to add route");
      }
    } catch (error) {
      console.error("Error adding route:", error);
      toast.error("❌ Failed to add route. Please try again.");
    } finally {
      setAddingRoute(false);
    }
  };

  const openDeleteModal = (routeId, city) => {
    setDeleteModal({ open: true, routeId, city });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, routeId: null, city: "" });
  };

  const handleDelete = async () => {
    if (!deleteModal.routeId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/delivery/${deleteModal.routeId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success(`🗑️ Route for ${deleteModal.city} deleted!`);
        closeDeleteModal();
        fetchRoutes();
      } else {
        toast.error(data.message || "Failed to delete route");
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("❌ Failed to delete route. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Fetch detailed order information
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/order/${orderId}/simple`, {
        credentials: "include"
      });
      const data = await response.json();

      if (data.success) {
        setOrderDetails(prev => ({
          ...prev,
          [orderId]: data.order
        }));
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleViewOrders = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedRoute(data.route);
        setOrders(data.orders);
        setExpandedRoute(expandedRoute === id ? null : id);

        // Fetch detailed information for each order
        if (data.orders && data.orders.length > 0) {
          data.orders.forEach(order => {
            if (!orderDetails[order._id]) {
              fetchOrderDetails(order._id);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (routeId, status) => {
    try {
      const res = await fetch("/api/delivery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId, status }),
      });
      const data = await res.json();

      if (data.success) {
        const statusEmojis = {
          pending: "⏳",
          processing: "🔄",
          shipped: "🚚",
          delivered: "✅"
        };
        toast.success(`${statusEmojis[status]} Status updated to ${status}!`);
        fetchRoutes();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("❌ Failed to update status. Please try again.");
    }
  };

  // Mobile route card component
  const RouteCard = ({ route, isHistory = false }) => (
    <div className="border border-orange-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-50 to-amber-50">
      {/* Route Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl">
              <span className="text-lg sm:text-xl">🏙️</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#de5422]">{route.city}</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Delivery: {new Date(route.deliveryDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
              {isHistory ? (
                <div className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 font-medium">
                  ✅ Delivered
                </div>
              ) : (
                <select
                  value={route.status}
                  onChange={(e) => handleStatusChange(route._id, e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="processing">🔄 Processing</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">✅ Delivered</option>
                </select>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewOrders(route._id)}
                className="flex-1 bg-gradient-to-r from-[#de5422] to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
              >
                {loading && expandedRoute === route._id ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2 justify-center">
                    <span>▼</span>
                    <span className="hidden sm:inline">
                      {expandedRoute === route._id ? 'Hide' : 'View'}
                    </span>
                  </div>
                )}
              </button>

              {!isHistory && (
                <button
                  onClick={() => openDeleteModal(route._id, route.city)}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expandedRoute === route._id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 bg-orange-50 border-t border-orange-200">
              {selectedRoute && selectedRoute._id === route._id ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#de5422] rounded-lg">
                      <span className="text-lg text-white">📋</span>
                    </div>
                    <h4 className="text-lg font-semibold text-[#de5422]">
                      Orders for {selectedRoute.city}
                    </h4>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="text-3xl sm:text-4xl mb-3">📭</div>
                      <p className="text-gray-600 text-sm sm:text-base">No orders assigned to this route yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {orders.map((order, orderIndex) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: orderIndex * 0.1 }}
                          className="bg-white border border-orange-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                        >
                          {orderDetails[order._id] ? (
                            <div className="p-4 sm:p-6">
                              {/* Order Header */}
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 rounded-lg">
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-600">Order ID</span>
                                  <p className="text-gray-800 font-mono text-xs sm:text-sm truncate">{order._id}</p>
                                </div>
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-600">Customer</span>
                                  <p className="text-gray-800 text-sm sm:text-base truncate">{orderDetails[order._id].shippingInfo.customerName}</p>
                                </div>
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-600">Total</span>
                                  <p className="text-green-600 font-semibold text-sm sm:text-base">${orderDetails[order._id].totalPrice}</p>
                                </div>
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-600">Status</span>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>

                              {/* Shipping Information */}
                              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 rounded-lg">
                                <h5 className="text-base sm:text-lg font-semibold text-[#de5422] mb-3 flex items-center gap-2">
                                  <span>🚚</span>
                                  Shipping Info
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-600">Phone:</span>
                                    <p className="text-gray-800 text-sm sm:text-base">{orderDetails[order._id].shippingInfo.phone}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-600">Email:</span>
                                    <p className="text-gray-800 text-sm sm:text-base truncate">{orderDetails[order._id].shippingInfo.email}</p>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <span className="text-xs sm:text-sm font-medium text-gray-600">Address:</span>
                                  <p className="text-gray-800 text-sm sm:text-base">
                                    {orderDetails[order._id].shippingInfo.address.street}, {orderDetails[order._id].shippingInfo.address.city} {orderDetails[order._id].shippingInfo.address.postalCode}
                                  </p>
                                  {orderDetails[order._id].shippingInfo.address.notes && (
                                    <p className="text-xs text-gray-600 mt-1 italic">
                                      Note: {orderDetails[order._id].shippingInfo.address.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Products */}
                              <div>
                                <h5 className="text-base sm:text-lg font-semibold text-[#de5422] mb-3 flex items-center gap-2">
                                  <span>📦</span>
                                  Products ({orderDetails[order._id].products.length})
                                </h5>
                                <div className="space-y-3">
                                  {orderDetails[order._id].products.map((product, productIndex) => (
                                    <div key={productIndex} className="border border-orange-200 rounded-lg p-3 sm:p-4">
                                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                        <h6 className="font-semibold text-gray-800 text-sm sm:text-base">{product.productName}</h6>
                                        <span className="text-green-600 font-semibold text-sm sm:text-base">${product.total}</span>
                                      </div>

                                      <div className="text-xs sm:text-sm text-gray-600 mb-2">
                                        {product.quantity} × ${product.price} = ${product.total}
                                      </div>

                                      {/* Customizations */}
                                      {product.customizations.length > 0 && (
                                        <div className="mt-2">
                                          <span className="text-xs sm:text-sm font-medium text-gray-600">Customizations:</span>
                                          <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                                            {product.customizations.map((custom, customIdx) => (
                                              <span key={customIdx} className="bg-orange-100 px-2 py-1 rounded text-xs">
                                                {custom.type}: {custom.option}
                                                {custom.extraPrice > 0 && (
                                                  <span className="text-green-600 ml-1">(+${custom.extraPrice})</span>
                                                )}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 sm:p-6">
                              <div className="flex items-center justify-center py-6 sm:py-8">
                                <div className="flex items-center gap-3">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#de5422] border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-gray-600 text-sm sm:text-base">Loading order details...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#de5422] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 text-sm sm:text-base">Loading order details...</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen  p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#de5422] mb-2">🚚 Delivery Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage delivery routes and track orders</p>
        </div>

        {/* Add Route */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-orange-200"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl">
              <span className="text-xl sm:text-2xl">➕</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#de5422]">Add New Delivery Route</h2>
          </div>

          <form onSubmit={handleAddRoute} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={addingRoute}
                className={`w-full border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all duration-300 text-sm sm:text-base ${addingRoute
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-200'
                  }`}
                required
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                disabled={addingRoute}
                className={`w-full border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all duration-300 text-sm sm:text-base ${addingRoute
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-200'
                  }`}
                required
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={addingRoute}
                className={`w-full font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 transform text-sm sm:text-base ${addingRoute
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#de5422] to-amber-600 hover:from-orange-700 hover:to-amber-700 hover:scale-105'
                  } text-white`}
              >
                {addingRoute ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Route...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>➕</span>
                    <span>Add Route</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Active Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-orange-200"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl">
              <span className="text-xl sm:text-2xl">🚛</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#de5422]">Active Delivery Routes</h2>
          </div>

          {routes.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Active Routes</h3>
              <p className="text-gray-500 text-sm sm:text-base">Add a new delivery route to get started</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {routes.map((route, index) => (
                <RouteCard key={route._id} route={route} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-orange-200"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl">
              <span className="text-xl sm:text-2xl">📚</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#de5422]">Delivery History</h2>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📋</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Delivery History</h3>
              <p className="text-gray-500 text-sm sm:text-base">Completed deliveries will appear here</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {history.map((route, index) => (
                <RouteCard key={route._id} route={route} isHistory={true} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal.open && (
            <motion.div
              key="delete-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            >
              <motion.div
                key="delete-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md border border-orange-200"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg sm:rounded-xl bg-red-100">
                      <span className="text-lg sm:text-xl">⚠️</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#de5422]">Delete Route</h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Are you sure you want to delete the route for
                    {" "}
                    <span className="font-semibold text-gray-800">{deleteModal.city}</span>? This action cannot be undone.
                  </p>
                </div>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex items-center justify-end gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold border transition text-sm sm:text-base ${deleting ? "cursor-not-allowed opacity-70" : "hover:bg-gray-50"
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-white transition shadow text-sm sm:text-base ${deleting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      }`}
                  >
                    {deleting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Deleting...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">🗑️ Delete</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}