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

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="relative rounded-xl overflow-hidden shadow-md animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
          
          {/* Gradient overlay skeleton */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-400/30 to-transparent"></div>
          
          {/* Text skeleton */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="h-6 w-32 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-16 px-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">Shop by</span>{" "}
            <span className="text-[#de5422] bg-clip-text">Category</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our wide range of products organized by category for easy shopping
          </p>
        </div>

        {/* Loading State */}
        {loading && <SkeletonLoader />}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Categories Available</h3>
            <p className="text-gray-500">Check back later for new categories</p>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/productlisting?category=${encodeURIComponent(cat.name)}`}
                className="group"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-orange-200">
                  <img
                    src={cat.image ? cat.image : "/fallback.png"}
                    alt={cat.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Category Name */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center w-full px-4">
                    <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                      {cat.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-white/90 text-sm">
                      <span>Explore Collection</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>

                  {/* Product count badge */}
                  {cat.productsCount > 0 && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#de5422] px-3 py-1 rounded-full text-sm font-semibold">
                      {cat.productsCount} products
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && categories.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/productlisting"
              className="inline-flex items-center gap-2 bg-[#de5422] text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              View All Products
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}