"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#coverage", label: "Coverage" },
  { href: "/ride", label: "Ride" },
  { href: "/drive", label: "Drive" },
  { href: "/safety", label: "Safety" },
  { href: "/#contact", label: "Contact" },
];

/**
 * Top navigation for the interior marketing pages (About, Careers, Ride, …).
 * Mirrors the landing Navbar but uses real route links and stays in the solid
 * ("scrolled") style since these pages have light backgrounds and no hero.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="navbar scrolled" id="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <Image
            src="/assets/images/mapcars_logo1.png"
            alt="MapCars Logo"
            className="logo-img"
            width={88}
            height={64}
            priority
          />
        </Link>

        <ul className={`nav-links${open ? " active" : ""}`}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="site-header-auth-mobile">
            <Link href="/auth/login" className="nav-link" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </li>
        </ul>

        <div className="site-header-actions">
          <Link href="/auth/login" className="site-header-signin">
            Sign in
          </Link>
          {/* Get Started hidden for now */}
        </div>

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
