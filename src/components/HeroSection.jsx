"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
    ChevronDown,
  Play,
  Pause,
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
    }, 800);

    return () => clearTimeout(timer);
  }, [current]);

  // Hide scroll indicator after 5 seconds or on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 5000);

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
      }, 6000);
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
    <div className="relative w-full h-[85vh] md:h-[85vh] lg:h-[85vh] overflow-hidden group">
      {/* Dual Layer Overlay - Optimized for text readability */}
      <div className="absolute inset-0 z-10">
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isTransitioning ? "bg-black/60" : "bg-black/35"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      </div>

      {/* Main Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={images[current]._id}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image
            src={images[current].imageUrl}
            alt={images[current].altText || "Hero Image"}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
            quality={85}
          />
        </motion.div>
      </AnimatePresence>

      {/* Centered Content Container */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Main Title - Optimized for all screens */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 md:mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{
                color: "#ffffff",
                textShadow: `
                  0 2px 4px rgba(0, 0, 0, 0.6),
                  0 4px 8px rgba(0, 0, 0, 0.5)
                `,
              }}
            >
              {images[current].title || "DISCOVER EXCELLENCE"}
            </motion.h1>

            {/* Subtitle - Better sizing for mobile */}
            <motion.h2
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                color: "#f8fafc",
                textShadow: `
                  0 1px 2px rgba(0, 0, 0, 0.7),
                  0 2px 4px rgba(0, 0, 0, 0.6)
                `,
              }}
            >
              {images[current].subtitle || "Where Quality Meets Innovation"}
            </motion.h2>

            {/* Description - Optimized for mobile */}
            <motion.p
              className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto font-medium px-2 sm:px-0 leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{
                color: "#e2e8f0",
                textShadow: `0 1px 2px rgba(0, 0, 0, 0.7)`,
              }}
            >
              {images[current].description ||
                "Experience unparalleled quality and innovation that transforms your expectations into reality"}
            </motion.p>

            {/* CTA Buttons - Optimized for mobile */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center px-2 sm:px-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <button
                onClick={() => router.push("/productlisting")}
                className="group relative px-5 sm:px-6 md:px-8 py-3 md:py-3.5 
               rounded-xl text-base sm:text-lg md:text-xl font-bold text-white
               bg-gradient-to-r from-[#de5422] via-[#e95a25] to-[#f36128]
               hover:from-[#e95a25] hover:to-[#f36128]
               transition-all duration-300 transform hover:scale-105 active:scale-95
               flex items-center gap-2 w-full sm:w-auto justify-center
               shadow-xl hover:shadow-2xl min-h-[48px] sm:min-h-[52px] overflow-hidden"
              >
                <span className="relative z-10">EXPLORE COLLECTION</span>
                <motion.div
                  animate={{
                    x: [0, 4, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>

              <button
                onClick={() => router.push("/about")}
                className="px-5 sm:px-6 md:px-8 py-3 md:py-3.5 rounded-xl text-base sm:text-lg md:text-xl font-bold 
               transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto 
               shadow-xl hover:shadow-2xl backdrop-blur-sm min-h-[48px] sm:min-h-[52px] border"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "#ffffff",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
                }}
              >
                LEARN MORE
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      {!isMobile && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 
           text-white p-3 rounded-full transition-all duration-300 
           opacity-70 group-hover:opacity-100 backdrop-blur-sm z-30 shadow-lg hover:shadow-xl"
            aria-label="Previous slide"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 
           text-white p-3 rounded-full transition-all duration-300 
           opacity-70 group-hover:opacity-100 backdrop-blur-sm z-30 shadow-lg hover:shadow-xl"
            aria-label="Next slide"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Controls Container - Bottom Center (Desktop only) */}
      <div
        className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 
       hidden md:flex items-center gap-3 backdrop-blur-sm rounded-full 
       px-3 py-2 z-30 shadow-lg"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
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
                idx === current ? "scale-110" : "scale-100 hover:scale-105"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current
                    ? "bg-amber-400 shadow-sm"
                    : "bg-white/80 hover:bg-white"
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
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30"
          >
            <motion.div
              animate={{
                y: [0, 6, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="flex flex-col items-center gap-1"
            >
              {/* Simple down arrow for scroll indicator */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <motion.div
                  animate={{
                    y: [0, 2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <span
                className="text-xs font-medium tracking-wide"
                style={{
                  color: "#ffffff",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                }}
              >
                SCROLL
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile dots indicator */}
      {isMobile && images.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5 z-30">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? "bg-white scale-100"
                  : "bg-white/50 scale-75"
              }`}
            />
          ))}
        </div>
      )}

      {/* Bottom gradient for better text contrast */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
      
      {/* Top gradient for better contrast */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent z-10" />
    </div>
  );
}