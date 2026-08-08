"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface TownData {
  id: string;
  name: string;
  region: "West Sussex" | "Hampshire";
  tag: string;
  image: string;
  description: string;
  landmarks: string[];
}

const TOWNS: TownData[] = [
  {
    id: "chichester",
    name: "Chichester (HQ)",
    region: "West Sussex",
    tag: "Headquarters & Genesis",
    image: "/assets/images/locations/chichester.png",
    description: "Our founding home and operational headquarters, connecting the historic cathedral city with surrounding coastal villages.",
    landmarks: ["Chichester Cathedral", "Festival Theatre", "Chichester Gate"],
  },
  {
    id: "brighton",
    name: "Brighton & Hove",
    region: "West Sussex",
    tag: "Coastal Tech & Culture Hub",
    image: "/assets/images/locations/brighton.png",
    description: "Serving the vibrant seafront, nightlife quarters, and business districts with rapid-dispatch clean rides.",
    landmarks: ["Palace Pier", "The Lanes", "Brighton Station"],
  },
  {
    id: "southampton",
    name: "Southampton",
    region: "Hampshire",
    tag: "Maritime & University Gateway",
    image: "/assets/images/locations/southampton.png",
    description: "Direct airport transfers, cruise terminal pickups, and university campus connections around the clock.",
    landmarks: ["Ocean Village", "Southampton Central", "Cruise Terminals"],
  },
  {
    id: "portsmouth",
    name: "Portsmouth",
    region: "Hampshire",
    tag: "Historic Waterfront & Naval City",
    image: "/assets/images/locations/portsmouth.png",
    description: "Reliable rides across Portsea Island, Gunwharf Quays, ferry terminals, and Southsea seafront.",
    landmarks: ["Gunwharf Quays", "Historic Dockyard", "Southsea Common"],
  },
  {
    id: "worthing",
    name: "Worthing",
    region: "West Sussex",
    tag: "Coastal Promenade Hub",
    image: "/assets/images/locations/worthing.png",
    description: "Connecting Worthing seafront, town centre, and commuter corridors along the A259 and A27.",
    landmarks: ["Worthing Pier", "Marine Parade", "Connaught Theatre"],
  },
  {
    id: "bognor",
    name: "Bognor Regis",
    region: "West Sussex",
    tag: "Sunniest Coastal Resort",
    image: "/assets/images/locations/bognor_regis.png",
    description: "Dedicated resort, holiday, and local commuter services with transparent, upfront pricing year-round.",
    landmarks: ["Bognor Pier", "Hotham Park", "Seafront Esplanade"],
  },
  {
    id: "hove",
    name: "Hove",
    region: "West Sussex",
    tag: "Seaside Lawns & Cafes",
    image: "/assets/images/locations/hove.png",
    description: "Seamless travel across Hove lawns, Church Road dining quarter, and quiet residential avenues.",
    landmarks: ["Hove Lawns", "Church Road", "Hove Lagoon"],
  },
  {
    id: "fareham",
    name: "Fareham",
    region: "Hampshire",
    tag: "Market Town Corridor",
    image: "/assets/images/locations/fareham.png",
    description: "Bridging Southampton and Portsmouth with fast arterial connections and business park transfers.",
    landmarks: ["Fareham Shopping Centre", "Westbury Manor", "Cams Hall"],
  },
  {
    id: "littlehampton",
    name: "Littlehampton",
    region: "West Sussex",
    tag: "Arun River & Coast",
    image: "/assets/images/locations/littlehampton.png",
    description: "Serving the harbour, East Beach, and local communities with dependable neighborhood drivers.",
    landmarks: ["Harbour & Marina", "East Beach", "Look & Sea"],
  },
  {
    id: "gosport",
    name: "Gosport",
    region: "Hampshire",
    tag: "Peninsula & Marina Link",
    image: "/assets/images/locations/gosport.png",
    description: "Fast transfers to the Gosport ferry, marinas, and local naval heritage destinations.",
    landmarks: ["Gosport Ferry Terminal", "Premier Marina", "Submarine Museum"],
  },
  {
    id: "havant",
    name: "Havant",
    region: "Hampshire",
    tag: "Cross-County Transit Hub",
    image: "/assets/images/locations/havant.png",
    description: "Linking Hayling Island, Langstone Harbour, and main rail links with dependable local cabs.",
    landmarks: ["Havant Station", "Meridian Centre", "Langstone Harbour"],
  },
  {
    id: "shoreham",
    name: "Shoreham-by-Sea",
    region: "West Sussex",
    tag: "Harbour & Beach Community",
    image: "/assets/images/locations/shoreham.png",
    description: "Fast airport and coast connections linking Shoreham Beach, airport, and footbridge to town.",
    landmarks: ["Shoreham Beach", "Ropetackle Centre", "Brighton City Airport"],
  },
  {
    id: "goring",
    name: "Goring-by-Sea",
    region: "West Sussex",
    tag: "Gap & Beachfront Corridor",
    image: "/assets/images/locations/goring_by_sea.png",
    description: "Serving Goring Gap greensward, residential lanes, and coastal rail commutes with ease.",
    landmarks: ["Goring Gap", "Sea Lane", "Goring Station"],
  },
];

const MILESTONES = [
  {
    year: "2025",
    badge: "Genesis",
    title: "Founded in Chichester",
    desc: "MAP CARS CHI LTD was registered in England and Wales. Born out of frustration with predatory surge multipliers and indifferent national operators, our founding team set out to build a driver-friendly South Coast platform.",
    highlights: ["Chichester Headquarters established", "Local PHV operator compliance framework", "Initial founding team and driver advisory board"],
  },
  {
    year: "Early 2026",
    badge: "Fleet Growth",
    title: "500+ Driver Partner Onboarding",
    desc: "Word spread across Hampshire and West Sussex about our 85%+ driver earnings retention. Over 500 licensed, DBS-checked PHV drivers joined our founding driver registry.",
    highlights: ["85%+ fair commission guarantee", "Full vehicle compliance inspection program", "Dedicated local driver support dispatch"],
  },
  {
    year: "Mid 2026",
    badge: "Rollout",
    title: "13 Coastal Towns Network",
    desc: "Unifying the South Coast corridor from Southampton to Brighton under one seamless, app-based ride-sharing service with guaranteed upfront fares and zero mystery fees.",
    highlights: ["13 interconnected coastal hubs", "Integrated train & airport hub matching", "Live GPS trip sharing & dual SOS alerts"],
  },
  {
    year: "2027 & Beyond",
    badge: "Clean Future",
    title: "The Green Coastline Mission",
    desc: "Accelerating the transition to low-emission and electric vehicles across our coastal routes, backed by route-clustering algorithms that eliminate empty deadhead miles.",
    highlights: ["EV fleet driver incentives", "Carbon-neutral coastal dispatch targets", "Smart multi-town cross-matching"],
  },
];

const FAQS = [
  {
    q: "What makes MapCars different from Uber, Bolt, and traditional taxi firms?",
    a: "MapCars is 100% focused on the South Coast. We operate from Chichester under MAP CARS CHI LTD, meaning we are legally registered, locally compliant, and directly accountable. Unlike national apps that take up to 35% commission and gouge riders with sudden surge pricing, we provide drivers with 85%+ net earnings and riders with locked upfront prices.",
  },
  {
    q: "Where is MapCars headquartered and legally registered?",
    a: "We are proudly operated by MAP CARS CHI LTD, a company registered in England and Wales, with our operational hub situated in the historic cathedral city of Chichester, West Sussex. Our coverage spans 13 interconnected towns across West Sussex and Hampshire.",
  },
  {
    q: "How does the 85%+ Driver Promise work?",
    a: "We believe drivers are our most valuable partners. By keeping our platform lean and local, we pass the vast majority of every fare straight to the driver. This ensures our drivers are motivated, vehicles are immaculate, and service standards remain exceptionally high.",
  },
  {
    q: "How do you guarantee passenger and driver safety?",
    a: "Safety is our core foundation. Every single driver must hold a valid local authority Private Hire Vehicle (PHV) licence and undergo enhanced DBS background checks. Inside the app, riders benefit from live GPS tracking, one-tap 'Share My Ride' link sharing, and instant in-app emergency assistance.",
  },
  {
    q: "How can I join the founding rider waitlist or apply to drive?",
    a: "Riders can join our priority waitlist in under 30 seconds to receive launch alerts and exclusive founding rider credits. Licensed PHV drivers can apply through our driver onboarding portal to lock in our founding commission rate.",
  },
];

export default function AboutInteractive() {
  const [selectedRegion, setSelectedRegion] = useState<"All" | "West Sussex" | "Hampshire">("All");
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"towns" | "timeline" | "economics">("towns");

  const filteredTowns = TOWNS.filter(
    (t) => selectedRegion === "All" || t.region === selectedRegion
  );

  return (
    <div className="about-interactive-root">
      {/* Visual Navigation Pill Switcher */}
      <div className="about-nav-switcher-wrap">
        <div className="about-nav-switcher" role="tablist" aria-label="About Page Sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "towns"}
            className={`about-nav-tab ${activeTab === "towns" ? "active" : ""}`}
            onClick={() => setActiveTab("towns")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="about-tab-icon">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>13 Coastal Hubs</span>
            <span className="about-tab-badge">13 Towns</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "timeline"}
            className={`about-nav-tab ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="about-tab-icon">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Our Journey</span>
            <span className="about-tab-badge">2025–2027</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "economics"}
            className={`about-nav-tab ${activeTab === "economics" ? "active" : ""}`}
            onClick={() => setActiveTab("economics")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="about-tab-icon">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Fair Economics</span>
            <span className="about-tab-badge">85%+ Pay</span>
          </button>
        </div>
      </div>

      {/* Tab 1: 13 Coastal Towns Interactive Gallery */}
      {activeTab === "towns" && (
        <div className="about-tab-panel" role="tabpanel">
          <div className="about-panel-header">
            <div>
              <span className="sec-eyebrow">South Coast Network</span>
              <h3 className="about-panel-title">13 Connected Towns & Cities</h3>
              <p className="about-panel-desc">
                From our headquarters in Chichester to the university hubs of Southampton and seaside avenues of Brighton, MapCars connects the whole coastline under one trusted standard.
              </p>
            </div>

            {/* Region Filter Buttons */}
            <div className="about-region-filters">
              {(["All", "West Sussex", "Hampshire"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRegion(r)}
                  className={`about-filter-pill ${selectedRegion === r ? "active" : ""}`}
                >
                  {r === "All" ? "All 13 Hubs" : r}
                  <span className="filter-count">
                    {r === "All" ? TOWNS.length : TOWNS.filter((t) => t.region === r).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="about-towns-grid">
            {filteredTowns.map((town) => (
              <article key={town.id} className="about-town-card">
                <div className="about-town-media">
                  <Image
                    src={town.image}
                    alt={`${town.name} South Coast Location`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="about-town-img"
                    loading="lazy"
                  />
                  <div className="about-town-media-overlay" />
                  <span className="about-town-region-badge">{town.region}</span>
                </div>

                <div className="about-town-body">
                  <div className="about-town-top">
                    <h4 className="about-town-name">{town.name}</h4>
                    <span className="about-town-tag">{town.tag}</span>
                  </div>
                  <p className="about-town-desc">{town.description}</p>
                  
                  <div className="about-town-landmarks">
                    <span className="landmarks-label">Key Hubs:</span>
                    <div className="landmarks-list">
                      {town.landmarks.map((lm, idx) => (
                        <span key={idx} className="landmark-chip">
                          {lm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="about-towns-footer-bar">
            <div className="footer-bar-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="footer-bar-icon">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>All 13 zones operate with licensed, DBS-vetted drivers and locked upfront fares.</span>
            </div>
            <Link href="/ride" className="btn btn-ghost about-sm-btn">
              Book a ride info
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow-icon">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Timeline & Milestones Journey */}
      {activeTab === "timeline" && (
        <div className="about-tab-panel" role="tabpanel">
          <div className="about-panel-header">
            <div>
              <span className="sec-eyebrow">Our Milestones</span>
              <h3 className="about-panel-title">From Chichester Genesis to South Coast Scale</h3>
              <p className="about-panel-desc">
                How a local idea to fix broken regional transport grew into a full-scale mobility platform backed by hundreds of professional drivers.
              </p>
            </div>
          </div>

          <div className="about-timeline-layout">
            {/* Timeline Stepper */}
            <div className="about-timeline-steps">
              {MILESTONES.map((m, idx) => (
                <button
                  key={m.year}
                  type="button"
                  onClick={() => setActiveMilestone(idx)}
                  className={`about-milestone-step-btn ${activeMilestone === idx ? "active" : ""}`}
                >
                  <span className="step-indicator">
                    <span className="step-num">{idx + 1}</span>
                  </span>
                  <div className="step-text-wrap">
                    <div className="step-year">{m.year}</div>
                    <div className="step-title">{m.title}</div>
                  </div>
                  <span className="step-badge">{m.badge}</span>
                </button>
              ))}
            </div>

            {/* Active Milestone Detail Showcase */}
            <div className="about-milestone-detail-card">
              <div className="milestone-detail-header">
                <div className="milestone-badge-pill">{MILESTONES[activeMilestone].badge}</div>
                <span className="milestone-year-large">{MILESTONES[activeMilestone].year}</span>
              </div>
              <h4 className="milestone-detail-title">{MILESTONES[activeMilestone].title}</h4>
              <p className="milestone-detail-desc">{MILESTONES[activeMilestone].desc}</p>

              <div className="milestone-highlights-box">
                <h5 className="highlights-title">Key Achievements & Commitments:</h5>
                <ul className="highlights-list">
                  {MILESTONES[activeMilestone].highlights.map((h, i) => (
                    <li key={i} className="highlight-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="highlight-check">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="milestone-detail-actions">
                <Link href="/auth/signup" className="btn btn-primary">
                  Join the founding community
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow-icon">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/drive" className="btn btn-ghost">
                  Apply as founding driver
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Economics Comparison (MapCars vs Traditional / National Apps) */}
      {activeTab === "economics" && (
        <div className="about-tab-panel" role="tabpanel">
          <div className="about-panel-header">
            <div>
              <span className="sec-eyebrow">Fair Platform Economics</span>
              <h3 className="about-panel-title">Why the MapCars Model Works Better</h3>
              <p className="about-panel-desc">
                When drivers are treated with respect and fair remuneration, passenger service and vehicle safety soar. Compare our driver-first model against legacy monopolies.
              </p>
            </div>
          </div>

          <div className="about-comparison-grid">
            {/* MapCars Model Card */}
            <div className="about-compare-card highlight-card">
              <div className="compare-badge-brand">MapCars Standard</div>
              <h4 className="compare-title">85%+ Driver Retention & Locked Fares</h4>
              <p className="compare-sub">Sustainable, local, and built to empower South Coast families.</p>

              <ul className="compare-features">
                <li className="compare-item check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="comp-icon green">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <div>
                    <strong>85%+ Net Fare to Driver:</strong>
                    <span>Drivers take home the majority of every journey, paid weekly without arbitrary clawbacks.</span>
                  </div>
                </li>
                <li className="compare-item check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="comp-icon green">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <div>
                    <strong>Guaranteed Locked Fares:</strong>
                    <span>Riders see exact prices before booking. No surprise surge spikes during rain or rush hours.</span>
                  </div>
                </li>
                <li className="compare-item check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="comp-icon green">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <div>
                    <strong>Chichester Dispatch & UK Support:</strong>
                    <span>Direct phone and in-app assistance handled by real regional coordinators.</span>
                  </div>
                </li>
                <li className="compare-item check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="comp-icon green">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <div>
                    <strong>Smart Coastal Route Clustering:</strong>
                    <span>Algorithms cut deadhead miles along the A27/M27 corridors to protect driver fuel and local air.</span>
                  </div>
                </li>
              </ul>

              <div className="compare-card-cta">
                <Link href="/drive" className="btn btn-primary" style={{ width: "100%" }}>
                  Join as driver partner
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow-icon">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Legacy & National Apps Card */}
            <div className="about-compare-card legacy-card">
              <div className="compare-badge-legacy">National Conglomerates</div>
              <h4 className="compare-title">Legacy Ride-Hailing Apps</h4>
              <p className="compare-sub">Impersonal algorithms prioritizing overseas venture margins over local community well-being.</p>

              <ul className="compare-features">
                <li className="compare-item cross">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="comp-icon red">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                  <div>
                    <strong>25%–35% Platform Deductions:</strong>
                    <span>Substantial cuts leave drivers overstretched, leading to driver shortages and long waits.</span>
                  </div>
                </li>
                <li className="compare-item cross">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="comp-icon red">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                  <div>
                    <strong>Predatory Surge Multipliers:</strong>
                    <span>Fares double or triple without warning during events, bad weather, or train delays.</span>
                  </div>
                </li>
                <li className="compare-item cross">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="comp-icon red">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                  <div>
                    <strong>Overseas Robotic Chatbots:</strong>
                    <span>Frustrating automated support scripts with no regional road knowledge or accountability.</span>
                  </div>
                </li>
                <li className="compare-item cross">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="comp-icon red">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                  <div>
                    <strong>High Empty Mile Waste:</strong>
                    <span>Blind algorithmic dispatching forcing drivers to drive 20+ unpaid miles between fares.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Interactive FAQ Accordion */}
      <div className="about-faq-section">
        <div className="sec-head sec-head--center">
          <span className="sec-eyebrow">Everything You Need to Know</span>
          <h3 className="sec-title">Frequently Asked Questions</h3>
          <p className="sec-desc">
            Clear, transparent answers about our Chichester origins, safety licensing, and South Coast operations.
          </p>
        </div>

        <div className="about-faq-accordion">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`about-faq-item ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="about-faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="faq-chevron">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="about-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
