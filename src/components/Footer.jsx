"use client";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Linkedin, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) setIsLoggedIn(true);
    }

    // Fetch Company Profile
    fetch("/api/company-profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          setCompanyInfo(data.profile);
        }
      })
      .catch((err) => console.error("Failed to fetch company info:", err));
  }, []);

  const socialIconMap = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  return (
    <footer className="relative bg-black text-gray-200 font-[Poppins] pt-16 pb-8 overflow-hidden">
      {/* Content Grid */}
      <div className="relative container mx-auto px-6 grid lg:grid-cols-4 md:grid-cols-2 gap-12 z-10">
        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {companyInfo?.name || "Furniture Logistics UK"}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {companyInfo?.description ||
              "Premium furniture with fast & free delivery across the UK. Exclusive designs, top quality, and affordable prices."}
          </p>
          {companyInfo?.address && (
            <p className="text-sm text-gray-400 mt-4">
              {companyInfo.address}
            </p>
          )}
          {companyInfo?.phone && (
            <p className="text-sm text-gray-400 mt-2">
              {companyInfo.phone}
            </p>
          )}
          {companyInfo?.email && (
            <p className="text-sm text-gray-400 mt-1">
              {companyInfo.email}
            </p>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 relative">
            Quick Links
            <span className="absolute -bottom-1 left-0 w-20 h-[2px] bg-[#de5422]"></span>
          </h3>
          <ul className="space-y-2">
            {[
              ["Home", "/"],
              ["About", "/about"],
              ["News", "/news"],
              ["Shop", "/productlisting"],
            ].map(([name, href]) => (
              <li key={name}>
                <Link
                  href={href}
                  className="hover:text-[#de5422] transition-colors duration-200"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 relative">
            Customer Support
            <span className="absolute -bottom-1 left-0 w-20 h-[2px] bg-[#de5422]"></span>
          </h3>

          <ul className="space-y-2">
            <li>
              <Link
                href="/contact#faq"
                className="hover:text-[#de5422] transition-colors duration-200"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-[#de5422] transition-colors duration-200"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter & Socials */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 relative">
            Stay Connected
            <span className="absolute -bottom-1 left-0 w-20 h-[2px] bg-[#de5422]"></span>
          </h3>
          <p className="text-sm mb-4 text-gray-400">
            Subscribe to our newsletter for exclusive offers.
          </p>
          <form className="flex items-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 rounded-l-lg w-full text-black focus:outline-none focus:ring-1 focus:ring-[#de5422]"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-400 to-orange-600 px-4 py-2 rounded-r-lg hover:opacity-90 transition"
            >
              <Mail className="w-5 h-5 text-white" />
            </button>
          </form>

          <div className="flex gap-5 mt-6">
            {companyInfo?.socialLinks ? (
              Object.entries(companyInfo.socialLinks).map(([key, url]) => {
                if (!url) return null;
                const Icon = socialIconMap[key];
                if (!Icon) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-600 transition duration-300"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                );
              })
            ) : (
              // Fallback social icons if no API data yet
              [Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-600 transition duration-300"
                >
                  <Icon className="w-5 h-5 text-white" />
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative mt-14 border-t border-white/10 pt-4 text-center text-sm text-white z-10">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#de5422] font-semibold">
          {companyInfo?.name || "Furniture Logistics UK"}
        </span>
        . All rights reserved.
      </div>
    </footer>
  );
}
