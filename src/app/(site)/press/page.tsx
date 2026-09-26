import type { Metadata } from "next";
import {
  CTABand,
  PageHero,
  Section,
  SectionHead,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Press — MapCars",
  description:
    "MapCars press room — news, announcements and media resources for the South Coast's ride-sharing platform.",
};

const RELEASES = [
  {
    date: "12 July 2026",
    tag: "Launch",
    title: "MapCars opens its South Coast waitlist ahead of autumn launch",
    excerpt:
      "Chichester-born ride-sharing platform confirms 13 launch zones from Southampton to Brighton and passes 10,000 waitlist signups.",
  },
  {
    date: "28 June 2026",
    tag: "Drivers",
    title: "500 drivers onboard as MapCars builds its founding fleet",
    excerpt:
      "The company's driver-first commission model draws strong early interest across Hampshire and West Sussex.",
  },
  {
    date: "5 June 2026",
    tag: "Company",
    title: "MapCars unveils brand and app preview at Chichester HQ",
    excerpt:
      "A first look at the customer and driver apps, both built with safety and transparent pricing at their core.",
  },
];

export default function PressPage() {
  return (
    <>
      <PageHero
        eyebrow="Press Room"
        title={
          <>
            News &amp; media from{" "}
            <span className="gradient-text">MapCars</span>
          </>
        }
        subtitle="Announcements, milestones and resources for journalists. For interviews, data or imagery, our team is happy to help."
      />

      <Section>
        <SectionHead eyebrow="Latest" title="Press releases" />
        <div className="grid" style={{ gap: 16 }}>
          {RELEASES.map((r) => (
            <article className="row-card" key={r.title} style={{ alignItems: "flex-start" }}>
              <div>
                <span className="tag-pill">{r.tag}</span>
                <h3 style={{ marginTop: 12 }}>{r.title}</h3>
                <p style={{ color: "var(--site-body)", marginTop: 6, lineHeight: 1.6 }}>
                  {r.excerpt}
                </p>
                <div className="row-meta" style={{ marginTop: 10 }}>
                  {r.date}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tint="1">
        <div className="split">
          <div>
            <SectionHead eyebrow="Media kit" title="Assets & brand guidelines" />
            <p className="sec-desc" style={{ marginTop: 0 }}>
              Logos, product screenshots, founder headshots and approved brand
              colours are available on request. Please credit &ldquo;MapCars&rdquo;
              and link back to mapcars.uk where possible.
            </p>
          </div>
          <div className="split-visual">
            <div className="doc-contact" style={{ marginTop: 0 }}>
              <p><strong>Media enquiries</strong></p>
              <p>Email: <a href="mailto:info@mapcars.uk">info@mapcars.uk</a></p>
              <p>Phone: <a href="tel:+441243252255">01243 252255</a></p>
              <p style={{ marginBottom: 0 }}>
                Based in Chichester, United Kingdom
              </p>
            </div>
          </div>
        </div>
      </Section>

      <CTABand
        title="Writing about MapCars?"
        text="Reach out and we'll get you what you need — quotes, data points, or a chat with the founding team."
        primary={{ href: "/#contact", label: "Contact the team" }}
        secondary={{ href: "/about", label: "Our story" }}
      />
    </>
  );
}
