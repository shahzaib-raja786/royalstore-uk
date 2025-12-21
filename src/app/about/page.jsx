"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { FiAward, FiUsers, FiTruck, FiHeart } from "react-icons/fi";

export default function AboutPage() {
  const stats = [
    {
      number: "10K+",
      label: "Happy Customers",
      icon: <FiUsers className="text-2xl" />,
    },
    {
      number: "5+",
      label: "Years Experience",
      icon: <FiAward className="text-2xl" />,
    },
    {
      number: "UK Wide",
      label: "Delivery Coverage",
      icon: <FiTruck className="text-2xl" />,
    },
    {
      number: "24/7",
      label: "Customer Support",
      icon: <FiHeart className="text-2xl" />,
    },
  ];

  const values = [
    {
      title: "Integrity",
      desc: "We believe in transparency, honesty, and building trust with every customer.",
      icon: "🤝",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Innovation",
      desc: "We embrace creativity and modern technology to deliver smarter solutions.",
      icon: "💡",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Customer First",
      desc: "Every product and decision revolves around improving your experience.",
      icon: "❤️",
      color: "from-red-500 to-orange-500",
    },
  ];

  const teamFeatures = [
    "Expert Craftsmen",
    "Quality Assurance",
    "Eco-Friendly Materials",
    "Fast Delivery",
  ];

  const router = useRouter();

  const handleClick = () => {
    router.push("/productlisting");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 font-[Poppins]">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-[#de5422] via-[#e65c2a] to-[#ff8a4a] text-white py-24 px-6 md:px-12 overflow-hidden">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-2"
          ></motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Crafting Your
            <span className="block bg-clip-text text-gray-900">
              Perfect Space
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Discover our journey of transforming houses into homes with premium
            furniture delivered across the UK.
          </motion.p>

          {/* Animated scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/50 rounded-full mx-auto flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-white/70 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 px-6 z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-[#de5422] mb-3 flex justify-center"
                >
                  {stat.icon}
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 group-hover:text-[#de5422] transition-colors">
                  {stat.number}
                </h3>
                <p className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto py-20 px-6 md:px-12 space-y-28">
        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[#de5422] to-[#ff8a4a] bg-clip-text text-transparent mb-6 relative">
                <span className="text-gray-900">Our</span> Story
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Furniture Logistics UK was founded with a simple vision — to
                bring high-quality, stylish furniture to homes across the UK
                with ease and reliability.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                From humble beginnings in a small workshop, we've grown into a
                trusted brand that connects craftsmanship, innovation, and
                comfort, all delivered straight to your doorstep.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                {teamFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-[#de5422] rounded-full"></div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <motion.img
                src="/fallback.png"
                alt="Our Story"
                className="w-full h-96 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            
          </motion.div>
        </motion.div>

        {/* Our Mission */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <motion.img
                src="/about-mission.jpg"
                alt="Our Mission"
                className="w-full h-96 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#de5422] to-[#ff8a4a] bg-clip-text text-transparent mb-6">
              <span className="text-gray-900">Our</span> Mission
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              Our mission is to deliver furniture that blends durability,
              design, and affordability while ensuring a seamless shopping
              experience.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              We stand for sustainability, ethical craftsmanship, and customer
              satisfaction — every decision we make puts your comfort and the
              planet first.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 p-6 bg-gradient-to-r from-[#de5422]/10 to-[#ff8a4a]/10 rounded-2xl border border-[#de5422]/20"
            >
              <p className="text-gray-700 font-semibold italic">
                "Creating spaces that inspire and furniture that lasts a
                lifetime."
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#de5422] to-[#ff8a4a] bg-clip-text text-transparent mb-4">
              <span className="text-gray-900">Our Core</span>  Values
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-12">
              The principles that guide every piece we create and every customer
              we serve
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl mb-6"
                  >
                    {value.icon}
                  </motion.div>

                  <h3 className="font-bold text-xl mb-4 text-gray-800 group-hover:text-[#de5422] transition-colors">
                    {value.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed flex-grow">
                    {value.desc}
                  </p>

                  {/* Animated underline */}
                  <div className="mt-4">
                    <div className="w-12 h-1 bg-gradient-to-r from-[#de5422] to-[#ff8a4a] rounded-full mx-auto transform group-hover:w-16 transition-all duration-300"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center py-16"
        >
          <div className="bg-gradient-to-r from-[#de5422] to-[#ff8a4a] rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background pattern */}

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold mb-4"
            >
              Ready to Transform Your Space?
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl opacity-90 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of satisfied customers who've found their perfect
              furniture with us.
            </motion.p>

            <motion.button
            onClick={handleClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#de5422] cursor-pointer  px-8 py-3 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300"
            >
              Explore Our Collection
            </motion.button>
          </div>
        </motion.section>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
