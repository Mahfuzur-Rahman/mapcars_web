"use client";

import { useState } from "react";

interface Step {
  num: string;
  title: string;
  desc: string;
  highlight: string;
  icon: React.ReactNode;
}

const RIDER_STEPS: Step[] = [
  {
    num: "01",
    title: "Request in Seconds",
    desc: "Enter your pickup location and destination. Choose your preferred ride option and see guaranteed upfront fares before booking.",
    highlight: "Upfront Fixed Pricing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Matched Instantly",
    desc: "Get paired with a vetted local driver nearby. Track their live location, estimated arrival time, and vehicle details on the map.",
    highlight: "Live Real-Time Tracking",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Enjoy & Arrive Safely",
    desc: "Hop into a clean, comfortable vehicle. Pay effortlessly via card or mobile wallet, and rate your driver when you arrive.",
    highlight: "Cashless & Secure",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
];

const DRIVER_STEPS: Step[] = [
  {
    num: "01",
    title: "Go Online Anytime",
    desc: "Set your own schedule. Open the MapCars Driver app and switch to online mode whenever you are ready to start accepting trips.",
    highlight: "100% Flexible Hours",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
        <circle cx="6.5" cy="14.5" r="1.5" />
        <circle cx="17.5" cy="14.5" r="1.5" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Accept Nearby Trips",
    desc: "Receive trip requests with clear pickup distance, fare amount, and destination upfront. Choose the rides that work best for you.",
    highlight: "Upfront Trip Details",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Earn & Get Paid Daily",
    desc: "Keep more of what you earn with our low commission rate. Cash out directly to your bank account with fast daily payouts.",
    highlight: "Low Commission Rate",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const [tab, setTab] = useState<"riders" | "drivers">("riders");
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = tab === "riders" ? RIDER_STEPS : DRIVER_STEPS;

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-container">
        <div className="section-header fade-in">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">
            Riding with MapCars is <span className="gradient-text">Simple &amp; Seamless</span>
          </h2>
          <p className="section-desc">
            Designed to make every journey smooth, transparent, and hassle-free from request to destination.
          </p>

          <div className="how-tab-switcher">
            <button
              className={`how-tab-btn${tab === "riders" ? " active" : ""}`}
              onClick={() => {
                setTab("riders");
                setActiveStep(0);
              }}
            >
              For Riders
            </button>
            <button
              className={`how-tab-btn${tab === "drivers" ? " active" : ""}`}
              onClick={() => {
                setTab("drivers");
                setActiveStep(0);
              }}
            >
              For Drivers
            </button>
          </div>
        </div>

        <div className="how-steps-grid">
          <div className="how-flow-line">
            <div
              className="how-flow-progress"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`how-step-card${i === activeStep ? " active" : ""}`}
              onMouseEnter={() => setActiveStep(i)}
              onClick={() => setActiveStep(i)}
            >
              <div className="step-card-top">
                <span className="step-num-badge">{step.num}</span>
                <div className="step-icon-wrap">{step.icon}</div>
              </div>

              <div className="step-card-content">
                <span className="step-tag-pill">{step.highlight}</span>
                <h3 className="step-card-title">{step.title}</h3>
                <p className="step-card-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
