"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
  window.scrollTo({ top, behavior: "smooth" });
}

const LINKS = [
  { id: "hero", label: "Home" },
  { id: "coverage", label: "Coverage" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.pageYOffset > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
      <div className="nav-container">
        <a
          href="#hero"
          className="nav-logo"
          onClick={(e) => {
            e.preventDefault();
            go("hero");
          }}
        >
          <Image
            src="/assets/images/mapcars_logo1.png"
            alt="MapCars Logo"
            className="logo-img"
            width={88}
            height={64}
            priority
          />
        </a>
        <ul className={`nav-links${open ? " active" : ""}`}>
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  go(link.id);
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link href="/auth/login" className="nav-link" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </li>
        </ul>
        <Link href="/auth/signup" className="nav-cta">
          Get Started
        </Link>
        <button
          className={`mobile-toggle${open ? " active" : ""}`}
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
