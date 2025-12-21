import { Poppins, Roboto } from "next/font/google";
import "./globals.css";

import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Furniture Logistics UK | Premium Furniture Delivered Fast",
  description:
    "Shop premium furniture at affordable prices. Fast & free UK delivery, exclusive designs, and top-quality craftsmanship.",
  keywords: [
    "furniture",
    "UK furniture store",
    "premium furniture",
    "sofas",
    "tables",
    "beds",
    "chairs",
    "home decor",
  ],
  authors: [{ name: "Furniture Logistics UK" }],
  creator: "Furniture Logistics UK",
  publisher: "Furniture Logistics UK",
  openGraph: {
    title: "Furniture Logistics UK | Premium Furniture Delivered Fast",
    description:
      "Shop premium furniture at affordable prices. Fast & free UK delivery, exclusive designs, and top-quality craftsmanship.",
    url: "https://furniturelogistics.co.uk",
    siteName: "Furniture Logistics UK",
    images: [
      {
        url: "https://furniturelogistics.co.uk/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Furniture Showcase",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Furniture Logistics UK",
    description:
      "Premium furniture with fast UK delivery and affordable prices.",
    images: ["https://furniturelogistics.co.uk/og-image.jpg"],
    creator: "@yourTwitterHandle",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable} ${poppins.variable}`}>
      <body className="font-[var(--font-roboto)]" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
