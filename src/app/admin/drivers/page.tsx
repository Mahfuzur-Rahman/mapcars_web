"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  adminDriverReview,
  ApiError,
  type DriverReviewListItem,
  type DriverStatus,
} from "@/lib/api";

const FILTERS: { label: string; value: DriverStatus | "All" }[] = [
  { label: "Pending", value: "PendingApproval" },
  { label: "Approved", value: "Approved" },
  { label: "Suspended", value: "Suspended" },
  { label: "Rejected", value: "Rejected" },
  { label: "All", value: "All" },
];

export default function AdminDriversPage() {
  const [filter, setFilter] = useState<DriverStatus | "All">("PendingApproval");
  const [drivers, setDrivers] = useState<DriverReviewListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Derived loading (the loaded filter lagging the selected one) — avoids a
  // synchronous setState in the effect body (react-hooks/set-state-in-effect).
  const [loadedFilter, setLoadedFilter] = useState<DriverStatus | "All" | null>(null);
  const loading = loadedFilter !== filter && !error;

  useEffect(() => {
    let active = true;
    adminDriverReview
      .listDrivers(filter === "All" ? undefined : filter)
      .then((d) => {
        if (!active) return;
        setDrivers(d);
        setError(null);
        setLoadedFilter(filter);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "Failed to load drivers");
        setLoadedFilter(filter);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Drivers</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review driver documents and approve, suspend or reject applications.
        </p>
      </div>

      {/* Status filter */}
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

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-5 py-3">Driver</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Documents</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {!loading &&
              drivers?.map((d) => (
              <tr key={d.driverId} className="hover:bg-zinc-50">
                <td className="px-5 py-3 font-medium text-zinc-900">
                  {d.fullName || <span className="text-zinc-400">Unnamed</span>}
                </td>
                <td className="px-5 py-3 text-zinc-600">
                  {d.email || d.phoneNumber || "—"}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-5 py-3 tabular-nums text-zinc-600">
                  {d.pendingDocumentCount > 0 ? (
                    <span className="font-semibold text-amber-600">
                      {d.pendingDocumentCount} pending
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                  <span className="ml-1 text-zinc-400">/ {d.documentCount} total</span>
                </td>
                <td className="px-5 py-3 text-zinc-500">
                  {new Date(d.createdAtUtc).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/drivers/${d.driverId}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && drivers && drivers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                  No drivers in this category.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: DriverStatus }) {
  const styles: Record<DriverStatus, string> = {
    PendingApproval: "bg-amber-50 text-amber-700",
    Approved: "bg-green-50 text-green-700",
    Suspended: "bg-zinc-100 text-zinc-600",
    Rejected: "bg-red-50 text-red-700",
  };
  const labels: Record<DriverStatus, string> = {
    PendingApproval: "Pending",
    Approved: "Approved",
    Suspended: "Suspended",
    Rejected: "Rejected",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
