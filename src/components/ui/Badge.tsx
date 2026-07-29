export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "critical";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-ink-muted",
  brand: "bg-brand-tint text-brand-ink",
  success: "bg-accent-tint text-accent-ink",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-700",
};

/** Status pill. `dot` adds a leading indicator for live/online style states. */
export default function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[tone]}`}
    >
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Maps the API's driver status strings onto badge tones. */
export function driverStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Approved":
      return "success";
    case "PendingApproval":
      return "warning";
    case "Suspended":
    case "Rejected":
      return "critical";
    default:
      return "neutral";
  }
}
