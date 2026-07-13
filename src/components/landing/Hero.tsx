"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import PhoneMockup from "./PhoneMockup";

const SLIDES = [
  "/assets/images/hero-car-branded-1.png",
  "/assets/images/hero-car-branded-2.png",
  "/assets/images/hero-car-branded-3.png",
];
const SLIDE_INTERVAL_MS = 5000;

const PARTICLE_COLORS = ["#0D9488", "#2DD4BF", "#06B6D4", "#F59E0B", "#14B8A6"];

// Seeded PRNG (mulberry32) so the "random" particles are identical on the
// server and the client — avoids hydration mismatches without an effect.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const PARTICLES = Array.from({ length: 30 }, () => {
  const size = `${2 + rand() * 3}px`;
  return {
    left: `${rand() * 100}%`,
    top: `${rand() * 100}%`,
    animationDelay: `${rand() * 8}s`,
    animationDuration: `${6 + rand() * 6}s`,
    width: size,
    height: size,
    background: PARTICLE_COLORS[Math.floor(rand() * PARTICLE_COLORS.length)],
  };
});

export default function Hero() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setSlide((s) => (s + 1) % SLIDES.length),
      SLIDE_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg-slideshow" id="hero-slideshow">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`hero-bg-slide${i === slide ? " active" : ""}`}
            style={{ backgroundImage: `url('${src}')` }}
          ></div>
        ))}
      </div>
      <div className="hero-overlay"></div>

      <div className="particles" id="particles">
        {PARTICLES.map((style, i) => (
          <div key={i} className="particle" style={style}></div>
        ))}
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge" id="hero-badge">
            <span className="badge-dot"></span>
            Launching Soon
          </div>
          <h1 className="hero-title" id="hero-title">
            Coming Soon to
            <br />
            <span className="gradient-text">Your Neighbourhood</span>
          </h1>
          <p className="hero-subtitle" id="hero-subtitle">
            The future of ride-sharing is almost here. Experience premium rides,
            transparent pricing, and a driver community that cares — all in one
            app.
          </p>

          <div className="app-platforms" id="app-platforms">
            <p className="platform-label">Available on</p>
            <div className="platform-badges">
              <a href="#" className="platform-badge" aria-label="Download on App Store">
                <div className="badge-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <div className="badge-text">
                  <span className="badge-small">Download on the</span>
                  <span className="badge-big">App Store</span>
                </div>
              </a>
              <a href="#" className="platform-badge" aria-label="Get it on Google Play">
                <div className="badge-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M3.18 23.08c-.44-.27-.68-.72-.68-1.22V2.14c0-.5.24-.95.68-1.22l10.44 11.08L3.18 23.08zM14.88 13.26l2.56 2.56-11.34 6.42 8.78-8.98zM20.16 10.54c.46.26.74.74.74 1.28s-.28 1.02-.74 1.28l-2.62 1.49-2.82-2.9 2.82-2.82 2.62 1.67zM6.1 2.46l11.34 6.42-2.56 2.56L6.1 2.46z" />
                  </svg>
                </div>
                <div className="badge-text">
                  <span className="badge-small">Get it on</span>
                  <span className="badge-big">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="hero-visual" id="hero-visual">
          <div className="phone-mockup-wrapper">
            <div className="phone-glow"></div>
            <div className="hero-client-float">
              <Image
                src="/assets/images/client_img1.jpeg"
                alt="MapCars Founder"
                className="hero-client-img"
                width={230}
                height={299}
              />
              <div className="hero-client-label">Founder &amp; CEO</div>
            </div>
            <div className="css-phones">
              <PhoneMockup />
            </div>
          </div>
          <p className="platform-available-text">
            Available on <strong>iOS</strong> &amp; <strong>Android</strong>
          </p>
        </div>
      </div>

      <div className="scroll-indicator" id="scroll-indicator">
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
        <span>Scroll to explore</span>
      </div>

      <div className="slideshow-progress">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`progress-dot${i === slide ? " active" : ""}`}
            onClick={() => setSlide(i)}
          ></div>
        ))}
      </div>
    </section>
  );
}
