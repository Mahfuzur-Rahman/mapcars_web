import type { Metadata } from "next";
import Link from "next/link";
import {
  CTABand,
  Checklist,
  FeatureCard,
  Icon,
  PageHero,
  Section,
  SectionHead,
  Steps,
  StatBand,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Drive with Us — MapCars",
  description:
    "Earn on your own schedule with MapCars. Driver-first commission, weekly pay, and full support across the South Coast.",
};

const F = {
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  route: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  ),
};

export default function DrivePage() {
  return (
    <>
      <PageHero
        eyebrow="Drive with Us"
        title={
          <>
            Drive your way, <span className="gradient-text">earn your worth</span>
          </>
        }
        subtitle="Join the MapCars founding fleet. Keep more of every fare with our driver-first commission, choose your own hours, and get paid every week."
        actions={
          <>
            <Link href="/auth/signup" className="btn btn-primary">
              Start driving {Icon.arrow}
            </Link>
            <Link href="/#contact" className="btn btn-ghost">
              Talk to our team
            </Link>
          </>
        }
      />

      <Section>
        <StatBand
          items={[
            { num: "Low", label: "Driver-first commission" },
            { num: "Weekly", label: "Payouts" },
            { num: "24/7", label: "Driver support" },
            { num: "You", label: "Set the hours" },
          ]}
        />
      </Section>

      <Section>
        <SectionHead
          center
          eyebrow="Why drive with MapCars"
          title="Built around the driver"
        />
        <div className="grid grid-4">
          <FeatureCard icon={F.wallet} title="Keep more per trip">
            Our commission is deliberately low because a fair deal for drivers
            is the whole point.
          </FeatureCard>
          <FeatureCard icon={F.clock} title="Total flexibility">
            Go online whenever it suits you. No shifts, no quotas, no penalties
            for taking a break.
          </FeatureCard>
          <FeatureCard icon={F.route} title="Smart matching">
            We route the right trips to you and cut empty miles so your time on
            the road actually pays.
          </FeatureCard>
          <FeatureCard icon={F.support} title="Real support">
            A local team you can reach any time — plus in-app help for anything
            that comes up mid-trip.
          </FeatureCard>
        </div>
      </Section>

      <Section tint="1">
        <SectionHead center eyebrow="Getting started" title="On the road in three steps" />
        <Steps
          cols={3}
          items={[
            { title: "Apply online", body: "Tell us about yourself and your vehicle. It takes about ten minutes." },
            { title: "Get verified", body: "We check your PHV licence and documents so every rider is in safe hands." },
            { title: "Go online & earn", body: "Download the MapCars Driver app, tap 'Go online', and start accepting trips." },
          ]}
        />
      </Section>

      <Section>
        <div className="split split--reverse">
          <div className="split-visual">
            <div className="panel">
              <div className="panel-kpi">Requirements</div>
              <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                Everything you need to join the founding fleet on the South
                Coast.
              </p>
            </div>
          </div>
          <div>
            <SectionHead eyebrow="What you'll need" title="The essentials" />
            <Checklist
              items={[
                <>A valid <strong>PHV (Private Hire Vehicle) licence</strong> for your local authority.</>,
                <>A licensed, insured, and roadworthy vehicle.</>,
                <>A full UK or EU driving licence.</>,
                <>The right to work in the UK and a smartphone to run the driver app.</>,
              ]}
            />
          </div>
        </div>
      </Section>

      <CTABand
        title="Ready to drive with MapCars?"
        text="Be part of the founding fleet across Southampton, Portsmouth, Chichester, Brighton and beyond."
        primary={{ href: "/auth/signup", label: "Apply to drive" }}
        secondary={{ href: "/safety", label: "Safety standards" }}
      />
    </>
  );
}
