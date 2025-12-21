"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
    notes: "",
    saveAddress: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    cod: true,
    stripe: false,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const Router = useRouter();

  // Fetch cart and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, userRes] = await Promise.all([
          fetch("/api/cart", { credentials: "include" }),
          fetch("/api/user/address", { credentials: "include" }),
        ]);

        const cartData = await cartRes.json();
        setCart(cartData);

        // Pre-fill form with saved address if available
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.shippingAddress) {
            setFormData((prev) => ({
              ...prev,
              ...userData.shippingAddress,
            }));
          }
        }

        // Fetch payment settings
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.success && settingsData.paymentMethods) {
            setPaymentSettings(settingsData.paymentMethods);
            // Set default selected method based on availability
            if (settingsData.paymentMethods.cod) {
              setSelectedPaymentMethod("cod");
            } else if (settingsData.paymentMethods.stripe) {
              setSelectedPaymentMethod("stripe");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const subtotal =
    cart?.items?.reduce(
      (acc, item) => acc + (item.totalPrice || 0) * (item.quantity || 1),
      0
    ) || 0;

  const total = Math.max(subtotal - discount, 0);

  // Form handling
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.streetAddress.trim())
      errors.streetAddress = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.postalCode.trim())
      errors.postalCode = "Postal code is required";

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Please enter a valid phone number";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced Coupon Apply Function
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!coupon.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    try {
      const basePrice = subtotal;
      const productIds = cart.items?.map((item) => item.product?._id) || [];
      const categoryIds =
        cart.items?.map((item) => item.product?.categoryId) || [];

      const res = await fetch("/api/coupon/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: coupon.trim(),
          productIds,
          categoryIds,
          basePrice,
        }),
      });

      const data = await res.json();
      console.log("Order creation response:", data);

      if (res.ok) {
        setDiscount(data.discountAmount || 0);
        setDiscountPercentage(data.discountPercentage || 0);
        setCouponMessage(
          `🎉 Coupon applied! ${data.discountPercentage ? `${data.discountPercentage}% off` : ""
          } Saved: £${data.discountAmount}`
        );
      } else {
        setCouponMessage(data.message || "Invalid coupon code");
        setDiscount(0);
        setDiscountPercentage(0);
      }
    } catch (err) {
      console.error("Coupon error:", err);
      setCouponMessage("Failed to apply coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Enhanced Place Order Function with better error handling
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(formErrors)[0];
      document.querySelector(`[name="${firstError}"]`)?.focus();
      return;
    }

    if (!cart?.items?.length) {
      alert("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      // Handle Stripe Payment
      if (selectedPaymentMethod === "stripe") {
        const res = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.items,
            email: formData.email,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data.message || data.error || "Stripe payment failed");
          setIsLoading(false);
          return;
        }

        // In future: redirect to Stripe
        // window.location.href = data.url;
        alert("Stripe session created (Mock): " + JSON.stringify(data));
        setIsLoading(false);
        return;
      }

      // Handle COD (Existing Logic)
      const orderData = {
        items: cart.items.map((item) => {
          const customizations =
            item?.selectedCustomizations?.flatMap(
              (customGroup) =>
                customGroup?.selectedCustomizations?.map((option) => ({
                  type: option?.type || "N/A",
                  option: option?.option || "N/A",
                  extraPrice: option?.extraPrice || 0,
                })) || []
            ) || [];

          return {
            product: item.product?._id,
            quantity: item.quantity,
            priceAtPurchase: item.totalPrice || 0,
            selectedCustomizations: customizations,
          };
        }),

        totalPrice: total,
        subtotal,
        discount,
        discountPercentage,
        paymentMethod: selectedPaymentMethod,
        couponCode: coupon || null,

        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          streetAddress: formData.streetAddress,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
        },

        saveAddress: formData.saveAddress,
      };

      console.log("Sending order data:", orderData); // Debug log

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      console.log("Order API response:", data); // Debug log

      if (res.ok) {
        // Clear cart
        await fetch("/api/cart", {
          method: "DELETE",
          credentials: "include",
        });

        // Check if we have an order ID
        const orderId = data.orderId || data.order?._id || data._id;
        console.log("Extracted orderId:", orderId); // Debug log

        if (orderId) {
          console.log("Order created successfully with ID:", orderId);

          // Redirect to order confirmation
          Router.push(`/order-confirmation?orderId=${orderId}`);
        } else {
          console.error("No order ID in response:", data);
          alert(
            "Order placed successfully but couldn't get order details. Please check your orders page."
          );
          Router.push("/orders");
        }
      } else {
        alert(
          data.error ||
          data.message ||
          "Failed to place order. Please try again."
        );
      }
    } catch (err) {
      console.error("Order placement error:", err);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCoupon("");
    setDiscount(0);
    setDiscountPercentage(0);
    setCouponMessage("");
  };

  return (
    <div className="min-h-screen  py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header  */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#de5422] mb-2">
            <span className="text-gray-900">Check</span>out
          </h1>
          <p className="text-gray-900">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Form (LEFT) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#de5422]">
              <div className="bg-gradient-to-r from-orange-400 to-amber-600 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="bg-white/20 p-2 rounded-lg">📝</span>
                  Billing Details
                </h2>
              </div>

              <form className="p-6 space-y-6" onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 ${formErrors.firstName
                        ? "border-red-500"
                        : "border-[#de5422]"
                        }`}
                      required
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 ${formErrors.lastName
                        ? "border-red-500"
                        : "border-[#de5422]"
                        }`}
                      required
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 ${formErrors.streetAddress
                      ? "border-red-500"
                      : "border-[#de5422]"
                      }`}
                    required
                  />
                  {formErrors.streetAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.streetAddress}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Town / City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="London"
                      className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 ${formErrors.city ? "border-red-500" : "border-[#de5422]"
                        }`}
                      required
                    />
                    {formErrors.city && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="SW1A 1AA"
                      className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 ${formErrors.postalCode
                        ? "border-red-500"
                        : "border-[#de5422]"
                        }`}
                      required
                    />
                    {formErrors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+44 20 7946 0958"
                      className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 ${formErrors.phone ? "border-red-500" : "border-[#de5422]"
                        }`}
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 ${formErrors.email ? "border-red-500" : "border-[#de5422]"
                        }`}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Order Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Special delivery instructions or notes about your order..."
                    className="w-full border border-[#de5422] rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 h-24"
                  ></textarea>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl">
                  <input
                    type="checkbox"
                    name="saveAddress"
                    checked={formData.saveAddress}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-[#de5422] border-amber-300 rounded focus:ring-[#de5422]"
                  />
                  <span className="text-gray-900">
                    Save this address for future orders
                  </span>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-5 h-5 text-[#de5422] border-amber-300 rounded focus:ring-[#de5422]"
                  />
                  <span className="text-gray-900">
                    I have read and agree to the Terms & Conditions
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !cart?.items?.length}
                  className="w-full cursor-pointer bg-gradient-to-r from-orange-400 to-amber-600 hover:from-amber-400 hover:to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Order...
                    </div>
                  ) : (
                    `Place Order - £${total.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary (RIGHT) */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#de5422]/30">
              <div className="bg-gradient-to-r from-orange-400 to-amber-600 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="bg-white/20 p-2 rounded-lg">📦</span>
                  Order Summary
                  {cart?.items?.length > 0 && (
                    <span className="bg-white/30 px-2 py-1 rounded-full text-sm ml-auto">
                      {cart.items.length} item
                      {cart.items.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[#de5422]/70 scrollbar-track-transparent">
                  {cart?.items?.length > 0 ? (
                    cart.items.map((item) => {
                      const product = item.product || {};
                      const customizations =
                        item.selectedCustomizations?.flatMap(
                          (group) => group.selectedCustomizations || []
                        );

                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-[#de5422]/20 hover:shadow-md hover:border-[#de5422]/50 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <Image
                                src={product.thumbnail || "/fallback.png"}
                                alt={product.name || "Product"}
                                fill
                                className="object-cover rounded-lg shadow-md border border-[#de5422]/30"
                              />
                              <div className="absolute -top-1 -right-1 bg-[#de5422] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                {item.quantity}
                              </div>
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-lg leading-tight">
                                {product.name}
                              </p>

                              {customizations?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {customizations.map((c, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-white px-2 py-1 rounded-md text-xs text-[#de5422] border border-[#de5422]/30 mr-2 hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 hover:text-white transition-all duration-300"
                                    >
                                      {c.type}: {c.option}
                                      {c.extraPrice > 0 &&
                                        ` (+£${c.extraPrice})`}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <p className="text-sm text-gray-600 mt-1">
                                £{item.totalPrice?.toFixed(2)} each
                              </p>
                            </div>
                          </div>

                          <span className="font-bold text-[#de5422] text-lg min-w-[80px] text-right">
                            £{(item.totalPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Your cart is empty
                    </div>
                  )}
                </div>

                {/* Enhanced Coupon Section */}
                <div className="mt-6 p-5 bg-gradient-to-r from-orange-50 to-amber-100 rounded-2xl border border-[#de5422]/30 shadow-sm">
                  <h3 className="font-semibold text-[#de5422] mb-3 flex items-center gap-2 text-lg">
                    <span>🎫</span>
                    Apply Coupon
                    {discount > 0 && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="ml-auto text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </h3>

                  {couponMessage && (
                    <div
                      className={`mb-3 p-3 rounded-lg text-sm ${couponMessage.includes("applied")
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                        }`}
                    >
                      {couponMessage}
                    </div>
                  )}

                  <form
                    onSubmit={handleApplyCoupon}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter coupon code"
                      disabled={couponLoading}
                      className="flex-1 border border-[#de5422]/40 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 placeholder:text-gray-400 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !coupon.trim()}
                      className="bg-[#de5422] hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Applying...
                        </div>
                      ) : (
                        "Apply Coupon"
                      )}
                    </button>
                  </form>
                </div>

                {/* Enhanced Totals */}
                <div className="mt-6 space-y-3 p-5 bg-white rounded-2xl shadow-md border border-[#de5422]/20">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      £{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount{" "}
                        {discountPercentage > 0 && `(${discountPercentage}%)`}
                      </span>
                      <span className="font-semibold">
                        -£{discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-[#de5422]/30 pt-3">
                    <div className="flex justify-between text-lg font-bold text-[#de5422]">
                      <span>Total</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <p className="text-sm text-green-600 text-right mt-1">
                        You saved £{discount.toFixed(2)}!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#de5422]/30">
              <div className="bg-gradient-to-r from-orange-400 to-amber-600 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="bg-white/20 p-2 rounded-lg">💳</span>
                  Payment Method
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Cash on Delivery Option */}
                {paymentSettings.cod && (
                  <div className={`bg-gradient-to-r from-orange-50 to-amber-100 border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${selectedPaymentMethod === "cod" ? "border-[#de5422]/60 ring-1 ring-[#de5422]" : "border-transparent"}`}>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={selectedPaymentMethod === "cod"}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="mt-1 w-5 h-5 text-[#de5422] border-[#de5422]/40 focus:ring-[#de5422]"
                      />
                      <div>
                        <span className="font-semibold text-[#de5422]">
                          Pay When You Receive (Cash on Delivery)
                        </span>
                        <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                          Pay securely by cash or bank transfer at the time of
                          delivery — no advance payment needed.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Stripe Option */}
                {paymentSettings.stripe && (
                  <div className={`bg-white border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${selectedPaymentMethod === "stripe" ? "border-purple-500/60 ring-1 ring-purple-500 bg-purple-50" : "border-gray-200"}`}>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={selectedPaymentMethod === "stripe"}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="mt-1 w-5 h-5 text-purple-600 border-purple-300 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-semibold text-gray-900 flex items-center gap-2">
                          Pay with Card (Stripe)
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Secure</span>
                        </span>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          Pay securely using your credit or debit card.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {!paymentSettings.cod && !paymentSettings.stripe && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
                    No payment methods available. Please contact support.
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-[#de5422]/90 mt-4">
                  <span className="text-2xl">🔒</span>
                  <span className="font-medium">
                    Secure & Encrypted Checkout
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#de5422]/30 p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">🚚</span>
                  <span className="text-sm font-medium text-[#de5422]">
                    Free Shipping
                  </span>
                  <span className="text-xs text-gray-600">
                    On orders over £50
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">↩️</span>
                  <span className="text-sm font-medium text-[#de5422]">
                    Easy Returns
                  </span>
                  <span className="text-xs text-gray-600">
                    30-day guarantee
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">🔒</span>
                  <span className="text-sm font-medium text-[#de5422]">
                    Secure Payment
                  </span>
                  <span className="text-xs text-gray-600">
                    Protected by SSL
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">📞</span>
                  <span className="text-sm font-medium text-[#de5422]">
                    24/7 Support
                  </span>
                  <span className="text-xs text-gray-600">
                    Always here to help
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
