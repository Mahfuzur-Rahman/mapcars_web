"use client";

import { useEffect, useState } from "react";
import {
  adminReports,
  ApiError,
  type AdminTripListItem,
  type TripStatusName,
} from "@/lib/api";

import { ReceiptModal } from "@/components/receipt/ReceiptModal";
import { Icon } from "@/components/ui/Icon";

const FILTERS: { label: string; value: TripStatusName | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Requested", value: "Requested" },
  { label: "Assigned", value: "DriverAssigned" },
  { label: "Arrived", value: "DriverArrived" },
  { label: "In progress", value: "InProgress" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled (rider)", value: "CancelledByRider" },
  { label: "Cancelled (driver)", value: "CancelledByDriver" },
  { label: "Expired", value: "Expired" },
];

const gbp = (n?: number) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

export default function AdminTripHistoryPage() {
  const [filter, setFilter] = useState<TripStatusName | "All">("All");
  const [trips, setTrips] = useState<AdminTripListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<AdminTripListItem | null>(null);
  // Which filter the loaded `trips` belong to — when it lags `filter` we're
  // (re)loading. Derived loading avoids a synchronous setState in the effect.
  const [loadedFilter, setLoadedFilter] = useState<TripStatusName | "All" | null>(null);
  const loading = loadedFilter !== filter && !error;

  useEffect(() => {
    let active = true;
    adminReports
      .listTrips({ status: filter === "All" ? undefined : filter, take: 100 })
      .then((d) => {
        if (!active) return;
        setTrips(d);
        setError(null);
        setLoadedFilter(filter);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "Failed to load trips");
        setLoadedFilter(filter);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Trip history</h1>
        <p className="mt-1 text-sm text-zinc-500">Every trip booked on the platform, most recent first.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-5 py-3">Rider</th>
              <th className="px-5 py-3">Driver</th>
              <th className="px-5 py-3">Route</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Fare</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {!loading &&
              trips?.map((t) => (
              <tr key={t.id} className="hover:bg-zinc-50 transition">
                <td className="px-5 py-3 font-medium text-zinc-900">
                  {t.riderName || <span className="text-zinc-400">—</span>}
                </td>
                <td className="px-5 py-3 text-zinc-600">
                  {t.driverName || <span className="text-zinc-400">Unassigned</span>}
                </td>
                <td className="px-5 py-3 text-zinc-600">
                  <span className="block max-w-[280px] truncate">
                    {t.pickupAddress} <span className="text-zinc-400">→</span> {t.dropoffAddress}
                  </span>
                  {t.tier && (
                    <span className="text-xs text-zinc-400">{titleCase(t.tier)}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <TripStatusBadge status={t.status} />
                </td>
                <td className="px-5 py-3 tabular-nums font-medium text-zinc-900">
                  {gbp(t.fareAmount)}
                  {t.tipAmount > 0 && (
                    <span className="ml-1 text-xs text-green-600">+{gbp(t.tipAmount)} tip</span>
                  )}
                </td>
                <td className="px-5 py-3 text-zinc-600">
                  <span>{t.paymentMethod}</span>
                  <span
                    className={`ml-1.5 text-xs ${
                      t.paymentStatus === "Collected" ? "text-green-600" : "text-zinc-400"
                    }`}
                  >
                    {t.paymentStatus}
                  </span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-zinc-500">
                  {new Date(t.createdAtUtc).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-3 text-right">
                  {t.status === "Completed" ? (
                    <button
                      onClick={() => setSelectedTrip(t)}
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 hover:border-sky-300 transition"
                    >
                      <Icon name="receipt" className="h-3.5 w-3.5" />
                      Receipt
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && trips && trips.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-zinc-400">
                  No trips in this category.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-zinc-400">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Branded Official Receipt Modal */}
      <ReceiptModal
        trip={selectedTrip}
        isOpen={selectedTrip !== null}
        onClose={() => setSelectedTrip(null)}
        userType="admin"
      />
    </div>
  );
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function TripStatusBadge({ status }: { status: TripStatusName }) {
  const styles: Record<TripStatusName, string> = {
    Requested: "bg-blue-50 text-blue-700",
    DriverAssigned: "bg-blue-50 text-blue-700",
    DriverArrived: "bg-blue-50 text-blue-700",
    InProgress: "bg-amber-50 text-amber-700",
    Completed: "bg-green-50 text-green-700",
    CancelledByRider: "bg-red-50 text-red-700",
    CancelledByDriver: "bg-red-50 text-red-700",
    // Amber, not red: nobody did anything wrong here — the request simply found
    // no driver, which is a supply signal rather than a cancellation.
    Expired: "bg-amber-50 text-amber-700",
  };
  const labels: Record<TripStatusName, string> = {
    Requested: "Requested",
    DriverAssigned: "Assigned",
    DriverArrived: "Arrived",
    InProgress: "In progress",
    Completed: "Completed",
    CancelledByRider: "Cancelled (rider)",
    CancelledByDriver: "Cancelled (driver)",
    Expired: "Expired (no driver)",
  };
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
