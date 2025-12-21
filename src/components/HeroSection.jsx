"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

export default function HeroSlider() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle transition state
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1200); // Match this with your animation duration

    return () => clearTimeout(timer);
  }, [current]);

  // Hide scroll indicator after 5 seconds or on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 20000);

    const handleScroll = () => {
      setShowScrollIndicator(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/hero");
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const text = await res.text();
        if (!text) return;

        const data = JSON.parse(text);
        setImages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load hero images:", err);
      }
    }

    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images, isAutoPlaying]);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index) => {
    setCurrent(index);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying);
  }, [isAutoPlaying]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[90vh] sm:h-[400px] md:h-[550px] lg:h-[650px] xl:h-[610px] overflow-hidden group">
      {/* Dual Layer Overlay - Always visible for text readability */}
      <div className="absolute inset-0 z-10">
        {/* Solid semi-transparent overlay for text contrast */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isTransitioning ? "bg-black/60" : "bg-black/30"
          }`}
        />

        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Main Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={images[current]._id}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image
            src={images[current].imageUrl}
            alt={images[current].altText || "Hero Image"}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Text Overlay - Enhanced for visibility */}
      <div className="absolute inset-0 flex items-end md:items-center z-20 pb-96 md:pb-0">
        <motion.div
          className="text-center px-4 sm:px-6 w-full max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Tagline with enhanced contrast */}
          <motion.div
            className="inline-block mb-4 md:mb-6 px-4 py-2 rounded-full 
             bg-gradient-to-br from-orange-600 to-amber-600 
             shadow-xl backdrop-blur-md border border-white/20"
          >
            <span className="text-white font-bold text-sm md:text-base tracking-wide">
              {images[current].tagline || "Premium Collection"}
            </span>
          </motion.div>

          {/* Title with enhanced shadow and contrast */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 leading-tight"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            style={{
              color: "#ffffff",
              textShadow: `
                0 2px 4px rgba(0, 0, 0, 0.5),
                0 4px 8px rgba(0, 0, 0, 0.4),
                0 8px 16px rgba(0, 0, 0, 0.3)
              `,
            }}
          >
            {images[current].title || "Discover Excellence"}
          </motion.h1>

          {/* Description with enhanced readability */}
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed font-medium px-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            style={{
              color: "#f8fafc", // Slightly off-white for better readability
              textShadow: `
                0 1px 2px rgba(0, 0, 0, 0.6),
                0 2px 4px rgba(0, 0, 0, 0.5)
              `,
            }}
          >
            {images[current].description ||
              "Experience the perfect blend of quality and elegance"}
          </motion.p>

          {/* Buttons with enhanced visibility */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <button
              onClick={() => router.push("/productlisting")}
              className="group relative cursor-pointer px-6 md:px-8 py-3 md:py-4 
             rounded-xl text-base md:text-lg font-bold text-white
             bg-[#de5422]
             transition-all duration-300 transform hover:scale-105
             flex items-center gap-2 w-full sm:w-auto justify-center
             overflow-hidden shadow-2xl"
            >
              <span className="relative z-10">Shop Now</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </button>

            <button
              onClick={() => router.push("/about")}
              className="cursor-pointer px-5 md:px-6 py-2.5 md:py-3.5 rounded-xl text-base md:text-lg font-bold transition-all duration-300 transform hover:scale-105 w-full sm:w-auto shadow-xl backdrop-blur-sm"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "2px solid rgba(255, 255, 255, 0.6)",
                color: "#ffffff",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
              }}
            >
              Discover More
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, shown on hover for desktop */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-30 hidden md:block shadow-lg"
        aria-label="Previous slide"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-30 hidden md:block shadow-lg"
        aria-label="Next slide"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Controls Container - Only show on desktop */}
      {!isMobile && (
        <div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 backdrop-blur-sm rounded-full px-4 py-2 z-30 shadow-xl"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Play/Pause Button */}
          <button
            onClick={toggleAutoPlay}
            className="text-white hover:text-amber-300 transition-colors duration-200 p-1"
            aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          {/* Dots Navigation */}
          <div className="flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`relative transition-all duration-300 ${
                  idx === current ? "scale-125" : "scale-100 hover:scale-110"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all shadow-md ${
                    idx === current
                      ? "bg-amber-400"
                      : "bg-white/80 hover:bg-white"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scroll Indicator - Only on mobile */}
      <AnimatePresence>
        {showScrollIndicator && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
          >
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="flex flex-col items-center"
            >
              <div
                className="w-8 h-14 rounded-full flex items-start justify-center p-1"
                style={{
                  border: "2px solid rgba(255, 255, 255, 0.8)",
                  background: "rgba(0, 0, 0, 0.3)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <motion.div
                  animate={{
                    y: [0, 24, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
                  }}
                />
              </div>
              <span
                className="text-xs font-bold mt-2 tracking-wider"
                style={{
                  color: "#ffffff",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.7)",
                }}
              >
                SWIPE UP
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient for mobile */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-10 md:hidden" />
    </div>
  );
}
