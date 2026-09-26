"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminStatements,
  ApiError,
  type DriverStatementDetail,
  type DriverStatementSummary,
} from "@/lib/api";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Button,
  Page,
  PageHeader,
  Select,
  Skeleton,
  SlideOver,
  type BadgeTone,
} from "@/components/ui";

const PAGE_SIZE = 50;
const WEEKS_OFFERED = 12;
const LONDON = "Europe/London";
const DAY_MS = 24 * 60 * 60 * 1000;

// ── Money (integer pence from this API) ─────────────────────────────────────

const gbp = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);

/**
 * Signed platform→driver amounts, in words. The sign alone is easy to misread
 * on a money page, so every net figure says who pays whom.
 */
function direction(pence: number): { label: string; tone: BadgeTone; text: string } {
  if (pence > 0) return { label: `We pay ${gbp(pence)}`, tone: "brand", text: "text-brand-ink" };
  if (pence < 0) return { label: `Driver owes ${gbp(-pence)}`, tone: "warning", text: "text-amber-700" };
  return { label: "Nothing due", tone: "neutral", text: "text-ink-muted" };
}

// ── UK weeks ────────────────────────────────────────────────────────────────
// Statements run Monday 00:00 Europe/London to the next Monday. Everything is
// shown in London dates regardless of the admin's own timezone.

function londonParts(ms: number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour"), min: get("minute"), s: get("second") };
}

/** UTC instant of 00:00 London on the given calendar day (DST-aware). */
function londonMidnightUtc(y: number, m: number, d: number): number {
  const guess = Date.UTC(y, m - 1, d);
  const p = londonParts(guess);
  const wall = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s);
  return guess - (wall - guess);
}

/** The last N UK week starts, newest first, as UTC instants. */
function recentWeekStarts(count: number, nowMs: number): number[] {
  const today = londonParts(nowMs);
  const todayUtcDate = Date.UTC(today.y, today.m - 1, today.d);
  const sinceMonday = (new Date(todayUtcDate).getUTCDay() + 6) % 7;
  return Array.from({ length: count }, (_, i) => {
    const monday = new Date(todayUtcDate - (sinceMonday + 7 * i) * DAY_MS);
    return londonMidnightUtc(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate());
  });
}

const dayFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: LONDON,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const yearFmt = new Intl.DateTimeFormat("en-GB", { timeZone: LONDON, year: "numeric" });
const whenFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: LONDON,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "Mon 15 Sep – Sun 21 Sep 2026". The end instant is exclusive, so step back 1 ms. */
function weekLabel(startMs: number, endMs: number = startMs + 7 * DAY_MS): string {
  const last = endMs - 1;
  return `${dayFmt.format(startMs)} – ${dayFmt.format(last)} ${yearFmt.format(last)}`;
}

const periodOf = (s: DriverStatementSummary) =>
  weekLabel(Date.parse(s.periodStartUtc), Date.parse(s.periodEndUtc));

const tripRef = (id: string) => `MC-${id.slice(0, 8).toUpperCase()}`;

// ── Page ────────────────────────────────────────────────────────────────────

export default function AdminStatementsPage() {
  // Read the clock once, in a lazy initialiser. The admin layout only renders
  // pages client-side (after its session check), so this can't cause a
  // hydration mismatch.
  const [weeks] = useState(() => recentWeekStarts(WEEKS_OFFERED, Date.now()));

  const [week, setWeek] = useState<string>(""); // ISO instant, "" = all weeks
  const [skip, setSkip] = useState(0);
  const [reload, setReload] = useState(0);

  const [rows, setRows] = useState<DriverStatementSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const [selected, setSelected] = useState<DriverStatementSummary | null>(null);

  const key = JSON.stringify([week, skip, reload]);
  const loading = loadedKey !== key;

  const fetchPage = useCallback(() => {
    let active = true;
    adminStatements
      .list({ periodStart: week || undefined, skip, take: PAGE_SIZE })
      .then((res) => {
        if (!active) return;
        setRows(res);
        setError(null);
        setLoadedKey(key);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "Failed to load statements");
        setLoadedKey(key);
      });
    return () => {
      active = false;
    };
  }, [week, skip, key]);

  useEffect(() => fetchPage(), [fetchPage]);

  const page = Math.floor(skip / PAGE_SIZE) + 1;
  // The API returns a plain list with no total, so a full page means "maybe more".
  const mayHaveMore = (rows?.length ?? 0) === PAGE_SIZE;

  return (
    <Page>
      <PageHeader
        title="Driver statements"
        subtitle="One statement per driver per UK week (Monday to Sunday, London time). Net is what we pay the driver, or what the driver owes us in commission on cash fares."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setReload((n) => n + 1)}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => setReload((n) => n + 1)} />}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          aria-label="Week"
          value={week}
          onChange={(e) => {
            setWeek(e.target.value);
            setSkip(0);
          }}
          className="w-auto"
        >
          <option value="">All weeks</option>
          {weeks.map((ms, i) => (
            <option key={ms} value={new Date(ms).toISOString()}>
              {weekLabel(ms)}
              {i === 0 ? " (this week)" : ""}
            </option>
          ))}
        </Select>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-b border-line bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3">Week</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3 text-right">Trips</th>
                <th className="px-5 py-3 text-right">Commission</th>
                <th className="px-5 py-3 text-right">Card payable</th>
                <th className="px-5 py-3 text-right">Cash commission owed</th>
                <th className="px-5 py-3">Net</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading &&
                [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-5 py-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                rows?.map((s) => {
                  const net = direction(s.netPence);
                  return (
                    <tr
                      key={s.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50/60"
                      onClick={() => setSelected(s)}
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-muted">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(s);
                          }}
                          className="text-left font-semibold text-brand-ink underline-offset-2 hover:underline"
                        >
                          {periodOf(s)}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-ink">
                        {s.driverName || <span className="text-ink-faint">Unknown driver</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-ink-muted">
                        {s.tripCount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-accent-ink">
                        {gbp(s.commissionPence)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-ink-muted">
                        {gbp(s.cardPayablePence)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-ink-muted">
                        {gbp(s.cashCommissionOwedPence)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone={net.tone}>{net.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={s.status === "Settled" ? "success" : "neutral"}>{s.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!loading && rows?.length === 0 && (
          <EmptyState
            icon="file-text"
            title={week ? "No statements for this week" : "No statements yet"}
            description={
              week
                ? "Statements are built from completed trips once a week has started. Try another week."
                : "Statements are built every hour from completed trips — one per driver for each UK week they drove."
            }
            action={
              week ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setWeek("");
                    setSkip(0);
                  }}
                >
                  Show all weeks
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>

      {(skip > 0 || mayHaveMore) && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
          <span>Page {page}</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || skip <= 0}
              onClick={() => setSkip((v) => Math.max(0, v - PAGE_SIZE))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || !mayHaveMore}
              onClick={() => setSkip((v) => v + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selected && <StatementPanel summary={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}

// ── Detail panel ────────────────────────────────────────────────────────────

function StatementPanel({
  summary,
  onClose,
}: {
  summary: DriverStatementSummary;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<DriverStatementDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const key = `${summary.id}:${reload}`;
  const loading = loadedKey !== key;

  useEffect(() => {
    let active = true;
    adminStatements
      .get(summary.id)
      .then((res) => {
        if (!active) return;
        setDetail(res);
        setError(null);
        setLoadedKey(key);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "Failed to load this statement");
        setLoadedKey(key);
      });
    return () => {
      active = false;
    };
  }, [summary.id, key]);

  // The detail's summary is authoritative once loaded; the list row is shown until then.
  const s = detail?.summary ?? summary;
  const net = direction(s.netPence);

  const rows: [string, React.ReactNode][] = [
    ["Trips", s.tripCount.toLocaleString()],
    ["Gross fares", gbp(s.grossFaresPence)],
    ["Tips", gbp(s.tipsPence)],
    ["Commission", gbp(s.commissionPence)],
    ["Driver earnings", gbp(s.driverEarningsPence)],
    ["Card payable to driver", gbp(s.cardPayablePence)],
    ["Cash commission owed by driver", gbp(s.cashCommissionOwedPence)],
  ];

  return (
    <SlideOver
      title={s.driverName ?? "Driver statement"}
      subtitle={periodOf(s)}
      onClose={onClose}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone={s.status === "Settled" ? "success" : "neutral"}>{s.status}</Badge>
        <span className="text-xs text-ink-faint">
          Built {whenFmt.format(Date.parse(s.createdAtUtc))}
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-line bg-slate-50/50 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Net for the week</p>
        <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${net.text}`}>{net.label}</p>
        <p className="mt-0.5 text-xs text-ink-faint">
          Card share plus tips, less commission on cash fares the driver kept.
        </p>
      </div>

      <dl className="mb-6 divide-y divide-line rounded-xl border border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="text-right font-medium tabular-nums text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Trips</h3>

      {error && <ErrorBanner message={error} onRetry={() => setReload((n) => n + 1)} />}

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {!loading && detail && detail.lines.length === 0 && (
        <p className="text-sm text-ink-muted">No trips on this statement.</p>
      )}

      {!loading && detail && detail.lines.length > 0 && (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {detail.lines.map((l) => {
            const amount = direction(l.amountPence);
            return (
              <li key={l.tripId} className="px-4 py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-ink">{tripRef(l.tripId)}</span>
                      <Badge tone={l.paymentMethod === "Card" ? "brand" : "neutral"}>{l.paymentMethod}</Badge>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {whenFmt.format(Date.parse(l.completedAtUtc))}
                    </p>
                  </div>
                  <span className={`shrink-0 text-right text-xs font-semibold ${amount.text}`}>
                    {amount.label}
                  </span>
                </div>
                <p className="mt-1.5 text-xs tabular-nums text-ink-muted">
                  Fare {gbp(l.farePence)} · Tip {gbp(l.tipPence)} · Commission {gbp(l.commissionPence)} ·
                  Driver {gbp(l.driverEarningsPence)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </SlideOver>
  );
}
