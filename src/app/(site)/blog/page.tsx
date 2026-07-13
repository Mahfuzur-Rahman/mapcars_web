import type { Metadata } from "next";
import {
  CTABand,
  PageHero,
  Section,
  SectionHead,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Blog — MapCars",
  description:
    "Stories, product updates and South Coast travel tips from the MapCars team.",
};

const POSTS = [
  {
    category: "Product",
    title: "How MapCars keeps your fare fair and upfront",
    excerpt:
      "A look under the hood at our transparent pricing — what goes into a quote and why the number never changes mid-trip.",
    author: "Product Team",
    date: "10 Jul 2026",
    read: "4 min read",
  },
  {
    category: "Safety",
    title: "Six ways we designed safety into every journey",
    excerpt:
      "From verified drivers to live trip sharing, here's how safety shows up before, during, and after your ride.",
    author: "Trust & Safety",
    date: "2 Jul 2026",
    read: "6 min read",
  },
  {
    category: "Community",
    title: "Meet the drivers building our founding fleet",
    excerpt:
      "We sat down with three of the first drivers to join MapCars across Portsmouth and Brighton.",
    author: "Community",
    date: "24 Jun 2026",
    read: "5 min read",
  },
  {
    category: "City guide",
    title: "A perfect day out in Chichester, car-free",
    excerpt:
      "Cathedral, harbour, and everything in between — the best way to explore our home city on four wheels you don't have to park.",
    author: "MapCars",
    date: "18 Jun 2026",
    read: "3 min read",
  },
  {
    category: "Company",
    title: "Why we're building a ride-share app on the South Coast",
    excerpt:
      "The story behind MapCars and the gap we saw in local mobility from Southampton to Brighton.",
    author: "Sheikh M A Noor",
    date: "5 Jun 2026",
    read: "7 min read",
  },
  {
    category: "Product",
    title: "Designing an app that feels good to open",
    excerpt:
      "The small interaction details that make booking a ride feel effortless — and how we sweat them.",
    author: "Design Team",
    date: "29 May 2026",
    read: "4 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="The MapCars Blog"
        title={
          <>
            Ideas from the{" "}
            <span className="gradient-text">road ahead</span>
          </>
        }
        subtitle="Product updates, safety deep-dives, driver stories and city guides — everything happening as we bring MapCars to the South Coast."
      />

      <Section>
        <SectionHead eyebrow="Latest posts" title="Fresh off the press" />
        <div className="grid grid-3">
          {POSTS.map((p) => (
            <article className="post-card" key={p.title}>
              <div className="post-thumb">
                <span>{p.category}</span>
              </div>
              <div className="post-body">
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
                <div className="post-meta">
                  {p.author} · {p.date} · {p.read}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <CTABand
        title="Never miss a post"
        text="Join the waitlist and we'll keep you in the loop with launch news and the occasional good read."
        primary={{ href: "/auth/signup", label: "Join the waitlist" }}
        secondary={{ href: "/press", label: "Press room" }}
      />
    </>
  );
}
