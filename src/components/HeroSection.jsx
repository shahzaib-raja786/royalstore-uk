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
    }, 1200);

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
    <div className="relative w-full h-[85vh] sm:h-[90vh] md:h-[92vh] lg:h-[95vh] overflow-hidden group">
      {/* Dual Layer Overlay - Optimized for text readability */}
      <div className="absolute inset-0 z-10">
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isTransitioning ? "bg-black/70" : "bg-black/40"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
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

      {/* Centered Content Container */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Main Title - Reduced size on desktop, solid white */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 md:mb-6 leading-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              style={{
                color: "#ffffff",
                textShadow: `
                  0 4px 8px rgba(0, 0, 0, 0.6),
                  0 8px 16px rgba(0, 0, 0, 0.5),
                  0 12px 24px rgba(0, 0, 0, 0.4)
                `,
              }}
            >
              {images[current].title || "DISCOVER EXCELLENCE"}
            </motion.h1>

            {/* Subtitle - Bigger and bolder */}
            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-8 max-w-5xl mx-auto leading-snug"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              style={{
                color: "#f0f0f0",
                textShadow: `
                  0 2px 4px rgba(0, 0, 0, 0.7),
                  0 4px 8px rgba(0, 0, 0, 0.6)
                `,
              }}
            >
              {images[current].subtitle || "Where Quality Meets Innovation"}
            </motion.h2>

            {/* Description - Visible on all screens */}
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 max-w-3xl mx-auto font-medium px-2 sm:px-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              style={{
                color: "#e5e7eb",
                textShadow: `
                  0 2px 4px rgba(0, 0, 0, 0.7)
                `,
              }}
            >
              {images[current].description ||
                "Experience unparalleled quality and innovation that transforms your expectations into reality"}
            </motion.p>

            {/* CTA Buttons - Centered and responsive */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <button
                onClick={() => router.push("/productlisting")}
                className="group relative px-6 sm:px-8 md:px-10 py-3 md:py-4 
               rounded-xl md:rounded-2xl text-lg md:text-xl font-bold text-white
               bg-gradient-to-r from-[#de5422] via-[#ff6b35] to-[#ff8c42]
               hover:from-[#ff6b35] hover:to-[#ff8c42]
               transition-all duration-300 transform hover:scale-105
               flex items-center gap-3 w-full sm:w-auto justify-center
               shadow-2xl hover:shadow-3xl min-h-[56px]"
              >
                <span className="relative z-10">EXPLORE COLLECTION</span>
                <motion.div
                  animate={{
                    x: [0, 3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                </motion.div>
              </button>

              <button
                onClick={() => router.push("/about")}
                className="px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-lg md:text-xl font-bold 
               transition-all duration-300 transform hover:scale-105 w-full sm:w-auto 
               shadow-2xl backdrop-blur-md border-2 min-h-[56px]"
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  color: "#ffffff",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                LEARN MORE
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows - Visible on all screens */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 
       text-white p-3 sm:p-4 rounded-full transition-all duration-300 
       opacity-0 group-hover:opacity-100 backdrop-blur-md z-30 shadow-2xl"
        aria-label="Previous slide"
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 
       text-white p-3 sm:p-4 rounded-full transition-all duration-300 
       opacity-0 group-hover:opacity-100 backdrop-blur-md z-30 shadow-2xl"
        aria-label="Next slide"
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      </button>

      {/* Controls Container - Bottom Center */}
      <div
        className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 
       hidden md:flex items-center gap-4 backdrop-blur-md rounded-full 
       px-4 py-2 sm:px-6 sm:py-3 z-30 shadow-2xl"
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Play/Pause Button */}
        <button
          onClick={toggleAutoPlay}
          className="text-white hover:text-amber-300 transition-colors duration-200 p-1"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Dots Navigation */}
        <div className="flex gap-2 sm:gap-3">
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
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all shadow-lg ${
                  idx === current
                    ? "bg-amber-400"
                    : "bg-white/90 hover:bg-white"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

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
                className="w-10 h-16 rounded-full flex items-start justify-center p-2"
                style={{
                  border: "2px solid rgba(255, 255, 255, 0.8)",
                  background: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <motion.div
                  animate={{
                    y: [0, 28, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
                  }}
                />
              </div>
              <span
                className="text-sm font-bold mt-3 tracking-wider"
                style={{
                  color: "#ffffff",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
                }}
              >
                EXPLORE MORE
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient for better text contrast */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
    </div>
  );
}
