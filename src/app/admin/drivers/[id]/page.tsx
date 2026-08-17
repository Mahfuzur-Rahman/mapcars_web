"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  adminDriverReview,
  ApiError,
  type DriverReviewDetail,
  type DriverStatus,
  type DocumentSummary,
  type VehicleTierAppealResponse,
} from "@/lib/api";
import { StatusBadge } from "../page";

// DocumentType enum name → human label.
const DOC_LABELS: Record<string, string> = {
  PhvLicence: "PHV driver licence",
  VehicleInsurance: "Private hire insurance",
  VehicleRegistration: "Vehicle registration (V5C)",
  DbsCheck: "DBS check",
  VehicleFrontPhoto: "Vehicle photo — front",
  VehicleRearPhoto: "Vehicle photo — rear",
  VehicleInteriorPhoto: "Vehicle photo — interior",
  Passport: "Passport",
  DrivingLicence: "Driving licence",
  VehicleBadge: "Vehicle PHV badge",
  BankStatement: "Bank statement",
  ProofOfAddress: "Utility bill",
};

export default function AdminDriverDetailPage() {
  const params = useParams<{ id: string }>();
  const driverId = params.id;

  const [driver, setDriver] = useState<DriverReviewDetail | null>(null);
  const [appeals, setAppeals] = useState<VehicleTierAppealResponse[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("economy");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<DocumentSummary | null>(null);
  const [photoPreview, setPhotoPreview] = useState<{ url: string; title: string } | null>(null);

  // Review modal state
  const [reviewingAppeal, setReviewingAppeal] = useState<VehicleTierAppealResponse | null>(null);
  const [appealDecision, setAppealDecision] = useState<"Approved" | "Rejected">("Approved");
  const [adminNotes, setAdminNotes] = useState("");

  const load = useCallback(() => {
    adminDriverReview
      .getDriver(driverId)
      .then((d: DriverReviewDetail) => {
        setDriver(d);
        if (d.vehicle?.tier) setSelectedTier(d.vehicle.tier.toLowerCase());
      })
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : "Failed to load driver"));

    adminDriverReview
      .getDriverAppeals(driverId)
      .then((data: VehicleTierAppealResponse[]) => setAppeals(data))
      .catch(() => {});
  }, [driverId]);

  useEffect(load, [load]);

  async function reviewDoc(doc: DocumentSummary, status: "Approved" | "Rejected") {
    setBusy(true);
    setError(null);
    try {
      await adminDriverReview.reviewDocument(doc.id, status);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update document");
    } finally {
      setBusy(false);
    }
  }

  async function reviewDeletion(doc: DocumentSummary, status: "Approved" | "Rejected") {
    if (status === "Approved" && !confirm(`Are you sure you want to permanently delete "${DOC_LABELS[doc.type] ?? doc.type}" (${doc.originalFileName})?`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await adminDriverReview.reviewDocumentDeletion(doc.id, status);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to process deletion review");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(status: DriverStatus) {
    setBusy(true);
    setError(null);
    try {
      const updated = await adminDriverReview.setDriverStatus(driverId, status);
      setDriver(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  }

  async function updateVehicleTier() {
    if (!driver?.vehicle) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminDriverReview.setVehicleTier(driverId, selectedTier);
      setDriver((prev: DriverReviewDetail | null) => (prev ? { ...prev, vehicle: updated } : null));
      setSuccess(`Vehicle tier updated to ${selectedTier.toUpperCase()}`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update vehicle tier");
    } finally {
      setBusy(false);
    }
  }

  async function submitAppealReview() {
    if (!reviewingAppeal) return;
    setBusy(true);
    setError(null);
    try {
      await adminDriverReview.reviewTierAppeal(
        reviewingAppeal.id,
        appealDecision,
        adminNotes.trim() || undefined,
      );
      setReviewingAppeal(null);
      setAdminNotes("");
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to review appeal");
    } finally {
      setBusy(false);
    }
  }

  if (error && !driver) {
    return (
      <div className="p-8">
        <BackLink />
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!driver) {
    return <div className="p-8 text-sm text-zinc-400">Loading…</div>;
  }

  const unreviewedDocs = driver.documents.filter((d: DocumentSummary) => d.reviewStatus === "Pending").length;

  return (
    <div className="p-8">
      <BackLink />

      <div className="mb-6 mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {driver.fullName || "Unnamed driver"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {driver.email || "—"} · {driver.phoneNumber || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OnlineIndicator isOnline={driver.isOnline} />
          <StatusBadge status={driver.status} />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: profile + vehicle */}
        <div className="space-y-5">
          <Card title="Profile">
            <Field label="Date of birth" value={driver.dateOfBirth} />
            <Field label="Address" value={driver.address} />
            <Field label="National ID" value={driver.nationalIdNumber} />
            <Field label="PHV licence no." value={driver.phvLicenceNumber} />
            <Field label="Driving licence no." value={driver.drivingLicenceNumber} />
            <Field label="Passport no." value={driver.passportNumber} />
            <Field label="Emergency contact" value={driver.emergencyContactName} />
            <Field label="Emergency contact phone" value={driver.emergencyContactPhone} />
            <Field label="Marketing consent" value={driver.marketingConsent ? "Yes" : "No"} />
            <Field
              label="Profile picture"
              value={driver.hasProfilePicture ? "Uploaded" : "Not uploaded"}
            />
          </Card>

          <Card title="Performance">
            <Field
              label="Rating"
              value={
                driver.ratingCount > 0
                  ? `${driver.averageRating?.toFixed(1)} ★ (${driver.ratingCount} rating${driver.ratingCount === 1 ? "" : "s"})`
                  : "No ratings yet"
              }
            />
            <Field label="Cancellations" value={String(driver.cancellationCount)} />
            <Field label="No-shows" value={String(driver.noShowCount)} />
          </Card>

          <Card title="Vehicle & Tier Management">
            {driver.vehicle ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-sm text-zinc-500">Current Tier</span>
                  <TierBadge tier={driver.vehicle.tier || "economy"} />
                </div>
                <Field
                  label="Vehicle"
                  value={`${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.year})`}
                />
                <Field label="Colour" value={driver.vehicle.colour} />
                <Field label="Registration" value={driver.vehicle.registrationNumber} />
                <Field label="PHV plate no." value={driver.vehicle.phvLicencePlateNumber} />
                <Field label="Licensing authority" value={driver.vehicle.phvLicensingAuthority} />

                {/* Admin Direct Tier Change */}
                <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Set Tier Override
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                      disabled={busy}
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="economy">Economy (1.0x)</option>
                      <option value="comfort">Comfort (1.35x)</option>
                      <option value="xl">XL (1.7x)</option>
                      <option value="premium">Premium (2.1x)</option>
                    </select>
                    <button
                      onClick={updateVehicleTier}
                      disabled={busy || selectedTier === (driver.vehicle.tier || "economy").toLowerCase()}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No vehicle registered yet.</p>
            )}
          </Card>
        </div>

        {/* Right: documents & appeals */}
        <div className="space-y-5 lg:col-span-2">
          <Card title="Documents">
            {driver.documents.length === 0 ? (
              <p className="text-sm text-zinc-400">No documents uploaded yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {driver.documents.map((doc: DocumentSummary) => (
                  <li key={doc.id} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {DOC_LABELS[doc.type] ?? doc.type}
                        </p>
                        <p className="truncate text-xs text-zinc-500">{doc.originalFileName}</p>
                      </div>
                      <ExpiryBadge expiresOn={doc.expiresOn} />
                      <ReviewBadge status={doc.reviewStatus} />
                      <button
                        onClick={() => setPreview(doc)}
                        className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => reviewDoc(doc, "Approved")}
                        disabled={busy || doc.reviewStatus === "Approved"}
                        className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reviewDoc(doc, "Rejected")}
                        disabled={busy || doc.reviewStatus === "Rejected"}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>

                    {/* Deletion Request Highlight */}
                    {doc.isDeletionRequested && (
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-red-800">Deletion Requested by Driver</span>
                          {doc.deletionReason && (
                            <p className="text-red-700 mt-0.5">
                              <span className="font-semibold">Reason: </span>
                              {doc.deletionReason}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => reviewDeletion(doc, "Approved")}
                            disabled={busy}
                            className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
                          >
                            Approve Deletion (Delete)
                          </button>
                          <button
                            onClick={() => reviewDeletion(doc, "Rejected")}
                            disabled={busy}
                            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
                          >
                            Reject Request
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Tier Appeals History */}
          <Card title="Vehicle Tier Appeals">
            {appeals.length === 0 ? (
              <p className="text-sm text-zinc-400">No tier appeals submitted by this driver.</p>
            ) : (
              <div className="space-y-3">
                {appeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TierBadge tier={appeal.currentTier} />
                        <span className="text-xs text-zinc-400">→</span>
                        <TierBadge tier={appeal.requestedTier} />
                        <span className="text-xs text-zinc-400">
                          {new Date(appeal.createdAtUtc).toLocaleDateString()}
                        </span>
                      </div>
                      <ReviewBadge status={appeal.status} />
                    </div>

                    <div className="mt-2 text-sm text-zinc-700">
                      <span className="font-semibold text-zinc-900">Driver Reason: </span>
                      {appeal.reason}
                    </div>

                    {appeal.photoUrls && appeal.photoUrls.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {appeal.photoUrls.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setPhotoPreview({
                                url: adminDriverReview.appealPhotoUrl(appeal.id, idx),
                                title: `Car Photo ${idx + 1} (${appeal.requestedTier.toUpperCase()})`,
                              })
                            }
                            className="group relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 hover:opacity-90"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={adminDriverReview.appealPhotoUrl(appeal.id, idx)}
                              alt="Car photo"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                              <span className="text-[10px] font-bold text-white">View</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {appeal.adminNotes && (
                      <p className="mt-2 rounded-lg bg-zinc-50 p-2 text-xs text-zinc-600">
                        <span className="font-semibold text-zinc-800">Admin Note: </span>
                        {appeal.adminNotes}
                      </p>
                    )}

                    {appeal.status === "Pending" && (
                      <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3">
                        <button
                          onClick={() => {
                            setReviewingAppeal(appeal);
                            setAppealDecision("Approved");
                            setAdminNotes("");
                          }}
                          disabled={busy}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-40"
                        >
                          Approve Appeal
                        </button>
                        <button
                          onClick={() => {
                            setReviewingAppeal(appeal);
                            setAppealDecision("Rejected");
                            setAdminNotes("");
                          }}
                          disabled={busy}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                        >
                          Reject Appeal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Driver overall decision */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-700">Driver status</p>
            <p className="mt-1 text-xs text-zinc-500">
              Only an <span className="font-semibold text-zinc-700">approved</span> driver can go
              online, see trip requests and accept trips. Suspending or rejecting takes them off
              the road immediately.
            </p>

            {unreviewedDocs > 0 && driver.status !== "Approved" && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                {unreviewedDocs} document{unreviewedDocs === 1 ? " is" : "s are"} still unreviewed —
                check each one above before approving this driver.
              </p>
            )}

            {!driver.hasProfilePicture && driver.status !== "Approved" && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                This driver hasn&apos;t uploaded a profile picture — required before approval.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStatus("Approved")}
                disabled={busy || driver.status === "Approved" || !driver.hasProfilePicture}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-40"
              >
                Approve driver
              </button>
              <button
                onClick={() => setStatus("Suspended")}
                disabled={busy || driver.status === "Suspended"}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
              >
                Suspend
              </button>
              <button
                onClick={() => setStatus("Rejected")}
                disabled={busy || driver.status === "Rejected"}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {preview && <DocumentPreview doc={preview} onClose={() => setPreview(null)} />}

      {photoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          onClick={() => setPhotoPreview(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
              <p className="text-sm font-semibold text-zinc-900">{photoPreview.title}</p>
              <button onClick={() => setPhotoPreview(null)} className="text-zinc-400 hover:text-zinc-700">
                ✕
              </button>
            </div>
            <div className="flex items-center justify-center bg-zinc-950 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview.url}
                alt={photoPreview.title}
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Appeal Review Modal */}
      {reviewingAppeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setReviewingAppeal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-zinc-900">
              {appealDecision} Tier Appeal
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Requested: {reviewingAppeal.currentTier.toUpperCase()} → {reviewingAppeal.requestedTier.toUpperCase()}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700">
                Decision
              </label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAppealDecision("Approved")}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                    appealDecision === "Approved"
                      ? "bg-green-600 text-white"
                      : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Approve (Upgrade to {reviewingAppeal.requestedTier.toUpperCase()})
                </button>
                <button
                  type="button"
                  onClick={() => setAppealDecision("Rejected")}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                    appealDecision === "Rejected"
                      ? "bg-red-600 text-white"
                      : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Decline
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700">
                Admin Notes (sent to driver via email & push)
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional feedback or rationale for the driver..."
                className="mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewingAppeal(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAppealReview}
                disabled={busy}
                className={`rounded-lg px-4 py-2 text-xs font-bold text-white transition ${
                  appealDecision === "Approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-40`}
              >
                {busy ? "Saving..." : `Confirm ${appealDecision}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/admin/drivers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
      ← Back to drivers
    </Link>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-900">{value || "—"}</span>
    </div>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const t = (tier || "economy").toLowerCase();
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    economy: { bg: "bg-slate-100", text: "text-slate-800", label: "Economy" },
    comfort: { bg: "bg-blue-50", text: "text-blue-700", label: "Comfort" },
    xl: { bg: "bg-emerald-50", text: "text-emerald-700", label: "XL" },
    premium: { bg: "bg-amber-50", text: "text-amber-700", label: "Premium" },
  };
  const conf = styles[t] ?? { bg: "bg-zinc-100", text: "text-zinc-700", label: tier };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${conf.bg} ${conf.text}`}>
      {conf.label}
    </span>
  );
}

const NOW_MS = Date.now();

function ExpiryBadge({ expiresOn }: { expiresOn?: string }) {
  if (!expiresOn) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((new Date(expiresOn).getTime() - NOW_MS) / msPerDay);

  if (daysLeft < 0) {
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        Expired
      </span>
    );
  }
  if (daysLeft <= 30) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        Expiring soon
      </span>
    );
  }
  return null;
}

function OnlineIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isOnline ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-zinc-400"}`}
      />
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

function ReviewBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-zinc-100 text-zinc-600"}`}>
      {status}
    </span>
  );
}

function DocumentPreview({ doc, onClose }: { doc: DocumentSummary; onClose: () => void }) {
  const url = adminDriverReview.documentContentUrl(doc.id);
  const isPdf = doc.originalFileName.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
          <p className="truncate text-sm font-semibold text-zinc-900">{doc.originalFileName}</p>
          <div className="flex items-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Open in new tab
            </a>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
              ✕
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-zinc-50 p-4">
          {isPdf ? (
            <iframe src={url} title={doc.originalFileName} className="h-[70vh] w-full rounded-lg border border-zinc-200" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={doc.originalFileName} className="mx-auto max-h-[70vh] rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}
