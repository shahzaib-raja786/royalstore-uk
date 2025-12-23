"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Form validation for step 1
  const validateStep1 = () => {
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
      if (res.ok) {
        setDiscount(data.discountAmount || 0);
        setDiscountPercentage(data.discountPercentage || 0);
        setCouponMessage(
          `🎉 Coupon applied! ${
            data.discountPercentage ? `${data.discountPercentage}% off` : ""
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

    if (!validateStep1()) {
      setCurrentStep(1);
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

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        await fetch("/api/cart", {
          method: "DELETE",
          credentials: "include",
        });

        const orderId = data.orderId || data.order?._id || data._id;

        if (orderId) {
          Router.push(`/order-confirmation?orderId=${orderId}`);
        } else {
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

  // Navigation functions
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        const firstError = Object.keys(formErrors)[0];
        document.querySelector(`[name="${firstError}"]`)?.focus();
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step indicator component
  const StepIndicator = () => {
    const steps = [
      { number: 1, label: "Billing Details" },
      { number: 2, label: "Order Summary" },
      { number: 3, label: "Payment" },
    ];

    return (
      <div className="mb-8 md:mb-12">

        {/* Steps */}
        <div className="flex justify-between md:justify-center md:gap-16 lg:gap-24">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                if (step.number === 1) {
                  setCurrentStep(1);
                } else if (step.number === 2 && currentStep > 1) {
                  setCurrentStep(2);
                } else if (step.number === 3 && currentStep > 2) {
                  setCurrentStep(3);
                }
              }}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  currentStep >= step.number
                    ? "bg-gradient-to-r from-[#de5422] to-orange-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-6 h-6 md:w-7 md:h-7" />
                ) : (
                  <span className="text-lg md:text-xl font-bold">
                    {step.number}
                  </span>
                )}
              </div>
              <span
                className={`text-sm md:text-base font-medium ${
                  currentStep >= step.number
                    ? "text-[#de5422]"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            <span className="text-gray-800">Secure</span>
            <span className="text-[#de5422]"> Checkout</span>
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Complete your purchase in 3 easy steps
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Steps Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              {/* CASE 1: Billing Details */}
              {currentStep === 1 && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#de5422] to-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Billing Details
                      </h2>
                      <p className="text-gray-600">
                        Please fill in your delivery information
                      </p>
                    </div>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300 ${
                            formErrors.firstName
                              ? "border-red-500"
                              : "border-gray-200"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300 ${
                            formErrors.lastName
                              ? "border-red-500"
                              : "border-gray-200"
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                        className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300 ${
                          formErrors.streetAddress
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                        required
                      />
                      {formErrors.streetAddress && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.streetAddress}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Town / City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="London"
                          className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300 ${
                            formErrors.city ? "border-red-500" : "border-gray-200"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Postcode *
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="SW1A 1AA"
                          className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300 ${
                            formErrors.postalCode
                              ? "border-red-500"
                              : "border-gray-200"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+44 20 7946 0958"
                          className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300 ${
                            formErrors.phone ? "border-red-500" : "border-gray-200"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300 ${
                            formErrors.email ? "border-red-500" : "border-gray-200"
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Order Notes (optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Special delivery instructions or notes about your order..."
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300 h-32"
                      ></textarea>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        checked={formData.saveAddress}
                        onChange={handleInputChange}
                        className="mt-1 w-5 h-5 text-[#de5422] border-orange-300 rounded focus:ring-[#de5422]"
                      />
                      <span className="text-gray-700 text-sm">
                        Save this address for future orders
                      </span>
                    </div>
                  </form>

                  {/* Desktop Next Button */}
                  <div className="hidden md:flex justify-end mt-8">
                    <button
                      onClick={handleNextStep}
                      className="bg-gradient-to-r from-[#de5422] to-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      Continue to Order Summary
                      <ChevronRight className="inline ml-2 w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CASE 2: Order Summary */}
              {currentStep === 2 && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#de5422] to-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Order Summary
                      </h2>
                      <p className="text-gray-600">
                        Review your items and apply discounts
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-[#de5422]/40 scrollbar-track-gray-100">
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
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#de5422]/30 transition-all duration-300"
                          >
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={product.thumbnail || "/fallback.png"}
                                alt={product.name || "Product"}
                                fill
                                className="object-cover rounded-lg border-2 border-white"
                              />
                              <div className="absolute -top-2 -right-2 bg-[#de5422] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                {item.quantity}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 truncate">
                                {product.name}
                              </p>
                              {customizations?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {customizations.map((c, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-white px-2 py-1 rounded-md text-xs text-[#de5422] border border-[#de5422]/30"
                                    >
                                      {c.type}: {c.option}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-sm text-gray-600 mt-1">
                                £{item.totalPrice?.toFixed(2)} each
                              </p>
                            </div>

                            <span className="font-bold text-[#de5422] text-lg whitespace-nowrap">
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

                  {/* Coupon Section */}
                  <div className="mb-6">
                    <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-[#de5422]/30">
                      <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                        🎫 Apply Coupon Code
                      </h3>

                      {couponMessage && (
                        <div
                          className={`mb-3 p-3 rounded-lg text-sm font-medium ${
                            couponMessage.includes("applied")
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
                          className="flex-1 border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#de5422]/20 focus:border-[#de5422] outline-none transition-all duration-300"
                        />
                        <button
                          type="submit"
                          disabled={couponLoading || !coupon.trim()}
                          className="bg-[#de5422] hover:bg-orange-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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

                      {discount > 0 && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-green-700">
                              🎉 Coupon Applied!
                            </span>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Navigation Buttons */}
                  <div className="hidden md:flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Billing
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="bg-gradient-to-r from-[#de5422] to-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      Continue to Payment
                      <ChevronRight className="inline ml-2 w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CASE 3: Payment Method */}
              {currentStep === 3 && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#de5422] to-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Payment Method
                      </h2>
                      <p className="text-gray-600">
                        Choose how you'd like to pay
                      </p>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-4 mb-8">
                    {/* Cash on Delivery */}
                    {paymentSettings.cod && (
                      <div
                        className={`p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                          selectedPaymentMethod === "cod"
                            ? "bg-gradient-to-r from-orange-50 to-amber-50 border-[#de5422] ring-2 ring-[#de5422]/30"
                            : "bg-white border-gray-200 hover:border-[#de5422]/50"
                        }`}
                        onClick={() => setSelectedPaymentMethod("cod")}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                              selectedPaymentMethod === "cod"
                                ? "border-[#de5422] bg-[#de5422]"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPaymentMethod === "cod" && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-gray-900 block mb-1">
                              Cash on Delivery
                            </span>
                            <p className="text-gray-600 text-sm">
                              Pay securely by cash or bank transfer when you receive your order
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stripe */}
                    {paymentSettings.stripe && (
                      <div
                        className={`p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                          selectedPaymentMethod === "stripe"
                            ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-500 ring-2 ring-purple-500/30"
                            : "bg-white border-gray-200 hover:border-purple-500/50"
                        }`}
                        onClick={() => setSelectedPaymentMethod("stripe")}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                              selectedPaymentMethod === "stripe"
                                ? "border-purple-500 bg-purple-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPaymentMethod === "stripe" && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-gray-900 block mb-1">
                              Credit/Debit Card (Stripe)
                            </span>
                            <p className="text-gray-600 text-sm">
                              Pay securely using your credit or debit card
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!paymentSettings.cod && !paymentSettings.stripe && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-200">
                        No payment methods available. Please contact support.
                      </div>
                    )}
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-green-200 mb-8">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Secure Checkout</p>
                      <p className="text-sm text-gray-600">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100 mb-8">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 w-5 h-5 text-[#de5422] border-orange-300 rounded focus:ring-[#de5422]"
                    />
                    <span className="text-gray-700 text-sm">
                      I have read and agree to the Terms & Conditions and Privacy Policy
                    </span>
                  </div>

                  {/* Desktop Navigation and Place Order */}
                  <div className="hidden md:flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Order Summary
                    </button>
                    
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isLoading || !cart?.items?.length}
                      className="bg-gradient-to-r from-[#de5422] to-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing Order...
                        </div>
                      ) : (
                        <>
                          Place Order - £{total.toFixed(2)}
                          <ChevronRight className="inline ml-2 w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation - Only for steps 1 and 2 */}
            {currentStep !== 3 && (
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                      currentStep === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#de5422] hover:bg-orange-50"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-[#de5422] to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all duration-300"
                  >
                    Continue
                    <ChevronRight className="inline ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary Panel */}
          <div
  className={`lg:col-span-1 ${
    currentStep === 1 ? "hidden lg:block" : ""
  }`}
>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-6">
              <div className="bg-gradient-to-r from-[#de5422] to-orange-500 p-6">
                <h3 className="text-xl font-bold text-white">
                  Order Total
                </h3>
                <p className="text-white/90 text-sm">
                  {cart?.items?.length || 0} item{cart?.items?.length !== 1 ? "s" : ""} in cart
                </p>
              </div>

              <div className="p-6">
                {/* Order Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount {discountPercentage > 0 && `(${discountPercentage}%)`}
                      </span>
                      <span className="font-semibold">-£{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-xl font-bold text-[#de5422]">
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

                {/* Current Step Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Current Step</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#de5422] text-white flex items-center justify-center font-bold">
                      {currentStep}
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        {currentStep === 1 && "Billing Details"}
                        {currentStep === 2 && "Order Summary"}
                        {currentStep === 3 && "Payment Method"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Step {currentStep} of 3
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Place Order Button - Only for step 3 */}
                {currentStep === 3 && (
                  <div className="md:hidden">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isLoading || !cart?.items?.length}
                      className="w-full bg-gradient-to-r from-[#de5422] to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        `Place Order - £${total.toFixed(2)}`
                      )}
                    </button>
                    
                    <button
                      onClick={handlePrevStep}
                      className="w-full mt-3 text-[#de5422] hover:text-orange-600 text-center py-3 font-medium"
                    >
                      ← Back to Order Summary
                    </button>
                  </div>
                )}

                {/* Need Help Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Contact our support team for assistance
                  </p>
                  <div className="text-sm text-[#de5422] hover:text-orange-600 font-medium">
                    support@example.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Padding for Fixed Navigation */}
      {currentStep !== 3 && <div className="md:hidden h-20"></div>}
    </div>
  );
}