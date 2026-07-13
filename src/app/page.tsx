import "./landing.css";

import ApiStatus from "@/components/landing/ApiStatus";
import Contact from "@/components/landing/Contact";
import Coverage from "@/components/landing/Coverage";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import ScrollEffects from "@/components/landing/ScrollEffects";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Coverage />
      <Contact />
      <Footer />
      <ApiStatus />
      <ScrollEffects />
    </>
  );
}
