"use client";

import { useEffect } from "react";

/**
 * Reveals elements marked with .fade-in / .fade-in-left / .fade-in-right as
 * they scroll into view (adds .visible — transitions live in landing.css).
 */
export default function ScrollEffects() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    document
      .querySelectorAll(".fade-in, .fade-in-left, .fade-in-right")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
