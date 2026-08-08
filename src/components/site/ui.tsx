import Link from "next/link";
import type { ReactNode } from "react";

/** Small inline icon set (stroke) used across interior pages. */
export const Icon = {
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  center = false,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  center?: boolean;
  actions?: ReactNode;
}) {
  return (
    <header className={`page-hero${center ? " page-hero--center" : ""}`}>
      <div className="site-container">
        <div className="page-hero-inner">
          <span className="page-hero-eyebrow">
            <span className="dot" />
            {eyebrow}
          </span>
          <h1 className="page-hero-title">{title}</h1>
          <p className="page-hero-sub">{subtitle}</p>
          {actions && <div className="page-hero-actions">{actions}</div>}
        </div>
      </div>
    </header>
  );
}

export function Section({
  children,
  tint,
  narrow,
  id,
}: {
  children: ReactNode;
  tint?: "1" | "2";
  narrow?: boolean;
  id?: string;
}) {
  const cls = ["site-section"];
  if (tint === "1") cls.push("site-section--tint");
  if (tint === "2") cls.push("site-section--tint2");
  return (
    <section id={id} className={cls.join(" ")}>
      <div className={`site-container${narrow ? " site-container--narrow" : ""}`}>
        {children}
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  desc,
  center,
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={`sec-head${center ? " sec-head--center" : ""}`}>
      <span className="sec-eyebrow">{eyebrow}</span>
      <h2 className="sec-title">{title}</h2>
      {desc && <p className="sec-desc">{desc}</p>}
    </div>
  );
}

export function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="card card--hover">
      <span className="card-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

export function StatBand({
  items,
}: {
  items: { num: string; label: string }[];
}) {
  return (
    <div className="stat-band">
      {items.map((s) => (
        <div className="stat" key={s.label}>
          <div className="stat-num">{s.num}</div>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Steps({
  cols = 4,
  items,
}: {
  cols?: 3 | 4;
  items: { title: string; body: string }[];
}) {
  return (
    <div className={`steps grid-${cols}`}>
      {items.map((s, i) => (
        <div className="step" key={s.title}>
          <span className="step-num">{i + 1}</span>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

export function Checklist({ items }: { items: ReactNode[] }) {
  return (
    <ul className="checklist">
      {items.map((it, i) => (
        <li key={i}>
          {Icon.check}
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function CTABand({
  title,
  text,
  primary = { href: "/auth/signup", label: "Get started" },
  secondary,
}: {
  title: string;
  text: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <Section>
      <div className="cta-band">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="cta-actions">
          <Link href={primary.href} className="btn btn-primary">
            {primary.label} {Icon.arrow}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="btn btn-ghost">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </Section>
  );
}
