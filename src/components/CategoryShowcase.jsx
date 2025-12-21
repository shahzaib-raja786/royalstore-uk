"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CategoryShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  // Skeleton loading component - Adjusted for mobile
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto px-2">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="relative rounded-xl overflow-hidden shadow-md animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
          
          {/* Gradient overlay skeleton */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-400/30 to-transparent"></div>
          
          {/* Text skeleton */}
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
        {/* Header - Adjusted for mobile */}
        <div className="text-center mb-8 md:mb-12 px-2">
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

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-8 md:py-12 px-4">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">📦</div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
              No Categories Available
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              Check back later for new categories
            </p>
          </div>
        )}

        {/* Categories Grid - Adjusted for mobile */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-2">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/productlisting?category=${encodeURIComponent(cat.name)}`}
                className="group block"
              >
                <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl md:hover:shadow-2xl hover:scale-[1.02] md:hover:scale-105 transition-all duration-300 cursor-pointer border border-orange-100 md:border-orange-200">
                  {/* Image with responsive height */}
                  <div className="relative w-full aspect-square md:h-64 overflow-hidden">
                    <img
                      src={cat.image ? cat.image : "/fallback.png"}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Category Name - Adjusted for mobile */}
                  <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 text-center w-full px-3 md:px-4">
                    <h3 className="text-white text-lg md:text-xl font-bold mb-1 md:mb-2 drop-shadow-lg">
                      {cat.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 md:gap-2 text-white/90 text-xs md:text-sm">
                      <span>Explore Collection</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>

                  {/* Product count badge - Smaller on mobile */}
                  {cat.productsCount > 0 && (
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm text-[#de5422] px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                      {cat.productsCount} {window.innerWidth < 768 ? 'items' : 'products'}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action - Full width on mobile */}
        {!loading && categories.length > 0 && (
          <div className="text-center mt-8 md:mt-12 px-2">
            <Link
              href="/productlisting"
              className="inline-flex items-center justify-center gap-2 bg-[#de5422] text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
            >
              <span>View All Products</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}