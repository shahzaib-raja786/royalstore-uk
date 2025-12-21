"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();
        const blogsData = data.news || [];
        setBlogs(blogsData);
        setFilteredBlogs(blogsData);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    let results = blogs;

    if (searchTerm) {
      results = results.filter(
        (blog) =>
          blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      results = results.filter(
        (blog) =>
          blog.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredBlogs(results);
  }, [searchTerm, selectedCategory, blogs]);

  const getSnippet = (html, maxLength = 120) => {
    if (!html) return "";
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadingTime = (content) => {
    if (!content) return "2 min read";
    const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return `${readingTime} min read`;
  };

  const categories = [
    "all",
    ...new Set(blogs.map((b) => b.category).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 font-[Poppins]">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#de5422] via-[#e65c2a] to-[#ff8a4a] text-white py-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
              backgroundSize: "100px 100px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-0 mb-6  "></div>

            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Our <span className="text-white">News</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-12 font-light max-w-2xl mx-auto leading-relaxed">
              Discover expert insights, industry trends, and valuable resources
              to help you stay informed and inspired
            </p>

            {/* Enhanced Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black h-5 w-5 z-10" />
              <input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-orange-500 rounded-xl text-black placeholder-black text-lg shadow-2xl  transition-all duration-300 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Categories */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <h3 className="text-base font-semibold text-slate-900 hidden md:block">
                Filter by Category:
              </h3>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 bg-[#de5422] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Categories
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                  {selectedCategory !== "all" ? "1" : categories.length - 1}
                </span>
              </button>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600 font-medium hidden md:block">
              Showing{" "}
              <span className="text-[#de5422] font-semibold">
                {filteredBlogs.length}
              </span>{" "}
              of <span className="font-semibold">{blogs.length}</span> articles
            </div>
          </div>

          {/* Categories - Desktop */}
          <div className="hidden md:flex flex-wrap gap-2 pb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${selectedCategory === category
                  ? "bg-[#de5422] text-white shadow-md shadow-orange-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300"
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Categories - Mobile */}
          {showMobileFilters && (
            <div className="md:hidden pb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-slate-900">
                  Select Category
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowMobileFilters(false);
                    }}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${selectedCategory === category
                      ? "bg-[#de5422] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Blog Grid */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#de5422]"></div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              No articles found
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCategory !== "all"
                ? "We couldn't find any articles matching your criteria. Try different keywords or categories."
                : "We're working on creating amazing content for you. Check back soon!"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-[#de5422] hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Show All Articles
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Enhanced Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Latest Articles
                </h2>
                <p className="text-slate-600">
                  Discover {filteredBlogs.length} article
                  {filteredBlogs.length !== 1 ? "s" : ""} to expand your
                  knowledge
                </p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
                <span className="text-sm font-medium text-slate-700">
                  {blogs.length} total articles
                </span>
              </div>
            </div>

            {/* Enhanced Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog, index) => (
                <article
                  key={blog._id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Container */}
                  {blog.image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                      {/* Category Badge */}
                      {blog.category && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/95 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-md text-xs font-medium shadow-sm">
                            {blog.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    {/* Meta Information */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
                      {blog.author && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span className="text-slate-600">{blog.author}</span>
                        </div>
                      )}
                      {blog.createdAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span className="text-slate-600">
                            {formatDate(blog.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span className="text-slate-600">
                          {getReadingTime(blog.content)}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-[#de5422] transition-colors duration-200 leading-tight">
                      {blog.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {getSnippet(blog.content, 120)}
                    </p>

                    {/* Read More Button */}
                    <Link
                      href={`/news/${blog._id}`}
                      className="inline-flex items-center gap-2 group/link text-[#de5422] hover:text-orange-700 font-medium text-sm transition-colors duration-200"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Section */}
            {filteredBlogs.length > 6 && (
              <div className="text-center mt-12">
                <button className="bg-[#de5422] hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
