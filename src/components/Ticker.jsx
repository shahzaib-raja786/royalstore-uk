"use client";
import { useEffect, useState } from "react";

export default function TickerBar() {
  const [messages, setMessages] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/ticker");
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const list = Array.isArray(data?.items || data) ? (data.items || data) : [];
        setMessages(list);
      } catch (err) {
        console.error("Error fetching ticker:", err);
        setMessages([]);
      }
    }
    fetchData();
  }, []);

  return (
    <div
      className="relative w-full bg-black text-white overflow-hidden whitespace-nowrap z-20"
      aria-live="polite"
      aria-label="Scrolling ticker bar"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent" />

      <div
        className="animate-marquee inline-block py-2"
        style={{
          animationDuration: "45s",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {messages.map((item) => (
          <span
            key={item._id || item.message}
            className="mx-8 inline-flex items-center gap-2 text-sm sm:text-base md:text-lg font-semibold"
          >
            <span aria-hidden="true">📢</span>
            <a href={item.link || "#"} className="hover:underline">
              {item.message}
            </a>
            {item.link && (
              <span aria-hidden="true" className="opacity-80 text-xs sm:text-sm">🔗</span>
            )}
            <span aria-hidden="true" className="mx-3 opacity-40 select-none">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
