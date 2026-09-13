"use client";

import { useEffect, useState } from "react";
import { customerTrips, ApiError, type TripSummary } from "@/lib/api";

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
};

export default function AccountPaymentPage() {
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customerTrips
      .list()
      .then(setTrips)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load payment history"));
  }, []);

  const paidTrips = trips?.filter((t) => t.status === "Completed") ?? [];
  const totalPaid = paidTrips.reduce((sum, t) => sum + (t.fareAmount ?? 0) + (t.tipAmount ?? 0), 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Payment</h1>
        <p className="mt-1 text-sm text-zinc-500">How you pay, and what you&rsquo;ve paid.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Payment method</p>
        <p className="mt-1 text-lg font-semibold text-zinc-900">Cash</p>
        <p className="mt-1 text-xs text-zinc-400">
          Card payments aren&rsquo;t available yet — every ride is settled in cash with the driver.
        </p>
      </div>

      {trips !== null && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Completed rides</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">{paidTrips.length.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Total paid</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">£{totalPaid.toFixed(2)}</p>
          </div>
        </div>
      )}

      {!error && trips === null && <p className="text-sm text-zinc-400">Loading…</p>}

      {trips !== null && trips.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No payment history yet.
        </div>
      )}

      {trips !== null && trips.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fare</th>
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-b border-zinc-50 last:border-0">
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(t.createdAtUtc).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">
                    {t.fareAmount != null ? `£${t.fareAmount.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">
                    {t.tipAmount > 0 ? `£${t.tipAmount.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{t.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        PAYMENT_STATUS_STYLE[t.paymentStatus] ?? "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {t.paymentStatus}
                    </span>
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
