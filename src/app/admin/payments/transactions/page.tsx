"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminMoney,
  ApiError,
  type AdminTransactionItem,
  type AdminTransactionsPage,
  type PaymentMethodName,
  type PaymentStatusName,
} from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Input,
  Page,
  PageHeader,
  Select,
  Skeleton,
  SlideOver,
  StatCard,
  StatGrid,
  type BadgeTone,
} from "@/components/ui";

const PAGE_SIZE = 50;

const STATUSES: { value: PaymentStatusName; label: string }[] = [
  { value: "Collected", label: "Collected" },
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Authorized", label: "Authorised" },
  { value: "ActionRequired", label: "Action required" },
  { value: "Failed", label: "Failed" },
  { value: "Refunded", label: "Refunded" },
  { value: "Voided", label: "Voided" },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label]),
);

function statusTone(status: string): BadgeTone {
  switch (status) {
    case "Collected":
      return "success";
    case "Failed":
      return "critical";
    case "ActionRequired":
      return "warning";
    case "Pending":
    case "Processing":
    case "Authorized":
      return "brand";
    default:
      return "neutral";
  }
}

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Same reference the receipt prints, so an admin can match the two. */
const tripRef = (id: string) => `MC-${id.slice(0, 8).toUpperCase()}`;

/**
 * `<input type="date">` gives a local calendar day. The API filters on UTC
 * instants with an EXCLUSIVE upper bound, so "to 3 March" has to become
 * "before local midnight starting 4 March", expressed in UTC.
 */
function localDayStartUtc(day: string, addDays = 0): string | undefined {
  if (!day) return undefined;
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d + addDays).toISOString();
}

interface Filters {
  method: PaymentMethodName | "";
  status: PaymentStatusName | "";
  from: string;
  to: string;
  skip: number;
}

const NO_FILTERS: Filters = { method: "", status: "", from: "", to: "", skip: 0 };

export default function AdminTransactionsPage() {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  // Bumped by Retry/Refresh so the same filters can be fetched again.
  const [reload, setReload] = useState(0);

  const [data, setData] = useState<AdminTransactionsPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Which request the current `data`/`error` answer. When it lags the wanted
  // key we're loading — derived, so the effect never sets state synchronously.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminTransactionItem | null>(null);

  const key = JSON.stringify([filters, reload]);
  const loading = loadedKey !== key;
  const rangeInvalid = Boolean(filters.from && filters.to && filters.to < filters.from);

  const fetchPage = useCallback(() => {
    let active = true;
    adminMoney
      .transactions({
        method: filters.method || undefined,
        paymentStatus: filters.status || undefined,
        from: localDayStartUtc(filters.from),
        to: localDayStartUtc(filters.to, 1),
        skip: filters.skip,
        take: PAGE_SIZE,
      })
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
        setLoadedKey(key);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "Failed to load transactions");
        setLoadedKey(key);
      });
    return () => {
      active = false;
    };
  }, [filters, key]);

  useEffect(() => fetchPage(), [fetchPage]);

  function update(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch, skip: "skip" in patch ? (patch.skip ?? 0) : 0 }));
  }

  const totals = data?.totals;
  const statsLoading = !data && !error;
  const outstanding = totals?.outstanding ?? 0;
  const count = totals?.count ?? 0;
  const page = Math.floor(filters.skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const hasFilters =
    filters.method !== "" || filters.status !== "" || filters.from !== "" || filters.to !== "";

  return (
    <Page>
      <PageHeader
        title="Transactions"
        subtitle="Every completed trip and where its money went. Totals cover the whole filtered range, not just this page."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setReload((n) => n + 1)}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => setReload((n) => n + 1)} />}

      <StatGrid>
        <StatCard
          label="Commission"
          value={totals ? gbp(totals.commission) : "—"}
          hint="Our revenue"
          tone="positive"
          icon="banknote"
          loading={statsLoading}
        />
        <StatCard
          label="Gross fares"
          value={totals ? gbp(totals.grossFares) : "—"}
          hint={totals ? `${count.toLocaleString()} ${count === 1 ? "trip" : "trips"}` : undefined}
          icon="receipt"
          loading={statsLoading}
        />
        <StatCard
          label="Driver earnings"
          value={totals ? gbp(totals.driverEarnings) : "—"}
          hint="Drivers' share of fares"
          icon="car"
          loading={statsLoading}
        />
        <StatCard
          label="Outstanding"
          value={totals ? gbp(outstanding) : "—"}
          hint={
            outstanding > 0
              ? "Owed by customers — failed or awaiting authentication"
              : "Nothing owed"
          }
          tone={outstanding > 0 ? "warning" : "positive"}
          valueTone={outstanding > 0 ? "warning" : "muted"}
          icon="alert-circle"
          loading={statsLoading}
        />
      </StatGrid>

      <div className="mt-4">
        <StatGrid cols={3}>
          <StatCard
            label="Cash collected"
            value={totals ? gbp(totals.cashCollected) : "—"}
            hint="Paid to drivers in person"
            icon="banknote"
            loading={statsLoading}
          />
          <StatCard
            label="Card collected"
            value={totals ? gbp(totals.cardCollected) : "—"}
            icon="credit-card"
            loading={statsLoading}
          />
          <StatCard
            label="Tips"
            value={totals ? gbp(totals.tips) : "—"}
            hint="Passed to drivers in full"
            icon="star"
            loading={statsLoading}
          />
        </StatGrid>
      </div>

      <div className="mb-4 mt-8 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Method
          <Select
            value={filters.method}
            onChange={(e) => update({ method: e.target.value as Filters["method"] })}
            className="w-auto normal-case tracking-normal"
          >
            <option value="">All methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Payment status
          <Select
            value={filters.status}
            onChange={(e) => update({ status: e.target.value as Filters["status"] })}
            className="w-auto normal-case tracking-normal"
          >
            <option value="">Any status</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Completed from
          <Input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => update({ from: e.target.value })}
            className="w-auto normal-case tracking-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          To (inclusive)
          <Input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => update({ to: e.target.value })}
            className="w-auto normal-case tracking-normal"
          />
        </label>
        {hasFilters && (
          <Button variant="ghost" size="md" onClick={() => setFilters(NO_FILTERS)}>
            Clear filters
          </Button>
        )}
      </div>
      {rangeInvalid && (
        <p className="-mt-2 mb-4 text-xs font-medium text-red-600">
          The end date is before the start date, so nothing can match.
        </p>
      )}

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="border-b border-line bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3">Completed</th>
                <th className="px-5 py-3">Trip</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Fare</th>
                <th className="px-5 py-3 text-right">Tip</th>
                <th className="px-5 py-3 text-right">Commission</th>
                <th className="px-5 py-3 text-right">Driver share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading &&
                [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-5 py-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                data?.items.map((t) => (
                  <tr
                    key={t.tripId}
                    className="cursor-pointer transition-colors hover:bg-slate-50/60"
                    onClick={() => setSelected(t)}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-muted">
                      {when(t.completedAtUtc)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(t);
                        }}
                        className="font-mono text-xs font-semibold text-brand-ink underline-offset-2 hover:underline"
                        aria-label={`Open transaction ${tripRef(t.tripId)}`}
                      >
                        {tripRef(t.tripId)}
                      </button>
                      {t.tier && (
                        <span className="block text-xs text-ink-faint">{titleCase(t.tier)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-ink">
                      {t.customerName || <span className="text-ink-faint">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">
                      {t.driverName || <span className="text-ink-faint">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-ink">{t.paymentMethod}</span>
                        <Badge tone={statusTone(t.paymentStatus)}>
                          {STATUS_LABEL[t.paymentStatus] ?? t.paymentStatus}
                        </Badge>
                        {t.isWaived && <Badge tone="neutral">Waived</Badge>}
                      </div>
                      {t.paymentFailureCode && (
                        <span className="mt-1 block font-mono text-[11px] text-red-600">
                          {t.paymentFailureCode}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium tabular-nums text-ink">
                      {gbp(t.fareAmount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-ink-muted">
                      {t.tipAmount > 0 ? gbp(t.tipAmount) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-accent-ink">
                      {gbp(t.platformFeeAmount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-ink-muted">
                      {gbp(t.driverEarnings)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && data?.items.length === 0 && (
          <EmptyState
            icon="receipt"
            title={hasFilters ? "No transactions match these filters" : "No transactions yet"}
            description={
              hasFilters
                ? "Try a wider date range or clear the filters."
                : "Completed trips will appear here with their fare, commission and driver share."
            }
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={() => setFilters(NO_FILTERS)}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>

      {count > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
          <span>
            Page {page} of {totalPages} · {count.toLocaleString()} transactions
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || filters.skip <= 0}
              onClick={() => update({ skip: Math.max(0, filters.skip - PAGE_SIZE) })}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || page >= totalPages}
              onClick={() => update({ skip: filters.skip + PAGE_SIZE })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selected && <TransactionDetail t={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}

function TransactionDetail({ t, onClose }: { t: AdminTransactionItem; onClose: () => void }) {
  const rows: [string, React.ReactNode][] = [
    ["Completed", when(t.completedAtUtc)],
    ["Customer", t.customerName ?? "—"],
    ["Driver", t.driverName ?? "—"],
    ["Tier", t.tier ? titleCase(t.tier) : "—"],
    ["Method", t.paymentMethod],
    ["Paid at", t.paidAtUtc ? when(t.paidAtUtc) : "Not paid"],
    ["Fare", gbp(t.fareAmount)],
    ["Tip", gbp(t.tipAmount)],
    ["Commission", gbp(t.platformFeeAmount)],
    ["Driver share", gbp(t.driverEarnings)],
  ];
  if (t.paymentFailureCode) rows.push(["Failure code", <code key="f">{t.paymentFailureCode}</code>]);
  if (t.stripePaymentIntentId)
    rows.push(["Stripe PaymentIntent", <code key="pi">{t.stripePaymentIntentId}</code>]);
  rows.push(["Trip ID", <code key="id">{t.tripId}</code>]);

  return (
    <SlideOver title={`Transaction ${tripRef(t.tripId)}`} subtitle={when(t.completedAtUtc)} onClose={onClose}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone={statusTone(t.paymentStatus)}>
          {STATUS_LABEL[t.paymentStatus] ?? t.paymentStatus}
        </Badge>
        {t.isWaived && <Badge tone="neutral">Waived</Badge>}
      </div>
      <dl className="divide-y divide-line rounded-xl border border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="break-all text-right font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </SlideOver>
  );
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
