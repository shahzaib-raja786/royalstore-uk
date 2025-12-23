"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion"; // For enhanced animations[citation:2]
// Import a variety of Lucide icons[citation:1]
import { Sofa, TableLamp, Armchair, Warehouse, Box, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

export default function CategoryShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false); // Better approach for hydration

  // Map category names to specific icons for better visual meaning
  const categoryIconMap = {
    "Sofas": Sofa,
    "Lighting": TableLamp,
    "Chairs": Armchair,
    "Storage": Warehouse,
    "All": Box,
    // Add more mappings as needed, defaults to ShoppingBag
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        console.error("Failed to fetch categories:", data.error);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    // Handle mobile detection safely for Next.js
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced Skeleton Loader with animated icon
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto px-2">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="relative rounded-xl overflow-hidden shadow-md animate-pulse"
        >
          <div className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 flex items-center justify-center">
            {/* Animated icon during load */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Box className="w-12 h-12 text-gray-400" />
            </motion.div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-400/30 to-transparent"></div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="h-5 md:h-6 w-24 md:w-32 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header with Icon */}
        <div className="text-center mb-8 md:mb-12 px-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-3"
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 inline-flex">
              <Sparkles className="w-6 h-6 text-[#de5422]" />
            </div>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            <span className="text-gray-900">Shop by</span>{" "}
            <span className="text-[#de5422] bg-clip-text">Category</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Discover our wide range of products organized by category for easy shopping
          </p>
        </div>

        {/* Loading State */}
        {loading && <SkeletonLoader />}

        {/* Empty State with Icon */}
        {!loading && categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 md:py-12 px-4"
          >
            <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
              <Box className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
              No Categories Available
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              Check back later for new categories
            </p>
          </motion.div>
        )}

        {/* Enhanced Categories Grid with Icons */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-2">
            {categories.map((cat) => {
              // Get the appropriate icon for this category
              const IconComponent = categoryIconMap[cat.name] || ShoppingBag;
              
              return (
                <Link
                  key={cat._id}
                  href={`/productlisting?category=${encodeURIComponent(cat.name)}`}
                  className="group block"
                >
                  <motion.div
                    className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl md:hover:shadow-2xl border border-orange-100 md:border-orange-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 } 
                    }}
                  >
                    {/* Image with responsive height */}
                    <div className="relative w-full aspect-square md:h-64 overflow-hidden">
                      <motion.img
                        src={cat.image ? cat.image : "/fallback.png"}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300"></div>
                    
                    {/* Category Name with Icon */}
                    <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 text-center w-full px-3 md:px-4">
                      {/* Icon above category name */}
                      <motion.div
                        className="flex justify-center mb-2"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                          <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                      </motion.div>
                      
                      <h3 className="text-white text-lg md:text-xl font-bold mb-1 md:mb-2 drop-shadow-lg">
                        {cat.name}
                      </h3>
                      <div className="flex items-center justify-center gap-1 md:gap-2 text-white/90 text-xs md:text-sm">
                        <span>Explore Collection</span>
                        <motion.span
                          className="inline-block"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          →
                        </motion.span>
                      </div>
                    </div>

                    {/* Enhanced Product count badge */}
                    {cat.productsCount > 0 && (
                      <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm text-[#de5422] px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        <span>{cat.productsCount} {isMobile ? 'items' : 'products'}</span>
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Enhanced Call to Action */}
        {!loading && categories.length > 0 && (
          <motion.div 
            className="text-center mt-8 md:mt-12 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              href="/productlisting"
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#de5422] to-orange-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <span>View All Products</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}