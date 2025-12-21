"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";

// ⭐ Star rating component
const StarRating = ({ rating }) => (
  <div className="flex items-center space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="min-h-screen bg-gray-50 mt-15">
    <Navbar />
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-3 sm:space-y-4">
            <div className="w-full aspect-square bg-gray-200 rounded-lg sm:rounded-xl animate-pulse"></div>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>

            {/* Quantity Selector Skeleton */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-3"></div>
              <div className="flex items-center max-w-xs gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Customizations Skeleton */}
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Add to Cart Button Skeleton */}
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Description & Reviews Skeleton */}
      <div className="mt-8 bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-8">
            {[1, 2].map((item) => (
              <div key={item} className="py-4 px-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [activeCustomization, setActiveCustomization] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [customizationErrors, setCustomizationErrors] = useState({});

  // ✅ Fetch product + reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProduct = await fetch(`/api/product/${id}`);
        const productData = await resProduct.json();
        const resReviews = await fetch(`/api/product/review?productId=${id}`);
        const reviewsData = await resReviews.json();

        setProduct(productData.product);
        setReviews(reviewsData.reviews || []);
        setSelectedImage(productData.product?.thumbnail);
      } catch (err) {
        console.error("Error fetching product data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // ✅ Handle customization change
  const handleCustomizationChange = (type, option) =>
    setActiveCustomization((prev) => ({ ...prev, [type]: option }));

  // ✅ Price calculation
  const calculateFinalPrice = () => {
    if (!product) return { finalPrice: 0, originalPrice: null, discount: 0 };

    let price = Number(product.basePrice) || 0;

    if (Array.isArray(product.customizations)) {
      product.customizations.forEach((c) => {
        const selected = activeCustomization[c.type];
        if (selected) {
          const opt = c.options.find((o) => o.label === selected);
          if (opt) price += Number(opt.price) || 0;
        }
      });
    }

    if (product.discount && product.discount > 0) {
      const discountAmount = (price * product.discount) / 100;
      return {
        finalPrice: (price - discountAmount) * quantity,
        originalPrice: price * quantity,
        discount: product.discount,
      };
    }

    return { finalPrice: price * quantity, originalPrice: null, discount: 0 };
  };

  const priceInfo = calculateFinalPrice();

  // ✅ Add to cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (addingToCart) return;
    setAddingToCart(true);

    try {
      // ✅ Step 1: Check Authentication
      const authRes = await fetch("/api/check-auth", {
        method: "GET",
        credentials: "include",
      });

      if (!authRes.ok) {
        toast.error("Please log in to add items to your cart.");
        setAddingToCart(false);
        setTimeout(() => (window.location.href = "/login"), 1500);
        return;
      }

      const authData = await authRes.json();
      if (!authData.authenticated) {
        toast.error("Please log in to add items to your cart.");
        setAddingToCart(false);
        setTimeout(() => (window.location.href = "/login"), 1500);
        return;
      }

      // ✅ Step 2: Validate customizations
      if (
        Array.isArray(product.customizations) &&
        product.customizations.length > 0
      ) {
        const missingOptions = product.customizations.filter(
          (c) =>
            !activeCustomization[c.type] ||
            activeCustomization[c.type].trim() === ""
        );

        if (missingOptions.length > 0) {
          const newErrors = {};
          missingOptions.forEach((c) => {
            newErrors[c.type] = true;
          });
          setCustomizationErrors(newErrors);

          toast.error(
            "Please select all customization options before adding to cart."
          );
          setAddingToCart(false);
          return;
        }
      }

      // ✅ Reset errors if everything selected
      setCustomizationErrors({});

      // ✅ Step 3: Prepare selected customizations
      const selectedCustomizationsArr = Object.entries(activeCustomization).map(
        ([type, option]) => {
          const optObj = product.customizations
            .find((c) => c.type === type)
            .options.find((o) => o.label === option);

          return { type, option, extraPrice: optObj?.price || 0 };
        }
      );

      // ✅ Step 4: Prepare payload
      const payload = {
        productId: product._id,
        quantity,
        selectedCustomizations: selectedCustomizationsArr,
        finalPrice: priceInfo.finalPrice,
        fullPrice: priceInfo.originalPrice || priceInfo.finalPrice,
      };

      // ✅ Step 5: Send to backend
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Failed to add to cart.");
        return;
      }

      toast.success(`${product.name} added to cart 🛒`);
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Something went wrong.");
    } finally {
      setAddingToCart(false);
    }
  };

  // ✅ Parse description
  let descriptionHTML = "<p>No description available.</p>";
  try {
    if (product?.description) {
      // Assuming description is now HTML string from Tiptap
      // If it's a JSON string (legacy Draft.js), it might need migration, 
      // but without draftjs-to-html we treat it as is or handle simple cases.
      // For now, we assume migration/compat is handled or new data is HTML.
      descriptionHTML = product.description;
    }
  } catch (err) {
    console.error("Description parse error:", err);
  }

  if (loading) return <ProductSkeleton />;

  if (!product)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-15">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you are looking for does not exist.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#de5422] hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 mt-15">
      <Navbar />

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md overflow-hidden border border-gray-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
            {/* ✅ Image Gallery */}
            <div className="space-y-3 sm:space-y-4">
              {/* Main Image */}
              <div
                className="relative bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden group cursor-zoom-in"
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
              >
                <motion.div
                  animate={{ scale: zoom ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full aspect-square relative"
                >
                  {selectedImage ? (
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain transition-transform duration-300"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                      <span>No Image Available</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {[product.thumbnail, ...(product.images || [])]
                  .filter((img) => img && img.trim() !== "")
                  .map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-2 rounded-lg cursor-pointer overflow-hidden transition-all duration-200 ${selectedImage === img
                        ? "border-[#de5422] ring-2 ring-[#de5422]/20"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        width={80}
                        height={80}
                        unoptimized
                        className="object-cover w-full h-full"
                        sizes="(max-width: 768px) 56px, (max-width: 1024px) 64px, 80px"
                      />
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* ✅ Product Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Title & Price */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {priceInfo.originalPrice && (
                    <span className="text-lg sm:text-xl text-gray-500 line-through">
                      £{priceInfo.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#de5422]">
                    £{priceInfo.finalPrice.toFixed(2)}
                  </span>
                  {priceInfo.discount > 0 && (
                    <span className="bg-green-100 text-green-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                      Save {priceInfo.discount}%
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantity
                </label>
                <div className="flex items-center max-w-xs gap-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    −
                  </motion.button>
                  <span className="text-lg font-bold text-gray-900 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </motion.button>
                </div>
              </div>

              {/* Customizations */}
              {Array.isArray(product.customizations) &&
                product.customizations.length > 0 && (
                  <div className="space-y-4 bg-white rounded-xl p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customization Options
                    </h3>

                    {product.customizations.map((custom) => (
                      <div
                        key={custom.type}
                        className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white transition-colors"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {custom.type}
                        </label>

                        <div className="relative">
                          <select
                            value={activeCustomization[custom.type] || ""}
                            onChange={(e) =>
                              setActiveCustomization({
                                ...activeCustomization,
                                [custom.type]: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-700 transition-colors focus:ring-2 focus:ring-[#de5422] focus:border-[#de5422] cursor-pointer ${customizationErrors[custom.type]
                              ? "border-red-500 ring-1 ring-red-400"
                              : "border-gray-300"
                              }`}
                          >
                            <option value="" className="text-gray-400">
                              Select {custom.type}
                            </option>
                            {custom.options.map((opt) => (
                              <option
                                key={opt.label}
                                value={opt.label}
                                className="text-gray-700"
                              >
                                {opt.label}{" "}
                                {opt.price > 0 ? `(+£${opt.price})` : ""}
                              </option>
                            ))}
                          </select>

                          {/* Dropdown Arrow */}
                          <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {/* Error Message */}
                        {customizationErrors[custom.type] && (
                          <p className="text-sm text-red-500 mt-1">
                            Please select a {custom.type.toLowerCase()} option.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {/* Add to Cart */}
              <motion.button
                type="submit"
                whileHover={{ scale: addingToCart ? 1 : 1.02 }}
                whileTap={{ scale: addingToCart ? 1 : 0.98 }}
                disabled={addingToCart}
                onClick={handleAddToCart}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${addingToCart
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#de5422] hover:bg-orange-700 cursor-pointer shadow-md hover:shadow-lg"
                  }`}
              >
                {addingToCart ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding to Cart...</span>
                  </div>
                ) : (
                  `Add to Cart - £${priceInfo.finalPrice.toFixed(2)}`
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ✅ Description & Reviews */}
        <div className="mt-8 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 sm:px-8">
              {["description", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
                    ? "border-[#de5422] text-[#de5422]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab === "description"
                    ? "Product Description"
                    : `Customer Reviews (${reviews.length})`}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {activeTab === "description" ? (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: descriptionHTML }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Reviews Yet
                      </h3>
                      <p className="text-gray-600">
                        Be the first to review this product!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <motion.div
                          key={review._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-[#de5422] rounded-full flex items-center justify-center text-white font-semibold">
                                {review.name?.charAt(0) || "A"}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {review.name || "Anonymous"}
                                </h4>
                                <StarRating rating={review.rating} />
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                          {review.images?.length > 0 && (
                            <div className="flex gap-3 mt-4">
                              {review.images.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="w-16 h-16 relative rounded-lg overflow-hidden border border-gray-300"
                                >
                                  <Image
                                    src={img}
                                    alt={`Review image ${idx + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
      <Footer />
    </div>
  );
}