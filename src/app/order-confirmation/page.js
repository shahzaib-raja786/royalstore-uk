"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function OrderConfirmationContent() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching order with ID:", orderId); // Debug log
        const res = await fetch(`/api/order/${orderId}`, {
          credentials: "include",
        });

        console.log("Order fetch response status:", res.status); // Debug log

        if (!res.ok) {
          throw new Error(`Failed to fetch order details: ${res.status}`);
        }

        const data = await res.json();
        console.log("Order fetch response data:", data); // Debug log

        // Handle different response formats
        const orderData = data.order || data;

        if (!orderData) {
          throw new Error("No order data found in response");
        }

        setOrder(orderData);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#de5422] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || "We couldn't find your order details. Please check your order confirmation email."}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Order ID: {orderId}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="bg-[#de5422] hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-4 inline-block">
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-mono font-bold text-[#de5422]">{order._id}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#de5422] to-orange-500 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="bg-white/20 p-2 rounded-lg">📦</span>
                  Order Details
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.product?.thumbnail || "/fallback.png"}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover rounded-lg border border-gray-300"
                          />
                          <div className="absolute -top-1 -right-1 bg-[#de5422] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.product?.name}
                          </h3>
                          {item.selectedCustomizations?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.selectedCustomizations.map((custom, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white px-2 py-1 rounded text-xs text-[#de5422] border border-[#de5422]/30"
                                >
                                  {custom.type}: {custom.option}
                                  {custom.extraPrice > 0 && ` (+£${custom.extraPrice})`}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            £{item.priceAtPurchase?.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#de5422]">
                        £{(item.priceAtPurchase * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>£{order.subtotal?.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-£{order.discount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between text-lg font-bold text-[#de5422]">
                        <span>Total Paid</span>
                        <span>£{order.totalPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#de5422] to-orange-500 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="bg-white/20 p-2 rounded-lg">🚚</span>
                  Shipping Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
                    <div className="text-gray-700 space-y-1">
                      <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                      <p>{order.shippingAddress?.streetAddress}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                      <p>{order.shippingAddress?.phone}</p>
                      <p>{order.shippingAddress?.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Delivery Method</h3>
                    <div className="text-gray-700">
                      <p className="font-medium">Standard Delivery</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Estimated delivery: 3-5 business days
                      </p>
                    </div>
                  </div>
                </div>
                {order.shippingAddress?.notes && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-1">Delivery Notes</h4>
                    <p className="text-amber-700 text-sm">{order.shippingAddress.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Status & Actions */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span>
                Order Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Order Placed</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Payment</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Shipping</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-medium">
                    Processing
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎯</span>
                What is Next?
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#de5422] rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p>You will receive an order confirmation email shortly</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#de5422] rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p>We will prepare your order for shipment within 24 hours</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#de5422] rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p>You will receive tracking information once shipped</p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💬</span>
                Need Help?
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-700">
                  Have questions about your order? We are here to help!
                </p>
                <div className="space-y-2">
                  <Link
                    href="/contact"
                    className="block w-full bg-[#de5422] hover:bg-orange-700 text-white text-center py-2.5 rounded-lg transition-colors font-medium"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="/orders"
                    className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2.5 rounded-lg transition-colors font-medium"
                  >
                    View All Orders
                  </Link>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="bg-gradient-to-br from-[#de5422] to-orange-500 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-3">Continue Shopping</h3>
              <p className="text-white/90 text-sm mb-4">
                Discover more amazing products in our collection
              </p>
              <Link
                href="/"
                className="block w-full bg-white text-[#de5422] hover:bg-gray-100 text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6 text-center">Order Timeline</h3>
          <div className="flex justify-between items-center relative">
            {/* Timeline line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300"></div>

            {/* Steps */}
            {[
              { status: "Order Placed", active: true, icon: "✅" },
              { status: "Processing", active: false, icon: "🔄" },
              { status: "Shipped", active: false, icon: "🚚" },
              { status: "Delivered", active: false, icon: "🏠" },
            ].map((step, index) => (
              <div key={step.status} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step.active
                  ? "bg-[#de5422] text-white"
                  : "bg-gray-300 text-gray-600"
                  }`}>
                  {step.icon}
                </div>
                <span className={`text-xs mt-2 font-medium ${step.active ? "text-[#de5422]" : "text-gray-500"
                  }`}>
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Helpful Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📧</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Email Confirmation</h4>
            <p className="text-sm text-gray-600">
              Check your inbox for order details
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📱</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Order Tracking</h4>
            <p className="text-sm text-gray-600">
              Track your order in your account
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">⏰</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Delivery Time</h4>
            <p className="text-sm text-gray-600">
              3-5 business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#de5422] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}