"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

export default function HeroSlider() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const router = useRouter();

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

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] md:h-[550px] lg:h-[650px] xl:h-[610px] overflow-hidden group">
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

      {/* Text Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center text-black px-4 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 drop-shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {images[current].title || "Discover Excellence"}
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl opacity-95 mb-6 md:mb-8 max-w-2xl mx-auto drop-shadow-lg leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {images[current].description ||
              "Experience the perfect blend of quality and elegance"}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <button
              onClick={() => router.push("/productlisting")}
              className="bg-[#de5422] hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 cursor-pointer text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>Explore More</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => router.push("/about")}
              className="border-2 border-white text-white hover:bg-white hover:text-[#de5422] cursor-pointer px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Learn More
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Controls Container */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
        {/* Play/Pause Button */}
        <button
          onClick={toggleAutoPlay}
          className="text-white hover:text-amber-300 transition-colors duration-200 p-1"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current
                    ? "bg-amber-400 shadow-lg"
                    : "bg-white/70 hover:bg-black"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}