"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [deleteItemId, setDeleteItemId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        credentials: "include",
        cache: "no-cache",
      });

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      console.log("cart data", data);
      setCart(data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, delta) => {
    const item = cart.items.find((item) => item._id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);

    // Optimistic update
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    }));

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) throw new Error("Failed to update quantity");

      toast.success("Cart updated");
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Failed to update quantity");
      // Revert optimistic update
      fetchCart();
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const confirmDelete = async () => {
    const itemId = deleteItemId;
    if (!itemId) return;

    const itemToDelete = cart.items.find((item) => item._id === itemId);
    setDeleteItemId(null);

    // Optimistic update
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item._id !== itemId),
    }));

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Item removed from cart");
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to remove item");
      // Revert optimistic update
      setCart((prev) => ({
        ...prev,
        items: [...prev.items, itemToDelete],
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.items.reduce(
      (acc, item) =>
        acc + (item.fullPrice || item.totalPrice || 0) * (item.quantity || 1),
      0
    );

    const savings = cart.items.reduce((acc, item) => {
      const originalPrice = item.fullPrice || item.totalPrice || 0;
      const currentPrice = item.totalPrice || item.fullPrice || 0;
      return acc + (originalPrice - currentPrice) * (item.quantity || 1);
    }, 0);

    return { subtotal, savings, total: Math.max(subtotal - savings, 0) };
  };

  const { subtotal, savings, total } = calculateTotals();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 mb-6 p-4 border rounded-xl">
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart.items?.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you have not added any products to your cart yet. Start
          shopping to discover amazing products!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gradient-to-r from-[#de5422] to-[#ff8a4a] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
          >
            Start Shopping
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#de5422] to-[#ff8a4a]">
          Shopping Cart ({cart.items.length}{" "}
          {cart.items.length === 1 ? "item" : "items"})
        </h1>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[#de5422] hover:text-[#ff8a4a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.items.map((item) => {
              const product = item.product || {};
              const customizations =
                item.selectedCustomizations?.flatMap(
                  (group) => group.selectedCustomizations || []
                ) || [];

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                  className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 relative border rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={product.thumbnail || "/placeholder-product.png"}
                          alt={product.name || "Product"}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder-product.png";
                          }}
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {product.name || "Unknown Product"}
                      </h3>

                      {/* Customizations */}
                      {customizations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {customizations.map((customization) => (
                            <p
                              key={customization._id}
                              className="text-sm text-gray-600"
                            >
                              {customization.type}: {customization.option}
                              {customization.extraPrice > 0 && (
                                <span className="text-green-600 ml-1">
                                  (+${customization.extraPrice})
                                </span>
                              )}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-2 flex items-center gap-2">
                        {item.fullPrice > item.totalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${(item.fullPrice * item.quantity).toFixed(2)}
                          </span>
                        )}
                        <span className="text-lg font-semibold text-[#de5422]">
                          $
                          {(
                            (item.totalPrice || item.fullPrice || 0) *
                            item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex sm:flex-col sm:items-end justify-between sm:justify-start gap-4">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={
                            updatingItems.has(item._id) || item.quantity <= 1
                          }
                          className="p-1 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4 text-[#de5422]" />
                        </button>

                        <span
                          className={`w-8 text-center font-medium ${updatingItems.has(item._id)
                            ? "text-gray-400"
                            : "text-gray-900"
                            }`}
                        >
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => handleQuantityChange(item._id, 1)}
                          disabled={updatingItems.has(item._id)}
                          className="p-1 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4 text-[#de5422]" />
                        </button>
                      </div>

                      <button
                        onClick={() => setDeleteItemId(item._id)}
                        disabled={updatingItems.has(item._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl p-6 sticky top-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Savings</span>
                  <span>-${savings.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-md cursor-pointer
        ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#de5422] hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
                    ></path>
                  </svg>
                  <span>Proceeding...</span>
                </span>
              ) : (
                "Proceed to Checkout"
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Free shipping and returns included
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteItemId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Remove Item?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove this item from your cart?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteItemId(null)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
