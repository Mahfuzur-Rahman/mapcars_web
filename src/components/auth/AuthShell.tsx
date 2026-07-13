import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const POINTS = [
  {
    title: "Upfront pricing",
    desc: "See your fare before you book — it never changes mid-trip.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Verified drivers",
    desc: "Every driver is licence-checked and rated by riders.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Live tracking",
    desc: "Follow your ride in real time and share it with friends.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

/**
 * Split-screen shell for the auth screens. Left: the MapCars brand story
 * (hidden on mobile). Right: the form supplied as `children`.
 */
export default function AuthShell({
  headlineLead,
  headlineHighlight,
  tagline,
  children,
}: {
  headlineLead: string;
  headlineHighlight: string;
  tagline: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <Link href="/" className="auth-brand">
          <Image
            src="/assets/images/mapcars_logo1.png"
            alt="MapCars"
            width={130}
            height={95}
            priority
          />
        </Link>

        <div className="auth-aside-body">
          <span className="auth-kicker">
            <span className="dot" />
            South Coast ride-sharing
          </span>
          <h1 className="auth-headline">
            {headlineLead} <span className="hl">{headlineHighlight}</span>
          </h1>
          <p className="auth-tagline">{tagline}</p>

          <div className="auth-points">
            {POINTS.map((p) => (
              <div className="auth-point" key={p.title}>
                <span className="auth-point-ic">{p.icon}</span>
                <div>
                  <b>{p.title}</b>
                  <span>{p.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-aside-foot">
          <div className="auth-avatars">
            <span />
            <span />
            <span />
            <span />
          </div>
          Joining 10,000+ riders on the South Coast waitlist
        </div>
      </aside>

      <div className="auth-panel">
        <div className="auth-card">
          <Link href="/" className="auth-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back to home
          </Link>
          <Link href="/" className="auth-mobile-logo">
            <Image
              src="/assets/images/mapcars_logo1.png"
              alt="MapCars"
              width={130}
              height={95}
              priority
            />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
