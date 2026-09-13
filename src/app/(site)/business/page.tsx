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
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Business — MapCars",
  description:
    "MapCars for Business — one account for your team's travel across the South Coast, with centralised billing and full expense visibility.",
};

const F = {
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  receipt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  dash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
};

export default function BusinessPage() {
  return (
    <>
      <PageHero
        eyebrow="MapCars for Business"
        title={
          <>
            Team travel, <span className="gradient-text">simplified</span>
          </>
        }
        subtitle="One account for your whole team's rides across the South Coast — centralised billing, clear expense reporting, and no more chasing paper receipts."
        actions={
          <>
            <Link href="/#contact" className="btn btn-primary">
              Talk to sales {Icon.arrow}
            </Link>
            <Link href="/ride" className="btn btn-ghost">
              How rides work
            </Link>
          </>
        }
      />

      <Section>
        <SectionHead
          center
          eyebrow="Why MapCars for Business"
          title="Less admin, more moving"
        />
        <div className="grid grid-4">
          <FeatureCard icon={F.receipt} title="One monthly invoice">
            Consolidate every team ride into a single, VAT-ready statement each
            month.
          </FeatureCard>
          <FeatureCard icon={F.users} title="Manage your team">
            Add or remove customers in seconds and set who can travel, when, and
            within what budget.
          </FeatureCard>
          <FeatureCard icon={F.dash} title="Expense visibility">
            See spend by employee, department or trip — and export it straight
            into your finance tools.
          </FeatureCard>
          <FeatureCard icon={F.building} title="Local & reliable">
            A South Coast partner who knows the routes your team actually
            travels every day.
          </FeatureCard>
        </div>
      </Section>

      <Section tint="1">
        <div className="split">
          <div>
            <SectionHead eyebrow="Made for" title="Perfect for teams like yours" />
            <Checklist
              items={[
                <><strong>Client-facing teams</strong> getting to meetings on time.</>,
                <><strong>Hospitality &amp; events</strong> moving guests smoothly.</>,
                <><strong>Late-shift staff</strong> getting home safely after hours.</>,
                <><strong>Care &amp; healthcare</strong> with reliable, accountable travel.</>,
              ]}
            />
          </div>
          <div className="split-visual">
            <div className="panel">
              <div className="panel-kpi">1 account</div>
              <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                Your whole team, one dashboard, one invoice.
              </p>
              <div className="panel-kpi">0 receipts</div>
              <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                Every trip is logged automatically and reconciled for you.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <CTABand
        title="Bring MapCars to your business"
        text="We're onboarding launch partners across the South Coast now. Let's talk about what your team needs."
        primary={{ href: "/#contact", label: "Talk to sales" }}
        secondary={{ href: "/about", label: "About MapCars" }}
      />
    </>
  );
}
