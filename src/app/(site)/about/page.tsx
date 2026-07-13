import type { Metadata } from "next";
import {
  CTABand,
  FeatureCard,
  PageHero,
  Section,
  SectionHead,
  StatBand,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "About Us — MapCars",
  description:
    "MapCars is a South Coast ride-sharing platform built in Chichester — premium rides, fair pricing, and a driver community that cares.",
};

const ICONS = {
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title={
          <>
            Reimagining mobility across the{" "}
            <span className="gradient-text">South Coast</span>
          </>
        }
        subtitle="MapCars started with a simple belief: getting around your city should be effortless, affordable, and genuinely enjoyable — for riders and drivers alike. From our home in Chichester, we're building the ride-sharing platform the South Coast deserves."
      />

      <Section>
        <div className="split">
          <div>
            <SectionHead
              eyebrow="Who we are"
              title="Local roots, big ambitions"
            />
            <p className="sec-desc" style={{ marginTop: 0 }}>
              MapCars is operated by <strong>MAP CARS CHI LTD</strong>, a company
              registered in England and Wales and headquartered in the cathedral
              city of Chichester. We&rsquo;re launching across Hampshire and West
              Sussex — from Southampton to Brighton — with the same promise in
              every town: a safe ride, a fair price, and a friendly face behind
              the wheel.
            </p>
            <p className="sec-desc">
              We&rsquo;re not another faceless platform. We know these roads, these
              seafronts, and these communities — because we live here too.
            </p>
          </div>
          <div className="split-visual">
            <div className="panel">
              <div className="panel-kpi">13 towns</div>
              <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                Launching across the South Coast — Southampton, Portsmouth,
                Chichester (HQ), Brighton, Hove, Worthing and more.
              </p>
              <div className="panel-kpi">100% local</div>
              <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                Founded, built and operated on the South Coast, for the South
                Coast.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tint="1">
        <SectionHead
          center
          eyebrow="What we value"
          title="The principles behind every ride"
          desc="These aren't posters on a wall — they shape how we build the app, price the trips, and treat our driver partners."
        />
        <div className="grid grid-4">
          <FeatureCard icon={ICONS.heart} title="Community first">
            Drivers and riders are neighbours. We build features that make both
            sides of every journey better off.
          </FeatureCard>
          <FeatureCard icon={ICONS.compass} title="Transparent pricing">
            The price you see is the price you pay. No mystery surcharges, no
            fine print.
          </FeatureCard>
          <FeatureCard icon={ICONS.shield} title="Safety by design">
            Verified drivers, live trip tracking and share-my-ride are built in
            from day one, not bolted on later.
          </FeatureCard>
          <FeatureCard icon={ICONS.leaf} title="Greener miles">
            Smart matching means fewer empty miles — better for your wallet and
            the coastline we call home.
          </FeatureCard>
        </div>
      </Section>

      <Section>
        <StatBand
          items={[
            { num: "13", label: "Launch zones" },
            { num: "500+", label: "Drivers onboarding" },
            { num: "10K+", label: "Waitlist signups" },
            { num: "24/7", label: "Availability" },
          ]}
        />
      </Section>

      <Section tint="2">
        <div className="split split--reverse">
          <div className="split-visual">
            <div className="panel" style={{ background: "var(--gradient-primary)" }}>
              <div style={{ fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: "1.4rem" }}>
                Sheikh M A Noor
              </div>
              <div style={{ color: "rgba(255,255,255,0.9)" }}>Founder &amp; CEO</div>
              <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.6, marginTop: 8 }}>
                &ldquo;We&rsquo;re building the ride-sharing service we always
                wished existed here — one that treats drivers as partners and
                riders as neighbours.&rdquo;
              </p>
            </div>
          </div>
          <div>
            <SectionHead eyebrow="Leadership" title="Driven by a local mission" />
            <p className="sec-desc" style={{ marginTop: 0 }}>
              MapCars was founded to put the South Coast on the map of modern
              mobility. Our team blends deep local knowledge with a
              product-first approach — obsessing over the little details that
              make a ride feel effortless.
            </p>
          </div>
        </div>
      </Section>

      <CTABand
        title="Come along for the ride"
        text="Join the waitlist to be first in your area, or apply to drive with us and be part of the founding fleet."
        primary={{ href: "/auth/signup", label: "Join the waitlist" }}
        secondary={{ href: "/drive", label: "Drive with us" }}
      />
    </>
  );
}
