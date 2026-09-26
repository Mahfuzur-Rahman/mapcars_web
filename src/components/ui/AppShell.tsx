"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon from "./Icon";
import LogoTile from "./Logo";

/**
 * One navigation node. A node without `href` renders as a section heading —
 * that's how the admin menu catalog models its groups ("Customers", "Trips", …).
 */
export type NavNode = {
  key: string;
  label: string;
  href?: string;
  icon?: string;
  children?: NavNode[];
};

export type PortalTone = "admin" | "driver" | "customer";

const TONE: Record<PortalTone, { pill: string; label: string }> = {
  admin: { pill: "bg-brand-tint text-brand-ink", label: "Admin" },
  driver: { pill: "bg-accent-tint text-accent-ink", label: "Driver" },
  customer: { pill: "bg-slate-100 text-ink-muted", label: "Account" },
};

/** Every href in the tree, so we can pick the single best match for `pathname`. */
function collectHrefs(nodes: NavNode[]): string[] {
  return nodes.flatMap((n) => [
    ...(n.href ? [n.href] : []),
    ...(n.children ? collectHrefs(n.children) : []),
  ]);
}

/**
 * The deepest href that matches the current path. Using longest-match (rather
 * than "starts with") stops `/driver` from lighting up while you're actually
 * on `/driver/payout`.
 */
function bestMatch(hrefs: string[], pathname: string): string | null {
  let best: string | null = null;
  for (const href of hrefs) {
    const hit = pathname === href || pathname.startsWith(href + "/");
    if (hit && (best === null || href.length > best.length)) best = href;
  }
  return best;
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function NavItem({ node, activeHref }: { node: NavNode; activeHref: string | null }) {
  // Menu rows whose path is a route *template* ("/admin/customers/[id]") are
  // catalog metadata, not destinations — they're only reached from a list row.
  // Next's <Link> throws on an unresolved dynamic segment, so skip them.
  if (node.href?.includes("[")) return null;

  if (!node.href) {
    return (
      <div className="mt-5 mb-1 first:mt-0">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          {node.label}
        </p>
        {node.children?.map((c) => (
          <NavItem key={c.key} node={c} activeHref={activeHref} />
        ))}
      </div>
    );
  }

  const active = node.href === activeHref;

  return (
    <>
      <Link
        href={node.href}
        aria-current={active ? "page" : undefined}
        className={`group relative mb-0.5 flex items-center gap-2.5 rounded-lg py-2.5 pl-3 pr-3 text-sm font-medium transition-colors ${
          active
            ? "bg-brand-tint text-brand-ink"
            : "text-ink-muted hover:bg-slate-50 hover:text-ink"
        }`}
      >
        {/* active rail */}
        <span
          aria-hidden
          className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand transition-opacity ${
            active ? "opacity-100" : "opacity-0"
          }`}
        />
        {node.icon && (
          <Icon
            name={node.icon}
            className={`size-4 shrink-0 ${active ? "text-brand" : "text-ink-faint group-hover:text-ink-muted"}`}
          />
        )}
        <span className="truncate">{node.label}</span>
      </Link>
      {node.children?.map((c) => (
        <NavItem key={c.key} node={c} activeHref={activeHref} />
      ))}
    </>
  );
}

/**
 * Shared chrome for every signed-in portal (admin, driver, customer). Owns the
 * sidebar, brand mark, active state and the responsive drawer so the three
 * layouts stay a thin config each.
 */
export default function AppShell({
  tone,
  nav,
  user,
  onUserClick,
  onSignOut,
  children,
}: {
  tone: PortalTone;
  nav: NavNode[];
  user?: { name?: string; meta?: string };
  /** Optional — makes the sidebar user block a button (e.g. open "Change password"). */
  onUserClick?: () => void;
  onSignOut: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeHref = bestMatch(collectHrefs(nav), pathname);

  const sidebar = (
    <>
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <LogoTile className="size-8" />
        <span className="font-display text-[15px] font-bold tracking-tight text-ink">
          MapCars
        </span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[tone].pill}`}
        >
          {TONE[tone].label}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {nav.map((n) => (
          <NavItem key={n.key} node={n} activeHref={activeHref} />
        ))}
      </nav>

      <div className="border-t border-line p-3">
        {user && (
          <button
            onClick={onUserClick}
            disabled={!onUserClick}
            className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
              onUserClick ? "hover:bg-slate-50" : "cursor-default"
            }`}
          >
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-tint text-xs font-bold text-brand-ink"
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.name ?? "—"}</p>
              {user.meta && (
                <p className="truncate text-xs text-ink-faint">{user.meta}</p>
              )}
            </div>
          </button>
        )}
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Icon name="log-out" className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-app-bg">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          {/* Tapping any nav link dismisses the drawer — delegated so we don't
              need an effect watching `pathname`. */}
          <aside
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
            className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-surface shadow-[var(--shadow-raised)]"
          >
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span className="font-display text-sm font-bold text-ink">MapCars</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[tone].pill}`}>
            {TONE[tone].label}
          </span>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
