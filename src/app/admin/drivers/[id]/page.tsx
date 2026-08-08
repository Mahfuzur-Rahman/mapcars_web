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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<DocumentSummary | null>(null);

  const load = useCallback(() => {
    adminDriverReview
      .getDriver(driverId)
      .then(setDriver)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load driver"));
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

  // Documents the admin hasn't ruled on yet — approving over these is allowed
  // (the decision is the admin's), but it should never be accidental.
  const unreviewedDocs = driver.documents.filter((d) => d.reviewStatus === "Pending").length;

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

          <Card title="Vehicle">
            {driver.vehicle ? (
              <>
                <Field
                  label="Vehicle"
                  value={`${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.year})`}
                />
                <Field label="Colour" value={driver.vehicle.colour} />
                <Field label="Registration" value={driver.vehicle.registrationNumber} />
                <Field label="PHV plate no." value={driver.vehicle.phvLicencePlateNumber} />
                <Field label="Licensing authority" value={driver.vehicle.phvLicensingAuthority} />
              </>
            ) : (
              <p className="text-sm text-zinc-400">No vehicle registered yet.</p>
            )}
          </Card>
        </div>

        {/* Right: documents (spans two columns) */}
        <div className="lg:col-span-2">
          <Card title="Documents">
            {driver.documents.length === 0 ? (
              <p className="text-sm text-zinc-400">No documents uploaded yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {driver.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 py-3">
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
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Driver decision */}
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
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

            <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatus("Approved")}
              disabled={busy || driver.status === "Approved"}
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

// Reference timestamp for expiry comparisons, read once at module load (not
// during render) — components must be pure, and Date.now() is non-deterministic.
const NOW_MS = Date.now();

// Client-side only — compares expiresOn to today, no server round-trip needed.
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
