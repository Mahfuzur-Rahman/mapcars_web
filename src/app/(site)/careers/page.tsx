import type { Metadata } from "next";
import Link from "next/link";
import {
  CTABand,
  FeatureCard,
  Icon,
  PageHero,
  Section,
  SectionHead,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Careers — MapCars",
  description:
    "Help build the South Coast's home-grown ride-sharing platform. Explore open roles at MapCars.",
};

const PERKS = {
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
};

const ROLES = [
  { title: "Senior Flutter Engineer", team: "Mobile", location: "Chichester / Remote (UK)", type: "Full-time" },
  { title: ".NET Backend Engineer", team: "Platform", location: "Chichester / Remote (UK)", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Remote (UK)", type: "Full-time" },
  { title: "Driver Operations Lead", team: "Operations", location: "Portsmouth", type: "Full-time" },
  { title: "Growth Marketing Manager", team: "Marketing", location: "Brighton / Hybrid", type: "Full-time" },
  { title: "Customer Support Specialist", team: "Support", location: "Chichester", type: "Part-time" },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={
          <>
            Build what the South Coast{" "}
            <span className="gradient-text">rides on</span>
          </>
        }
        subtitle="We're a small, fast-moving team turning a bold idea into a service thousands will use every day. If you want real ownership and visible impact, you'll feel at home here."
      />

      <Section>
        <SectionHead
          center
          eyebrow="Why MapCars"
          title="Work that actually ships"
          desc="No endless committees. You'll see your work in the hands of real riders and drivers within weeks."
        />
        <div className="grid grid-3">
          <FeatureCard icon={PERKS.rocket} title="Founding-team impact">
            Join early and shape the product, the culture and the roadmap. Your
            fingerprints will be everywhere.
          </FeatureCard>
          <FeatureCard icon={PERKS.home} title="Flexible & local">
            Remote-friendly across the UK with a real base in Chichester for the
            days you want to be in the room.
          </FeatureCard>
          <FeatureCard icon={PERKS.chart} title="Grow with us">
            Meaningful equity, a learning budget, and a company scaling fast
            enough to grow your career with it.
          </FeatureCard>
        </div>
      </Section>

      <Section tint="1">
        <SectionHead eyebrow="Open roles" title="Find your seat" />
        <div className="grid" style={{ gap: 14 }}>
          {ROLES.map((r) => (
            <div className="row-card" key={r.title}>
              <div>
                <h3>{r.title}</h3>
                <div className="row-meta">
                  {r.team} · {r.location} · {r.type}
                </div>
              </div>
              <Link href="/#contact" className="btn btn-ghost">
                Apply {Icon.arrow}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <CTABand
        title="Don't see your role?"
        text="We're always keen to meet talented people who love our mission. Tell us how you'd move MapCars forward."
        primary={{ href: "/#contact", label: "Get in touch" }}
        secondary={{ href: "/about", label: "About us" }}
      />
    </>
  );
}
