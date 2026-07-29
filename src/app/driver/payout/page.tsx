"use client";

import { useEffect, useState } from "react";
import {
  driverPayouts,
  ApiError,
  type PayoutAccountStatus,
  type PayoutSummary,
} from "@/lib/api";

export default function DriverPayoutPage() {
  const [account, setAccount] = useState<PayoutAccountStatus | null>(null);
  const [payouts, setPayouts] = useState<PayoutSummary[] | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    driverPayouts
      .getAccountStatus()
      .then((status) => {
        setAccount(status);
        if (status.status === "Complete") {
          driverPayouts.listPayouts().then(setPayouts).catch(() => setPayouts([]));
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load payout status"));
  }, []);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const href = window.location.href;
      const { url } = await driverPayouts.startOnboarding(href, href);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to start onboarding");
      setConnecting(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Payouts</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage how you get paid.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && account === null && <p className="text-sm text-zinc-400">Loading…</p>}

      {account !== null && account.status !== "Complete" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <p className="mb-4 text-sm text-zinc-600">
            {account.status === "Restricted"
              ? "Stripe needs more information before payouts can resume."
              : "Connect a payout account with Stripe to start receiving payouts."}
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {connecting ? "Redirecting…" : "Connect with Stripe"}
          </button>
        </div>
      )}

      {account !== null && account.status === "Complete" && (
        <>
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Your payout account is connected and active.
          </div>

          {payouts !== null && payouts.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              No payouts yet.
            </div>
          )}

          {payouts !== null && payouts.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Arrived</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-50 last:border-0">
                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(p.createdAtUtc).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-zinc-900">
                        {p.currency.toUpperCase()} {p.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{p.status}</td>
                      <td className="px-4 py-3 text-zinc-500">
                        {p.arrivedAtUtc ? new Date(p.arrivedAtUtc).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
