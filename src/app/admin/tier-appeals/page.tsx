"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminDriverReview,
  ApiError,
  type TierAppealListItem,
} from "@/lib/api";
import { TierBadge } from "../drivers/[id]/page";

type FilterTab = "All" | "Pending" | "Approved" | "Rejected";

export default function AdminTierAppealsPage() {
  const [appeals, setAppeals] = useState<TierAppealListItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Photo preview modal
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Review modal
  const [selectedAppeal, setSelectedAppeal] = useState<TierAppealListItem | null>(null);
  const [decision, setDecision] = useState<"Approved" | "Rejected">("Approved");
  const [adminNotes, setAdminNotes] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const statusParam = activeTab === "All" ? undefined : activeTab;
    adminDriverReview
      .listTierAppeals(statusParam)
      .then((data) => {
        setAppeals(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load tier appeals");
        setLoading(false);
      });
  }, [activeTab]);

  useEffect(load, [load]);

  async function handleReviewSubmit() {
    if (!selectedAppeal) return;
    setBusy(true);
    setError(null);
    try {
      await adminDriverReview.reviewTierAppeal(
        selectedAppeal.id,
        decision,
        adminNotes.trim() || undefined,
      );
      setSelectedAppeal(null);
      setAdminNotes("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save appeal review");
    } finally {
      setBusy(false);
    }
  }

  const counts = {
    pending: appeals.filter((a) => a.status === "Pending").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Vehicle Tier Appeals</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Review driver requests to upgrade their vehicle tier across the platform.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-zinc-200 pb-3">
        {(["Pending", "All", "Approved", "Rejected"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === tab
                ? "bg-zinc-900 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <span>{tab}</span>
            {tab === "Pending" && activeTab !== "Pending" && counts.pending > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-400">Loading tier appeals…</div>
      ) : appeals.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            ✓
          </div>
          <h3 className="mt-3 text-base font-bold text-zinc-900">No {activeTab.toLowerCase()} appeals</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {activeTab === "Pending"
              ? "All caught up! No driver tier appeals are currently awaiting review."
              : "No appeals found matching the selected filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 md:flex-row md:items-center"
            >
              {/* Driver & Vehicle details */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/drivers/${appeal.driverId}`}
                    className="text-base font-bold text-zinc-900 hover:text-blue-600"
                  >
                    {appeal.driverName || "Driver"}
                  </Link>
                  <span className="text-xs text-zinc-400">·</span>
                  <span className="text-xs text-zinc-500">{appeal.driverEmail || appeal.driverPhone}</span>
                  <span className="text-xs text-zinc-400">·</span>
                  <span className="text-xs text-zinc-400">
                    {new Date(appeal.createdAtUtc).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                  <span className="font-semibold text-zinc-800">{appeal.vehicleDescription}</span>
                  <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-zinc-700">
                    {appeal.registrationNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <TierBadge tier={appeal.currentTier} />
                    <span className="text-zinc-400">→</span>
                    <TierBadge tier={appeal.requestedTier} />
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700">
                  <span className="font-bold text-zinc-900">Reason: </span>
                  {appeal.reason}
                </div>

                {/* Photos Preview if available */}
                {appeal.photoCount > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-zinc-500">
                      {appeal.photoCount} attached photo{appeal.photoCount === 1 ? "" : "s"}:
                    </span>
                    {Array.from({ length: appeal.photoCount }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setPreviewPhoto({
                            url: adminDriverReview.appealPhotoUrl(appeal.id, idx),
                            title: `${appeal.driverName ?? "Driver"}'s Car Photo ${idx + 1}`,
                          })
                        }
                        className="group relative h-10 w-10 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 hover:opacity-80"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={adminDriverReview.appealPhotoUrl(appeal.id, idx)}
                          alt="Photo thumbnail"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {appeal.adminNotes && (
                  <p className="text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-700">Admin Note: </span>
                    {appeal.adminNotes}
                  </p>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-row items-center gap-3 md:flex-col md:items-end">
                <StatusBadge status={appeal.status} />

                {appeal.status === "Pending" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppeal(appeal);
                        setDecision("Approved");
                        setAdminNotes("");
                      }}
                      disabled={busy}
                      className="rounded-xl bg-green-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppeal(appeal);
                        setDecision("Rejected");
                        setAdminNotes("");
                      }}
                      disabled={busy}
                      className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-zinc-400">
                    Decided {appeal.reviewedAtUtc ? new Date(appeal.reviewedAtUtc).toLocaleDateString() : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Lightbox Preview */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
              <p className="text-sm font-semibold text-zinc-900">{previewPhoto.title}</p>
              <button onClick={() => setPreviewPhoto(null)} className="text-zinc-400 hover:text-zinc-700">
                ✕
              </button>
            </div>
            <div className="flex items-center justify-center bg-zinc-950 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Appeal Decision Modal */}
      {selectedAppeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAppeal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-zinc-900">
              {decision} Tier Appeal
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Driver: <span className="font-semibold text-zinc-800">{selectedAppeal.driverName}</span> ·{" "}
              {selectedAppeal.currentTier.toUpperCase()} → {selectedAppeal.requestedTier.toUpperCase()}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700">
                Decision
              </label>
              <div className="mt-1.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDecision("Approved")}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                    decision === "Approved"
                      ? "bg-green-600 text-white shadow-sm"
                      : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Approve (Upgrade Tier)
                </button>
                <button
                  type="button"
                  onClick={() => setDecision("Rejected")}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                    decision === "Rejected"
                      ? "bg-red-600 text-white shadow-sm"
                      : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Decline
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700">
                Admin Notes (sent to driver via email & push notification)
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional feedback, criteria, or rationale..."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 p-3 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAppeal(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={busy}
                className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition shadow-sm ${
                  decision === "Approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-40`}
              >
                {busy ? "Saving..." : `Confirm ${decision}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
        styles[status] ?? "border-zinc-200 bg-zinc-100 text-zinc-600"
      }`}
    >
      {status}
    </span>
  );
}
