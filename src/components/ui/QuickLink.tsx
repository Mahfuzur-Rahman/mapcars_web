import Link from "next/link";
import Icon from "./Icon";

/** Row wrapper for a set of quick links. */
export function QuickLinks({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

/** Card-style shortcut into another section of the portal. */
export default function QuickLink({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description?: string;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[var(--shadow-raised)]"
    >
      {icon && (
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand"
        >
          <Icon name={icon} className="size-[18px]" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{label}</span>
        {description && (
          <span className="block truncate text-xs text-ink-faint">{description}</span>
        )}
      </span>
      <Icon
        name="arrow-right"
        className="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
      />
    </Link>
  );
}
