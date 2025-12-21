
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

// Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
    {[...Array(8)].map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 animate-pulse"
      >
        {/* Image Skeleton */}
        <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-200"></div>

        {/* Content Skeleton */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>

          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

// Category Skeleton
const CategorySkeleton = () => (
  <div className="space-y-3">
    {[...Array(6)].map((_, index) => (
      <div
        key={index}
        className="h-16 bg-gray-200 rounded-2xl animate-pulse"
      ></div>
    ))}
  </div>
);

import { Suspense } from "react";

// ... previous imports ...

// ... Skeleton Components ...

function ProductListingContent() {
  // ... existing component logic ...
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialQuery = searchParams.get("q");

  // ... rest of the existing logic ...

const PRODUCTS_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/productcard`;
const CATEGORIES_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category`;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setExpandedCategory(initialCategory);
    }
    if (typeof initialQuery === "string") {
      setSearchQuery(initialQuery);
    }
  }, [initialCategory, initialQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(PRODUCTS_API);
      const data = await res.json();
      setProducts(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_API);
      const data = await res.json();
      setCategories(data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredProducts = (products || []).filter((product) => {
    const matchCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;

    // Subcategory matching logic
    // If selectedSubcategory is "all", we don't filter by subcategory
    // Otherwise, we check if the product's subcategory matches
    // Note: Assuming product has a subcategory field or we need to check against category's subcategories
    // Since the product model might not have subcategory explicitly stored as a string matching the selection,
    // we might need to adjust this based on actual data structure. 
    // For now, assuming product.subcategory is a string or object with name.
    const matchSubcategory =
      selectedSubcategory === "all" ||
      product.subcategory === selectedSubcategory ||
      product.subcategory?.name === selectedSubcategory;

    const matchSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchCategory && matchSubcategory && matchSearch;
  });

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      // If clicking the same category, toggle expansion
      setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
    } else {
      // If clicking a new category, select it and expand it
      setSelectedCategory(categoryName);
      setSelectedSubcategory("all"); // Reset subcategory when changing category
      setExpandedCategory(categoryName);
    }
  };

  const handleSubcategoryClick = (subcategoryName) => {
    setSelectedSubcategory(subcategoryName);
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-900">
            Our Products
          </h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-[#de5422] text-white hover:bg-orange-700 transition-colors"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar - Mobile & Desktop */}
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          ...(typeof window !== "undefined" && window.innerWidth < 1024
            ? {
              height: isMobileMenuOpen ? "auto" : 0,
              overflow: "hidden",
            }
            : {}),
        }}
        transition={{ duration: 0.3 }}
        className={`w-full lg:w-80 bg-white p-6 shadow-sm border-r border-gray-200 lg:sticky lg:top-0 lg:h-screen z-30 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 ${isMobileMenuOpen ? "block" : "hidden lg:block"
          } `}
      >
        {/* Sidebar Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900">
              Categories
            </h2>
          </div>
          <div className="w-16 h-1 bg-[#de5422] rounded-full"></div>
        </div>

        {/* Categories List */}
        {categories.length === 0 ? (
          <CategorySkeleton />
        ) : (
          <ul className="space-y-2">
            <li
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubcategory("all");
                setExpandedCategory(null);
                setIsMobileMenuOpen(false);
              }}
              className={`cursor-pointer p-4 rounded-xl font-medium transition-all duration-200 ${selectedCategory === "all"
                ? "bg-[#de5422] text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                } `}
            >
              <span className="flex items-center space-x-3">
                <div className={`w - 8 h - 8 rounded - lg flex items - center justify - center ${selectedCategory === "all" ? "bg-white/20" : "bg-gray-200"
                  } `}>
                  <span className={selectedCategory === "all" ? "text-white" : "text-gray-600"}>📦</span>
                </div>
                <span>All Products</span>
              </span>
            </li>

            {categories.map((cat) => (
              <li key={cat._id} className="space-y-1">
                <div
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`cursor-pointer p-4 rounded-xl font-medium transition-all duration-200 flex justify-between items-center ${selectedCategory === cat.name
                    ? "bg-[#de5422] text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    } `}
                >
                  <span className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCategory === cat.name ? "bg-white/20" : "bg-gray-200"
                      } `}>
                      <span className={selectedCategory === cat.name ? "text-white" : "text-gray-600"}>🏷️</span>
                    </div>
                    <span>{cat.name}</span>
                  </span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <span className={selectedCategory === cat.name ? "text-white" : "text-gray-500"}>
                      {expandedCategory === cat.name ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  )}
                </div>

                {/* Subcategories */}
                <AnimatePresence>
                  {expandedCategory === cat.name && cat.subcategories && cat.subcategories.length > 0 && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-4 space-y-1 overflow-hidden"
                    >
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubcategoryClick("all");
                        }}
                        className={`cursor-pointer py-2 px-4 rounded-lg text-sm transition-colors ${selectedSubcategory === "all" && selectedCategory === cat.name
                          ? "text-[#de5422] font-semibold bg-orange-50"
                          : "text-gray-600 hover:text-[#de5422] hover:bg-gray-50"
                          } `}
                      >
                        All {cat.name}
                      </li>
                      {cat.subcategories.map((sub, idx) => (
                        <li
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcategoryClick(sub.name);
                          }}
                          className={`cursor-pointer py-2 px-4 rounded-lg text-sm transition-colors ${selectedSubcategory === sub.name && selectedCategory === cat.name
                            ? "text-[#de5422] font-semibold bg-orange-50"
                            : "text-gray-600 hover:text-[#de5422] hover:bg-gray-50"
                            } `}
                        >
                          {sub.name}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        )}

        {/* Sidebar Footer */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header - Desktop */}
        <div className="hidden lg:block mb-8 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Our Products
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our amazing collection of premium products crafted with excellence
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 lg:mb-8 relative max-w-2xl mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-4 pl-12 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#de5422] focus:border-[#de5422] outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
        >
          <div className="flex items-center space-x-3 flex-wrap">
            <div className="w-1 h-6 bg-[#de5422] rounded-full"></div>
            <p className="text-gray-700 font-medium">
              Showing <span className="text-[#de5422] font-semibold">{filteredProducts.length}</span> product
              {filteredProducts.length !== 1 ? "s" : ""}
              {selectedCategory !== "all" && (
                <span> in <span className="text-[#de5422] font-semibold">{selectedCategory}</span></span>
              )}
              {selectedSubcategory !== "all" && (
                <span> / <span className="text-[#de5422] font-semibold">{selectedSubcategory}</span></span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <ProductSkeleton />
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😔</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your search or browse different categories
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product, index) => (
              <Link
                href={`/productdescription/${product._id}`}
                key={product._id}
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300 group"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    {product.images?.length > 0 ? (
                      <Image
                        src={
                          product.images[0].startsWith("http")
                            ? product.images[0]
                            : "/fallback.png"
                        }
                        alt={product.name}
                        width={500}
                        height={500}
                        priority={index < 4}
                        className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Image
                        src="/fallback.png"
                        alt="No Image"
                        width={500}
                        height={500}
                        className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-[#de5422] text-white px-2 py-1 rounded-md text-xs font-medium">
                      {product.category?.name || "Uncategorized"}
                    </div>

                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#de5422] transition-colors duration-200 min-h-[3rem]">
                      {product.name}
                    </h3>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-gray-400 line-through text-sm">
                              ${product.basePrice}
                            </span>
                            <span className="text-lg font-bold text-[#de5422]">
                              $
                              {(
                                product.basePrice -
                                (product.basePrice * product.discount) / 100
                              ).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-[#de5422]">
                            ${product.basePrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-2">
                      <button className="w-full bg-[#de5422] hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium hover:scale-105 cursor-pointer">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductListingContent />
    </Suspense>
  );
}
