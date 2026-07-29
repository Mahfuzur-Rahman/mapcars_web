"use client";

import { useEffect, useState } from "react";
import { driverTrips, ApiError, type DriverTripSummary } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  Requested: "Requested",
  DriverAssigned: "Assigned",
  DriverArrived: "Arrived",
  InProgress: "In progress",
  Completed: "Completed",
  CancelledByRider: "Cancelled by rider",
  CancelledByDriver: "Cancelled by you",
};

export default function DriverRecordsPage() {
  const [trips, setTrips] = useState<DriverTripSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    driverTrips
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

      {!error && trips === null && <p className="text-sm text-zinc-400">Loading…</p>}

      {trips !== null && trips.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          You haven&rsquo;t driven any trips yet.
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
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3">Your earnings</th>
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
                  <td className="px-4 py-3 text-zinc-600">{STATUS_LABEL[t.status] ?? t.status}</td>
                  <td className="px-4 py-3 text-zinc-900">
                    {t.fareAmount != null ? `£${t.fareAmount.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">
                    {t.tipAmount > 0 ? `£${t.tipAmount.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-700">
                    {t.driverEarnings != null ? `£${t.driverEarnings.toFixed(2)}` : "—"}
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
