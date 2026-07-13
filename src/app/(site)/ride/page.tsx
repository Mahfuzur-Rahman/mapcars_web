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
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Ride with Us — MapCars",
  description:
    "Book a ride across the South Coast with MapCars — upfront pricing, verified drivers, and live tracking on every trip.",
};

const F = {
  price: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
};

export default function RidePage() {
  return (
    <>
      <PageHero
        eyebrow="Ride with Us"
        title={
          <>
            Your city, <span className="gradient-text">one tap away</span>
          </>
        }
        subtitle="Premium rides across the South Coast with the price you're quoted up front, drivers you can trust, and live tracking from pickup to drop-off."
        actions={
          <>
            <Link href="/auth/signup" className="btn btn-primary">
              Join the waitlist {Icon.arrow}
            </Link>
            <Link href="/#coverage" className="btn btn-ghost">
              See coverage
            </Link>
          </>
        }
      />

      <Section>
        <SectionHead
          center
          eyebrow="Why ride with MapCars"
          title="A better way to get around"
        />
        <div className="grid grid-4">
          <FeatureCard icon={F.price} title="Upfront pricing">
            See the fare before you book. It won&rsquo;t change mid-trip — no
            surprise surge, no guesswork.
          </FeatureCard>
          <FeatureCard icon={F.pin} title="Live tracking">
            Watch your driver arrive in real time and share your trip with
            someone you trust.
          </FeatureCard>
          <FeatureCard icon={F.star} title="Rated drivers">
            Every driver is verified and rated by riders like you, so you always
            know who you&rsquo;re travelling with.
          </FeatureCard>
          <FeatureCard icon={F.card} title="Easy payment">
            Pay in the app or add credits to your wallet. Receipts land in your
            inbox automatically.
          </FeatureCard>
        </div>
      </Section>

      <Section tint="1">
        <SectionHead center eyebrow="How it works" title="Book in four taps" />
        <Steps
          items={[
            { title: "Set your trip", body: "Enter where you're going and see options and prices instantly." },
            { title: "Match a driver", body: "We pair you with the nearest verified driver heading your way." },
            { title: "Track the ride", body: "Follow your car live and share your journey with friends or family." },
            { title: "Arrive & rate", body: "Step out, pay automatically, and rate your driver in seconds." },
          ]}
        />
      </Section>

      <Section>
        <div className="split">
          <div>
            <SectionHead eyebrow="Ride options" title="A ride for every occasion" />
            <Checklist
              items={[
                <><strong>MapCars Go</strong> — smart, affordable everyday rides.</>,
                <><strong>MapCars Comfort</strong> — newer cars with extra legroom.</>,
                <><strong>MapCars XL</strong> — space for up to six when you travel as a group.</>,
                <><strong>Airport runs</strong> — fixed fares to Gatwick, Heathrow and Southampton.</>,
              ]}
            />
          </div>
          <div className="split-visual">
            <div className="panel">
              <div className="panel-kpi">£12.50</div>
              <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                Example fare, Portsmouth → Brighton. Quoted up front, locked in
                before you book.
              </p>
              <div className="panel-kpi">4 min</div>
              <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                Typical pickup time in our launch zones once we go live.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <CTABand
        title="Be first to ride"
        text="MapCars is launching across the South Coast soon. Join the waitlist and we'll let you know the moment we're live in your area."
        primary={{ href: "/auth/signup", label: "Join the waitlist" }}
        secondary={{ href: "/safety", label: "How we keep you safe" }}
      />
    </>
  );
}
