"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Shield, Truck, RefreshCw } from "lucide-react";
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
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 mb-4 p-4 border rounded-xl">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3 md:w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 md:w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart.items?.length) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 text-center py-12 md:py-20">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-[#de5422]" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-2">
          Looks like you have not added any products to your cart yet. Start shopping to discover amazing products!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
          <button
            onClick={() => router.push("/")}
            className="px-5 py-3 bg-gradient-to-r from-[#de5422] to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm md:text-base"
          >
            Start Shopping
          </button>
          <button
            onClick={() => router.back()}
            className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm md:text-base flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#de5422]">
            Shopping Cart ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Review your items and proceed to checkout
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[#de5422] hover:text-orange-700 transition-colors text-sm md:text-base bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 hover:border-orange-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Cart Items - Mobile Optimized */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* Trust Badges - Mobile */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 md:p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">Secure Shopping</p>
                <p className="text-xs text-green-600">Free shipping & 30-day returns</p>
              </div>
            </div>
          </div>

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
                  className="bg-white border rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    {/* Product Image - Mobile Optimized */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 relative border rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={product.thumbnail || "/placeholder-product.png"}
                          alt={product.name || "Product"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 80px, 96px"
                          onError={(e) => {
                            e.target.src = "/placeholder-product.png";
                          }}
                        />
                      </div>
                    </div>

                    {/* Product Details - Mobile Optimized */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                        {product.name || "Unknown Product"}
                      </h3>

                      {/* Customizations */}
                      {customizations.length > 0 && (
                        <div className="mt-1 md:mt-2 space-y-0.5">
                          {customizations.map((customization) => (
                            <p
                              key={customization._id}
                              className="text-xs text-gray-600"
                            >
                              {customization.type}: {customization.option}
                              {customization.extraPrice > 0 && (
                                <span className="text-green-600 ml-1">
                                  (+£{customization.extraPrice})
                                </span>
                              )}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Price - Mobile Optimized */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {item.fullPrice > item.totalPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            £{(item.fullPrice * item.quantity).toFixed(2)}
                          </span>
                        )}
                        <span className="text-base sm:text-lg font-bold text-[#de5422]">
                          £
                          {(
                            (item.totalPrice || item.fullPrice || 0) *
                            item.quantity
                          ).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-600">
                          £{(item.totalPrice || item.fullPrice || 0).toFixed(2)} each
                        </span>
                      </div>

                      {/* Quantity Controls - Mobile Version */}
                      <div className="mt-3 sm:hidden flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => handleQuantityChange(item._id, -1)}
                            disabled={
                              updatingItems.has(item._id) || item.quantity <= 1
                            }
                            className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3 h-3 text-[#de5422]" />
                          </button>

                          <span
                            className={`w-8 text-center font-medium text-sm ${updatingItems.has(item._id)
                              ? "text-gray-400"
                              : "text-gray-900"
                              }`}
                          >
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleQuantityChange(item._id, 1)}
                            disabled={updatingItems.has(item._id)}
                            className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3 h-3 text-[#de5422]" />
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

                    {/* Quantity Controls - Desktop Version */}
                    <div className="hidden sm:flex flex-col items-end justify-between gap-2">
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={
                            updatingItems.has(item._id) || item.quantity <= 1
                          }
                          className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

        {/* Order Summary - Mobile Optimized */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span className="text-sm md:text-base">Subtotal</span>
                <span className="font-medium">£{subtotal.toFixed(2)}</span>
              </div>

              {savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-sm md:text-base">Savings</span>
                  <span className="font-medium">-£{savings.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Including VAT</p>
              </div>
            </div>

            {/* Delivery Info - Mobile */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Free Delivery</p>
                  <p className="text-xs text-blue-600">Orders over £50 • 3-5 business days</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              disabled={loading}
              className={`w-full py-3.5 md:py-4 rounded-lg font-semibold text-white transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#de5422] to-orange-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Free Returns</span>
                <span>30 Days</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Secure Payment</span>
                <span>SSL Encrypted</span>
              </div>
            </div>

            {/* Refresh Cart Button - Mobile */}
            <button
              onClick={fetchCart}
              className="w-full mt-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Cart
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - Mobile Optimized */}
      <AnimatePresence>
        {deleteItemId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-4 md:p-6 rounded-xl shadow-2xl max-w-sm w-full mx-2"
            >
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  Remove Item?
                </h3>
                <p className="text-sm text-gray-600 mb-4 md:mb-6">
                  Are you sure you want to remove this item from your cart?
                </p>
                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={() => setDeleteItemId(null)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
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