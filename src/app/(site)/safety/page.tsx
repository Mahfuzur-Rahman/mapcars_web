import type { Metadata } from "next";
import {
  CTABand,
  FeatureCard,
  PageHero,
  Section,
  SectionHead,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Safety — MapCars",
  description:
    "Safety is built into every MapCars ride — verified drivers, live tracking, trip sharing, and 24/7 support.",
};

const BEFORE = {
  id: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M15 8h2M15 12h2M7 16h10" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3v-5l2-5h14l2 5v5h-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
};
const DURING = {
  share: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" />
    </svg>
  ),
  sos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  gps: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};
const AFTER = {
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export default function SafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Safety"
        title={
          <>
            Safety, <span className="gradient-text">designed in</span>
          </>
        }
        subtitle="We don't treat safety as a feature — it's the foundation. Here's how MapCars protects you before, during, and after every single ride."
      />

      <Section>
        <SectionHead eyebrow="Before you ride" title="Only verified drivers" />
        <div className="grid grid-2">
          <FeatureCard icon={BEFORE.id} title="Licence verification">
            Every driver&rsquo;s PHV licence and documents are checked before
            they can accept a single trip.
          </FeatureCard>
          <FeatureCard icon={BEFORE.car} title="Vehicle & driver details">
            See your driver&rsquo;s name, photo, rating, car model and number
            plate before they arrive.
          </FeatureCard>
        </div>
      </Section>

      <Section tint="1">
        <SectionHead eyebrow="During your trip" title="Help is one tap away" />
        <div className="grid grid-3">
          <FeatureCard icon={DURING.gps} title="Live GPS tracking">
            Your route is tracked the whole way, so you always know you&rsquo;re
            heading in the right direction.
          </FeatureCard>
          <FeatureCard icon={DURING.share} title="Share your trip">
            Send a live link to friends or family so they can follow along until
            you arrive safely.
          </FeatureCard>
          <FeatureCard icon={DURING.sos} title="In-app emergency">
            Reach help fast from inside the app if anything ever feels wrong on
            a journey.
          </FeatureCard>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="After you arrive" title="Accountability that lasts" />
        <div className="grid grid-2">
          <FeatureCard icon={AFTER.star} title="Two-way ratings">
            Riders and drivers rate each other after every trip, keeping the
            whole community accountable.
          </FeatureCard>
          <FeatureCard icon={AFTER.lock} title="Private by default">
            Your data is protected with strong security and never sold. Read our{" "}
            privacy policy for the full picture.
          </FeatureCard>
        </div>
      </Section>

      <CTABand
        title="Questions about safety?"
        text="Our team is here to help. Reach out any time — your peace of mind is the whole point."
        primary={{ href: "/#contact", label: "Contact us" }}
        secondary={{ href: "/legal/privacy", label: "Privacy policy" }}
      />
    </>
  );
}
