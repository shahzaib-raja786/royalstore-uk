"use client";

import { motion } from "framer-motion";
import { FaShippingFast, FaGem, FaTags, FaPaintBrush } from "react-icons/fa";

const points = [
  {
    text: "Fast & Free Delivery in the UK",
    icon: <FaShippingFast className="w-10 h-10 text-[#de5422]" />,
    gradient: "from-[#ff6b00] to-[#ff2a00]",
    bgGradient: "from-[#fff3e6] to-[#ffe7d1]",
  },
  {
    text: "Premium Quality Materials",
    icon: <FaGem className="w-10 h-10 text-[#9c5035]" />,
    gradient: "from-[#9c5035] to-[#6d3524]",
    bgGradient: "from-[#f8ede9] to-[#f3e1db]",
  },
  {
    text: "Affordable Prices",
    icon: <FaTags className="w-10 h-10 text-[#de5422]" />,
    gradient: "from-[#ff6b00] to-[#ff2a00]",
    bgGradient: "from-[#fff2e6] to-[#ffe1cc]",
  },
  {
    text: "Exclusive UK Designs",
    icon: <FaPaintBrush className="w-10 h-10 text-[#9c5035]" />,
    gradient: "from-[#9c5035] to-[#6d3524]",
    bgGradient: "from-[#f8ede9] to-[#f3e1db]",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 px-6 text-center relative overflow-hidden">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#de5422] bg-clip-text ">
          <span className="text-gray-900">Why Choose</span> Us?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Experience the perfect blend of quality, craftsmanship, and innovation
          — tailored for you.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto relative z-10">
        {points.map((point, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.05,
              y: -8,
              transition: { type: "spring", stiffness: 300 },
            }}
            transition={{
              duration: 0.5,
              delay: idx * 0.1,
            }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center border border-gray-100 group-hover:border-[#ff6b00]/40 h-full">
              {/* Icon */}
              <div
                className={`mb-6 p-4 rounded-2xl bg-gradient-to-r ${point.bgGradient}`}
              >
                {point.icon}
              </div>

              {/* Text */}
              <p className="font-semibold text-gray-800 text-lg leading-relaxed group-hover:text-[#de5422] transition-colors duration-300">
                {point.text}
              </p>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r ${point.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-x-0 group-hover:scale-x-100`}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
