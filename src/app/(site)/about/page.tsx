import type { Metadata } from "next";
import Link from "next/link";
import AboutInteractive from "@/components/site/AboutInteractive";
import {
  CTABand,
  FeatureCard,
  PageHero,
  Section,
  SectionHead,
  StatBand,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "About Us — MapCars | South Coast Ride-Sharing Platform",
  description:
    "MapCars is operated by MAP CARS CHI LTD in Chichester, West Sussex. Connecting 13 South Coast towns with 85%+ driver retention, locked upfront fares, and 24/7 local safety.",
  openGraph: {
    title: "About MapCars — South Coast Ride-Sharing Platform",
    description:
      "Rooted in Chichester, West Sussex. Reimagining mobility across 13 South Coast towns from Southampton to Brighton with fair driver pay and locked fares.",
    url: "https://mapcars.co.uk/about",
    siteName: "MapCars",
    locale: "en_GB",
    type: "website",
  },
};

const PILLAR_ICONS = {
  driverFirst: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  lockedPricing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  safetyDBS: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  localPride: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  smartRoute: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  ),
  greenerMiles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  ),
};

export default function AboutPage() {
  return (
    <>
      {/* Dynamic Page Hero with verified credentials and interactive action buttons */}
      <PageHero
        eyebrow="Our Story & Heritage"
        title={
          <>
            Rooted in the South Coast.{" "}
            <span className="gradient-text">Built for people, not algorithms.</span>
          </>
        }
        subtitle="MapCars was founded in Chichester with a clear purpose: to give passengers dependable, fair-priced journeys and give drivers Britain's most respectful, high-retention ride-sharing platform. We're uniting 13 coastal communities from Southampton to Brighton."
        actions={
          <div className="about-hero-actions">
            <Link href="/auth/signup" className="btn btn-primary btn-icon-shift">
              Join the founding waitlist
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow-icon">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/drive" className="btn btn-ghost">
              Drive with us (85%+ pay)
            </Link>
            <Link href="#values" className="btn btn-ghost about-ghost-link">
              Explore our values ↓
            </Link>
          </div>
        }
      />

      {/* Live Status & Local Origin Split */}
      <Section>
        <div className="split">
          <div>
            <div className="about-badge-live">
              <span className="live-dot" />
              <span>Headquartered in Chichester, West Sussex</span>
            </div>
            <SectionHead
              eyebrow="Who we are"
              title="A platform with local roots & national standards"
            />
            <p className="sec-desc" style={{ marginTop: 0 }}>
              MapCars is operated by <strong>MAP CARS CHI LTD</strong> (Company Registration in England and Wales), headquartered in the cathedral city of Chichester. We are building the transport network that our region has always deserved — connecting 13 towns across Hampshire and West Sussex with the same uncompromising promise: safe rides, upfront fares, and a friendly, local face behind the wheel.
            </p>
            <p className="sec-desc">
              Unlike distant tech giants that treat drivers as anonymous numbers and passengers as surge-pricing targets, we live, drive, and raise our families right here on the South Coast. We know the coastal routes, the railway connections, the hospital runs, and the seafront corridors because this is our home.
            </p>

            <div className="about-credentials-pill-list">
              <div className="credential-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pill-check-icon">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Registered in England &amp; Wales</span>
              </div>
              <div className="credential-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pill-check-icon">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>100% PHV Licensed &amp; DBS Checked</span>
              </div>
              <div className="credential-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pill-check-icon">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Dedicated UK Local Support</span>
              </div>
            </div>
          </div>

          <div className="split-visual">
            <div className="panel about-origin-panel">
              <div className="panel-kpi-badge">Chichester HQ</div>
              <div className="panel-kpi">13 Towns</div>
              <p className="panel-p">
                Launching across the South Coast corridor — Chichester, Southampton, Portsmouth, Brighton, Hove, Worthing, Bognor Regis, Littlehampton, Fareham, Gosport, Havant, Shoreham, and Goring-by-Sea.
              </p>
              
              <div className="panel-divider" />

              <div className="panel-stats-inline">
                <div className="inline-stat">
                  <div className="inline-stat-num">85%+</div>
                  <div className="inline-stat-label">Driver Net Retention</div>
                </div>
                <div className="inline-stat">
                  <div className="inline-stat-num">&lt; 4m</div>
                  <div className="inline-stat-label">Target Dispatch Speed</div>
                </div>
                <div className="inline-stat">
                  <div className="inline-stat-num">100%</div>
                  <div className="inline-stat-label">Locked Upfront Fares</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 6 Core Value Pillars with Micro-Interactions */}
      <Section tint="1" id="values">
        <SectionHead
          center
          eyebrow="What we stand for"
          title="The six pillars behind every MapCars journey"
          desc="These aren't empty slogans — they dictate our platform commissions, algorithmic dispatch rules, safety protocols, and driver partnerships every single day."
        />
        <div className="grid grid-3">
          <FeatureCard icon={PILLAR_ICONS.driverFirst} title="85%+ Driver Net Pay">
            Drivers are the heartbeat of our platform. By offering Britain&rsquo;s most generous commission retention, we ensure drivers take home what they deserve, keeping service standards peerless.
          </FeatureCard>

          <FeatureCard icon={PILLAR_ICONS.lockedPricing} title="Zero Surge Gouging">
            The price you see when you book is the exact price you pay. No sudden 3x multiplier surprises when it starts to rain or after a concert lets out.
          </FeatureCard>

          <FeatureCard icon={PILLAR_ICONS.safetyDBS} title="Verified Safety Standards">
            Every vehicle and driver is fully licensed by local authorities, enhanced DBS-checked, and equipped with live GPS tracking and instant in-app SOS sharing.
          </FeatureCard>

          <FeatureCard icon={PILLAR_ICONS.localPride} title="Direct Local Accountability">
            Headquartered in Chichester. When you reach out to our team, you speak with real people in Hampshire and West Sussex who understand local transport needs.
          </FeatureCard>

          <FeatureCard icon={PILLAR_ICONS.smartRoute} title="Intelligent Coastal Routing">
            Our dispatch engine is tailored specifically for the South Coast road network, linking rail stations, hospital hubs, and coastal corridors efficiently.
          </FeatureCard>

          <FeatureCard icon={PILLAR_ICONS.greenerMiles} title="Greener Coastline Miles">
            Smart route clustering cuts empty deadhead miles along the A27/M27 corridors, reducing carbon footprint while protecting our seaside air.
          </FeatureCard>
        </div>
      </Section>

      {/* Dynamic Key Performance Metrics Band */}
      <Section>
        <StatBand
          items={[
            { num: "13", label: "South Coast Launch Towns" },
            { num: "500+", label: "Licensed Founding Drivers" },
            { num: "85%+", label: "Driver Earnings Retention" },
            { num: "24/7", label: "Dedicated Local Dispatch" },
          ]}
        />
      </Section>

      {/* Interactive Tabs: 13 Towns Visual Explorer, Timeline Journey, & Economics Comparison */}
      <Section tint="2">
        <AboutInteractive />
      </Section>

      {/* Executive Leadership Spotlight & UK Governance */}
      <Section>
        <div className="split split--reverse">
          <div className="split-visual">
            <div className="panel about-founder-panel">
              <div className="founder-badge">Founder &amp; CEO Spotlight</div>
              <div className="founder-name">Sheikh M A Noor</div>
              <div className="founder-role">Founder &amp; Chief Executive Officer</div>
              <div className="founder-company">MAP CARS CHI LTD • Chichester, UK</div>
              
              <blockquote className="founder-quote">
                &ldquo;We built MapCars because the South Coast was neglected by national conglomerates. Drivers were giving up a third of their earnings, while riders faced unpredictable prices and distant customer service. We are proving that a ride-sharing service can be profitable, technologically advanced, and deeply ethical all at once.&rdquo;
              </blockquote>

              <div className="founder-signature-line">
                <span className="signature-pill">MAP CARS CHI LTD</span>
                <span className="reg-pill">Registered in England &amp; Wales</span>
              </div>
            </div>
          </div>

          <div>
            <SectionHead
              eyebrow="Leadership & Vision"
              title="Driven by regional integrity & technological excellence"
            />
            <p className="sec-desc" style={{ marginTop: 0 }}>
              Our executive leadership combines deep regional roots with world-class software engineering. We believe modern mobility should foster local economic prosperity rather than siphoning wealth to offshore tech giants.
            </p>
            <p className="sec-desc">
              Every fare spent on MapCars circulates back into local families, local businesses, and regional infrastructure across West Sussex and Hampshire.
            </p>

            <div className="leadership-points">
              <div className="lead-point">
                <div className="lead-point-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <strong>Local Economic Reinvestment:</strong> Keeping 85%+ of ride revenue with local drivers who live in the South Coast community.
                </div>
              </div>

              <div className="lead-point">
                <div className="lead-point-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <strong>Uncompromising Governance:</strong> 100% compliant with UK Private Hire Vehicle legislation, council regulations, and UK GDPR privacy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* High-Converting Final CTA Band with Micro-Interactions */}
      <CTABand
        title="Be part of the South Coast mobility revolution"
        text="Join thousands of founding riders getting access to locked upfront fares, or apply to join our high-earning driver fleet."
        primary={{ href: "/auth/signup", label: "Join the founding waitlist" }}
        secondary={{ href: "/drive", label: "Apply to drive (85%+ pay)" }}
      />
    </>
  );
}
