"use client";

import { useEffect, useState } from "react";
import { riderTrips, ApiError, type TripSummary } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  Requested: "Requested",
  DriverAssigned: "Driver assigned",
  DriverArrived: "Driver arrived",
  InProgress: "In progress",
  Completed: "Completed",
  CancelledByRider: "Cancelled by you",
  CancelledByDriver: "Cancelled by driver",
};

export default function RecordsPage() {
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    riderTrips
      .list()
      .then(setTrips)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load trips"));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Trip records</h1>
        <p className="mt-1 text-sm text-zinc-500">Your past and current trips.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && trips === null && (
        <p className="text-sm text-zinc-400">Loading…</p>
      )}

      {trips !== null && trips.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          You haven&rsquo;t taken any trips yet.
        </div>
      )}

      {trips !== null && trips.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Pickup</th>
                <th className="px-4 py-3">Dropoff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fare</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-b border-zinc-50 last:border-0">
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(t.createdAtUtc).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">{t.pickupAddress}</td>
                  <td className="px-4 py-3 text-zinc-900">{t.dropoffAddress}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    <div>{STATUS_LABEL[t.status] ?? t.status}</div>
                    {t.cancelledReason && (
                      <div className="mt-0.5 text-xs text-zinc-400">{t.cancelledReason}</div>
                    )}
                    {t.isNoShow && (
                      <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        No-show
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">
                    {t.fareAmount != null ? `£${t.fareAmount.toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
