import Card from "./Card";
import Icon from "./Icon";
import { Skeleton } from "./Feedback";

export type StatTone = "muted" | "positive" | "warning" | "critical";

const HINT_TONE: Record<StatTone, string> = {
  muted: "text-ink-faint",
  positive: "text-accent-ink",
  warning: "text-amber-700",
  critical: "text-red-600",
};

/** Grid wrapper so every dashboard lays its tiles out identically. */
export function StatGrid({
  children,
  cols = 4,
}: {
  children: React.ReactNode;
  cols?: 3 | 4;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
        cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      }`}
    >
      {children}
    </div>
  );
}

/**
 * A single headline number. `hint` is for real context we actually have from
 * the API (e.g. "Needs review", "12 ratings") — never invented trend data.
 */
export default function StatCard({
  label,
  value,
  hint,
  tone = "muted",
  icon,
  loading = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: StatTone;
  icon?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </p>
        {icon && (
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand"
          >
            <Icon name={icon} className="size-[18px]" />
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-9 w-24" />
      ) : (
        <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-ink">
          {value}
        </p>
      )}

      {hint && !loading && (
        <p className={`mt-1.5 text-xs font-medium ${HINT_TONE[tone]}`}>{hint}</p>
      )}
    </Card>
  );
}
