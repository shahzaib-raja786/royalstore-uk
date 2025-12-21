import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryShowcase from "@/components/CategoryShowcase";
import WhyChooseUs from "@/components/WhyChooseUs";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      
      <Navbar />
      <main className="mt-14 sm:mt-20">
        <Ticker />
        <HeroSection />
        <CategoryShowcase />
        <WhyChooseUs />
        <Footer/>
      </main>
    </>
  );
}

