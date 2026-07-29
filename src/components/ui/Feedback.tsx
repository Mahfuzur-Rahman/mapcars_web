import Icon from "./Icon";

/** Shimmering placeholder for content that hasn't loaded yet. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />;
}

/** Inline failure notice for a page or section that couldn't load. */
export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
    >
      <Icon name="alert-circle" className="mt-0.5 size-[18px] shrink-0 text-red-600" />
      <p className="flex-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-800"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/** Friendly "nothing here yet" state with an optional next action. */
export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span
        aria-hidden
        className="mb-3 grid size-12 place-items-center rounded-2xl bg-slate-100 text-ink-faint"
      >
        <Icon name={icon} className="size-6" />
      </span>
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Full-page loading state (used while a layout resolves its session). */
export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 bg-app-bg">
      <span className="size-4 animate-spin rounded-full border-2 border-line border-t-brand" />
      <span className="text-sm text-ink-muted">{label}…</span>
    </div>
  );
}
