"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaShippingFast, FaGem, FaTags, FaPaintBrush } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

const points = [
  {
    text: "Fast & Free Delivery in the UK",
    icon: <FaShippingFast className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10" />,
    gradient: "from-[#de5422] to-[#ff6b00]",
    bgGradient: "from-orange-50 to-amber-50",
    delay: 0.1,
  },
  {
    text: "Premium Quality Materials",
    icon: <FaGem className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10" />,
    gradient: "from-[#9c5035] to-[#6d3524]",
    bgGradient: "from-orange-50 to-amber-50",
    delay: 0.2,
  },
  {
    text: "Affordable Prices",
    icon: <FaTags className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10" />,
    gradient: "from-[#de5422] to-[#ff6b00]",
    bgGradient: "from-orange-50 to-amber-50",
    delay: 0.3,
  },
  {
    text: "Exclusive UK Designs",
    icon: <FaPaintBrush className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10" />,
    gradient: "from-[#9c5035] to-[#6d3524]",
    bgGradient: "from-orange-50 to-amber-50",
    delay: 0.4,
  },
];

export default function WhyChooseUs() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (!isMobile) return;

    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % points.length);
    }, 3500); // Change every 3.5 seconds

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isMobile, points.length]);

  // Scroll to current card
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    const cardWidth = 280; // matches w-[280px]
    const gap = 16; // gap-4 = 16px

    container.scrollTo({
      left: currentIndex * (cardWidth + gap),
      behavior: "smooth",
    });
  }, [currentIndex, isMobile]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    // Reset auto-scroll timer when user interacts
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % points.length);
      }, 3500);
    }
  };

  return (
    <section className="py-10 md:py-20 px-4 sm:px-6 text-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-10 left-5 sm:left-10 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-orange-50 to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 right-5 sm:right-10 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-l from-orange-50 to-transparent rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 mb-8 md:mb-12"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-6 h-1 bg-gradient-to-r from-[#de5422] to-[#ff6b00] rounded-full"></div>
          <span className="text-xs font-semibold text-[#de5422] uppercase tracking-wider">
            Advantages
          </span>
          <div className="w-6 h-1 bg-gradient-to-l from-[#de5422] to-[#ff6b00] rounded-full"></div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gray-900">Why Choose</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#de5422] to-[#ff6b00]">
            Us?
          </span>
        </h2>

        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2 leading-relaxed">
          Experience the perfect blend of quality, craftsmanship, and innovation
          — tailored for you.
        </p>
      </motion.div>

      {/* Mobile horizontal scroll container - Hidden scrollbar */}
      <div className={`${isMobile ? "block" : "hidden"}`}>
        <div className="relative px-2">
          {/* Horizontal scroll container - Hidden scrollbar */}
          <div
            ref={containerRef}
            className="flex overflow-x-hidden scroll-smooth gap-4 pb-4 px-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Hide scrollbar for Chrome, Safari and Opera */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {points.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: idx === currentIndex ? 1 : 0.9,
                  scale: idx === currentIndex ? 1 : 0.98,
                }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 w-[280px]"
              >
                <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center h-full">
                  {/* Icon container */}
                  <div
                    className={`relative mb-4 p-3 rounded-xl bg-gradient-to-r ${point.bgGradient}`}
                  >
                    <div className="text-[#de5422]">{point.icon}</div>

                    {/* Icon background accent */}
                    <div className="absolute inset-0 rounded-xl">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${point.gradient} opacity-20 rounded-xl`}
                      ></div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-grow">
                    <p className="font-bold text-gray-800 text-base leading-tight">
                      {point.text}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="mt-4 w-12 h-1 rounded-full overflow-hidden">
                    <div
                      className={`w-full h-full bg-gradient-to-r ${point.gradient} rounded-full`}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile dots indicator */}
          <div className="flex justify-center gap-3 mt-4">
            {points.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`relative w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-[#de5422] scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to card ${idx + 1}`}
              >
                {/* Active indicator animation */}
                {idx === currentIndex && (
                  <motion.div
                    className="absolute inset-0 border-2 border-[#de5422] rounded-full"
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0, 1],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop grid layout */}
      <div
        className={`${
          isMobile ? "hidden" : "grid"
        } grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto relative z-10 px-2`}
      >
        {points.map((point, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.03,
              y: -5,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            transition={{
              duration: 0.5,
              delay: point.delay,
            }}
            viewport={{ once: true, margin: "-50px" }}
            className="group relative"
          >
            {/* Card container */}
            <div className="relative p-6 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center border border-gray-100 group-hover:border-orange-200 h-full">
              {/* Hover shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl md:rounded-2xl"></div>

              {/* Icon container */}
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`relative mb-4 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r ${point.bgGradient} group-hover:shadow-md transition-shadow duration-300`}
              >
                <div className="text-[#de5422]">{point.icon}</div>

                {/* Icon background accent */}
                <div className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${point.gradient} opacity-20 rounded-xl md:rounded-2xl`}
                  ></div>
                </div>
              </motion.div>

              {/* Text */}
              <div className="flex-grow">
                <p className="font-bold text-gray-800 text-base md:text-lg leading-tight md:leading-relaxed group-hover:text-[#de5422] transition-colors duration-300">
                  {point.text}
                </p>
              </div>

              {/* Bottom accent line with animation */}
              <div className="mt-4 md:mt-6 w-12 h-0.5 overflow-hidden rounded-full">
                <div
                  className={`w-full h-full bg-gradient-to-r ${point.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                ></div>
              </div>
            </div>

            {/* Card background glow on hover */}
            <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${point.gradient} blur-xl rounded-xl md:rounded-2xl opacity-30`}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-8 md:mt-16"
      >
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 md:gap-4 bg-gradient-to-r from-orange-50 to-amber-50 px-5 md:px-8 py-4 md:py-6 rounded-xl md:rounded-2xl border border-orange-100">
          <span className="text-gray-700 font-medium text-sm md:text-base">
            Ready to experience the difference?
          </span>
          <Link
            href="/productlisting"
            className="inline-block px-5 md:px-6 py-2 md:py-3 
             bg-gradient-to-r from-[#de5422] to-[#ff6b00] 
             text-white font-semibold rounded-lg md:rounded-xl 
             hover:shadow-lg transition-all duration-300 
             hover:scale-105 active:scale-95"
          >
            Shop Now
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
