"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

interface Location {
  city: string;
  landmark: string;
  img: string;
  c1: string;
  c2: string;
  hq?: boolean;
}

const HUBS: Location[] = [
  { city: "Southampton", landmark: "Ocean Village Marina", img: "southampton", c1: "#0B4566", c2: "#1A7A9E" },
  { city: "Portsmouth", landmark: "Spinnaker Tower & Gunwharf", img: "portsmouth", c1: "#0C1F3F", c2: "#1B3A6B" },
  { city: "Chichester", landmark: "Cathedral City & HQ", img: "chichester", c1: "#1E1540", c2: "#3B2770", hq: true },
  { city: "Brighton", landmark: "Royal Pavilion & Palace Pier", img: "brighton", c1: "#1A0B30", c2: "#4A1A6B" },
];

const OTHERS: Location[] = [
  { city: "Fareham", landmark: "Historic Market Town", img: "fareham", c1: "#0B3D52", c2: "#1E6B8A" },
  { city: "Gosport", landmark: "Waterfront Ferry Link", img: "gosport", c1: "#0A2E45", c2: "#155875" },
  { city: "Havant", landmark: "Gateway to the Harbours", img: "havant", c1: "#0F4465", c2: "#1E7090" },
  { city: "Bognor Regis", landmark: "Victorian Seaside Resort", img: "bognor_regis", c1: "#1A4A6B", c2: "#2A78A6" },
  { city: "Littlehampton", landmark: "River Arun Estuary", img: "littlehampton", c1: "#0B4A60", c2: "#1A7A96" },
  { city: "Goring-by-Sea", landmark: "Quiet Coastal Village", img: "goring_by_sea", c1: "#0D4258", c2: "#1B6E88" },
  { city: "Worthing", landmark: "Pier & Seafront Gardens", img: "worthing", c1: "#0C3A56", c2: "#1A6080" },
  { city: "Shoreham-by-Sea", landmark: "Working Harbour Town", img: "shoreham", c1: "#0F3D5C", c2: "#1C6585" },
  { city: "Hove", landmark: "Elegant Regency Seafront", img: "hove", c1: "#1A1A3E", c2: "#2E2E6A" },
];

const STATS = [
  { target: 13, suffix: "", label: "Launch Zones" },
  { target: 500, suffix: "+", label: "Drivers Onboarding" },
  { target: 10, suffix: "K+", label: "Waitlist Signups" },
  { target: 24, suffix: "/7", label: "Availability" },
];

const COUNTER_DURATION_MS = 2000;

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" width="16" height="16">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  );
}

function LocationCard({ loc, hub }: { loc: Location; hub?: boolean }) {
  return (
    <div
      className={`loc-card${hub ? " loc-card--hub" : ""}`}
      style={{ "--c1": loc.c1, "--c2": loc.c2 } as CSSProperties}
    >
      <div
        className="loc-card-img"
        style={{ backgroundImage: `url('/assets/images/locations/${loc.img}.png')` }}
      ></div>
      <div className="loc-card-overlay"></div>
      <span className={`loc-card-badge${loc.hq ? " hq" : ""}`}>
        {loc.hq ? "★ HQ" : "Launch Zone"}
      </span>
      <div className="loc-card-body">
        <div className="loc-card-icon">
          <PinIcon />
        </div>
        <h4 className="loc-card-city">{loc.city}</h4>
        <p className="loc-card-landmark">{loc.landmark}</p>
      </div>
    </div>
  );
}

function StatsRow() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState(() => STATS.map(() => 0));
  const animatedRef = useRef(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const animate = () => {
      const start = performance.now();
      const update = (now: number) => {
        const progress = Math.min((now - start) / COUNTER_DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValues(STATS.map((s) => Math.round(eased * s.target)));
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            animate();
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stats-row" id="stats-row" ref={rowRef}>
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className="stat-card fade-in"
          style={{ transitionDelay: `${i * 0.1}s` }}
        >
          <span className="stat-number">
            {values[i]}
            {stat.suffix}
          </span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Coverage() {
  return (
    <section className="coverage" id="coverage">
      <div className="coverage-container">
        <div className="section-header fade-in" id="coverage-header">
          <span className="section-tag">Our Coverage</span>
          <h2 className="section-title">
            Launching Across the <span className="gradient-text">South Coast</span>
          </h2>
          <p className="section-desc">
            Starting from our home in Chichester and expanding across Hampshire
            and West Sussex — from Southampton all the way to Brighton. Sign up
            now to be first in your area.
          </p>
        </div>

        <div className="loc-cards-grid">
          <div className="loc-hubs">
            {HUBS.map((loc) => (
              <LocationCard key={loc.city} loc={loc} hub />
            ))}
          </div>
          <div className="loc-others">
            {OTHERS.map((loc) => (
              <LocationCard key={loc.city} loc={loc} />
            ))}
          </div>
        </div>

        <StatsRow />
      </div>
    </section>
  );
}
