import "./landing.css";

import ApiStatus from "@/components/landing/ApiStatus";
import Contact from "@/components/landing/Contact";
import Coverage from "@/components/landing/Coverage";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Navbar from "@/components/landing/Navbar";
import PosterSection from "@/components/landing/PosterSection";
import ScrollEffects from "@/components/landing/ScrollEffects";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <PosterSection />
      <Coverage />
      <Contact />
      <Footer />
      <ApiStatus />
      <ScrollEffects />
    </>
  );
}

