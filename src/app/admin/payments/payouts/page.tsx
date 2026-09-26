"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminMoney,
  ApiError,
  type AdminPayoutsPage,
  type PayoutStatusName,
} from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Page,
  PageHeader,
  Select,
  Skeleton,
  StatCard,
  StatGrid,
  type BadgeTone,
} from "@/components/ui";

const PAGE_SIZE = 50;

const STATUSES: { value: PayoutStatusName; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "InTransit", label: "In transit" },
  { value: "Paid", label: "Paid" },
  { value: "Failed", label: "Failed" },
  { value: "Canceled", label: "Cancelled" },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label]),
);

function statusTone(status: string): BadgeTone {
  switch (status) {
    case "Paid":
      return "success";
    case "Failed":
      return "critical";
    case "Pending":
    case "InTransit":
      return "brand";
    default:
      return "neutral";
  }
}

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

/** A payout may be in another currency one day; don't pretend it's pounds. */
const money = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency.toUpperCase()}`;
  }
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminPayoutsPage() {
  const [status, setStatus] = useState<PayoutStatusName | "">("");
  const [skip, setSkip] = useState(0);
  const [reload, setReload] = useState(0);

  const [data, setData] = useState<AdminPayoutsPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const key = JSON.stringify([status, skip, reload]);
  const loading = loadedKey !== key;

  const fetchPage = useCallback(() => {
    let active = true;
    adminMoney
      .payouts({ status: status || undefined, skip, take: PAGE_SIZE })
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
        setLoadedKey(key);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "Failed to load payouts");
        setLoadedKey(key);
      });
    return () => {
      active = false;
    };
  }, [status, skip, key]);

  useEffect(() => fetchPage(), [fetchPage]);

  const totals = data?.totals;
  const statsLoading = !data && !error;
  const count = totals?.count ?? 0;
  const failed = totals?.failed ?? 0;
  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <Page>
      <PageHeader
        title="Payouts"
        subtitle="Money sent from the platform to drivers' bank accounts through Stripe Connect."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setReload((n) => n + 1)}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => setReload((n) => n + 1)} />}

      <StatGrid>
        <StatCard
          label="Payouts"
          value={totals ? count.toLocaleString() : "—"}
          hint={status ? `Filtered: ${STATUS_LABEL[status]}` : "All statuses"}
          icon="list"
          loading={statsLoading}
        />
        <StatCard
          label="Paid out"
          value={totals ? gbp(totals.paid) : "—"}
          hint="Arrived in drivers' banks"
          tone="positive"
          icon="banknote"
          loading={statsLoading}
        />
        <StatCard
          label="In flight"
          value={totals ? gbp(totals.inFlight) : "—"}
          hint="Pending or in transit"
          icon="clock"
          loading={statsLoading}
        />
        <StatCard
          label="Failed"
          value={totals ? gbp(failed) : "—"}
          hint={failed > 0 ? "Needs follow-up with the driver" : "None failed"}
          tone={failed > 0 ? "critical" : "positive"}
          valueTone={failed > 0 ? "critical" : "muted"}
          icon="alert-circle"
          loading={statsLoading}
        />
      </StatGrid>

      <div className="mb-4 mt-8 flex flex-wrap items-center gap-2">
        <Select
          aria-label="Payout status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PayoutStatusName | "");
            setSkip(0);
          }}
          className="w-auto"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Arrived</th>
                <th className="px-5 py-3">Stripe payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading &&
                [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                data?.items.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-muted">
                      {when(p.createdAtUtc)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {p.driverName || <span className="text-ink-faint">Unknown driver</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-ink">
                      {money(p.amount, p.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={statusTone(p.status)}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-muted">
                      {p.arrivedAtUtc ? when(p.arrivedAtUtc) : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-ink-muted">
                      {p.stripePayoutId}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && data?.items.length === 0 && (
          status ? (
            <EmptyState
              icon="banknote"
              title={`No ${STATUS_LABEL[status].toLowerCase()} payouts`}
              description="Try another status, or show all payouts."
              action={
                <Button variant="secondary" size="sm" onClick={() => {
                    setStatus("");
                    setSkip(0);
                  }}>
                  Show all
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon="banknote"
              title="No payouts yet"
              description="Payouts appear here once Stripe Connect is live and drivers start receiving card earnings to their bank accounts. Cash trips are settled in person, so they never create a payout."
            />
          )
        )}
      </Card>

      {count > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
          <span>
            Page {page} of {totalPages} · {count.toLocaleString()} payouts
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || skip <= 0}
              onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || page >= totalPages}
              onClick={() => setSkip((s) => s + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}
