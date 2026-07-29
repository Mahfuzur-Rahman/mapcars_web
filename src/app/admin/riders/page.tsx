"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminRiders, ApiError, type AdminRiderListItem } from "@/lib/api";

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<AdminRiderListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminRiders
      .list()
      .then(setRiders)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load riders"));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Riders</h1>
        <p className="mt-1 text-sm text-zinc-500">All customer accounts.</p>
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
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {riders?.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50">
                <td className="px-5 py-3 font-medium text-zinc-900">
                  {r.fullName || <span className="text-zinc-400">Unnamed</span>}
                </td>
                <td className="px-5 py-3 text-zinc-600">{r.email || r.phoneNumber || "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {r.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-500">
                  {new Date(r.createdAtUtc).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/riders/${r.id}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {riders && riders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                  No riders yet.
                </td>
              </tr>
            )}
            {!riders && !error && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
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
