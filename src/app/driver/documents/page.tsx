"use client";

import { useEffect, useState } from "react";
import {
  driverDocuments,
  ApiError,
  type DocumentSummary,
  type DriverDocumentType,
} from "@/lib/api";

const TYPES: { value: DriverDocumentType; label: string; hint: string }[] = [
  { value: "PhvLicence", label: "PHV driver licence", hint: "TfL / local authority private hire licence" },
  { value: "VehicleInsurance", label: "Private hire insurance", hint: "Valid hire and reward certificate" },
  { value: "VehicleRegistration", label: "Vehicle V5C / logbook", hint: "Vehicle registration certificate" },
  { value: "DbsCheck", label: "DBS check certificate", hint: "Enhanced criminal record check" },
  { value: "VehicleFrontPhoto", label: "Vehicle — front view", hint: "Clear photo showing plate & front" },
  { value: "VehicleRearPhoto", label: "Vehicle — rear view", hint: "Clear photo showing plate & rear" },
  { value: "VehicleInteriorPhoto", label: "Vehicle — interior seats", hint: "Clean interior and passenger seating" },
  { value: "Passport", label: "Passport", hint: "Valid photo page" },
  { value: "DrivingLicence", label: "DVLA driving licence", hint: "Photocard driving licence" },
  { value: "VehicleBadge", label: "Vehicle PHV badge", hint: "Council vehicle licence plate/disc" },
  { value: "BankStatement", label: "Bank statement", hint: "Recent statement for payouts" },
  { value: "ProofOfAddress", label: "Utility bill / address proof", hint: "Dated within last 3 months" },
];

const EXPIRING_TYPES: DriverDocumentType[] = [
  "PhvLicence",
  "VehicleInsurance",
  "VehicleRegistration",
  "DbsCheck",
  "Passport",
  "DrivingLicence",
  "VehicleBadge",
];

const DOC_LABEL_MAP = Object.fromEntries(TYPES.map((t) => [t.value, t.label]));

export default function DriverDocumentsPage() {
  const [docs, setDocs] = useState<DocumentSummary[] | null>(null);
  const [type, setType] = useState<DriverDocumentType>("PhvLicence");
  const [file, setFile] = useState<File | null>(null);
  const [expiresOn, setExpiresOn] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState<DocumentSummary | null>(null);

  // Request deletion state
  const [deletingDoc, setDeletingDoc] = useState<DocumentSummary | null>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [submittingDeletion, setSubmittingDeletion] = useState(false);

  const requiresExpiry = EXPIRING_TYPES.includes(type);

  function refresh() {
    driverDocuments
      .list()
      .then(setDocs)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load documents"));
  }

  useEffect(refresh, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (requiresExpiry && !expiresOn.trim()) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      await driverDocuments.upload(type, file, requiresExpiry ? expiresOn : undefined);
      setFile(null);
      setExpiresOn("");
      setSuccess("Document uploaded successfully! It is now under admin review.");
      setTimeout(() => setSuccess(null), 5000);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRequestDeletion() {
    if (!deletingDoc) return;
    setSubmittingDeletion(true);
    setError(null);
    try {
      await driverDocuments.requestDeletion(deletingDoc.id, deletionReason.trim() || undefined);
      setDeletingDoc(null);
      setDeletionReason("");
      setSuccess("Deletion request submitted to admin.");
      setTimeout(() => setSuccess(null), 5000);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit deletion request");
    } finally {
      setSubmittingDeletion(false);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Driver Documents</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload and manage your required licences, vehicle documents, and compliance records.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Upload Form */}
      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 mb-1">Upload New Document</h2>
        <p className="text-xs text-zinc-500 mb-4">
          You can upload as many documents as needed (e.g. renewals or additional vehicle photos).
        </p>

        <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700">Document Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as DriverDocumentType);
                setExpiresOn("");
              }}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700">Select File</label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-zinc-600 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200"
            />
          </div>

          {requiresExpiry && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-700">Expiry Date *</label>
              <input
                type="date"
                required
                value={expiresOn}
                onChange={(e) => setExpiresOn(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={uploading || !file || (requiresExpiry && !expiresOn.trim())}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload Document"}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900">Your Uploaded Documents</h2>
          <span className="text-xs font-medium text-zinc-500">
            {docs ? `${docs.length} file${docs.length === 1 ? "" : "s"} uploaded` : "Loading..."}
          </span>
        </div>

        {docs !== null && docs.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            No documents uploaded yet. Use the form above to add your first document.
          </div>
        ) : docs !== null ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5">Document Type</th>
                  <th className="px-5 py-3.5">File Name</th>
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Uploaded</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-5 py-3.5 font-bold text-zinc-900">
                      {DOC_LABEL_MAP[d.type] ?? d.type}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 font-mono">
                      {d.originalFileName}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {d.expiresOn ? (
                        <ExpiryBadge expiresOn={d.expiresOn} />
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <ReviewBadge status={d.reviewStatus} />
                        {d.isDeletionRequested && (
                          <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            Deletion Requested
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">
                      {new Date(d.createdAtUtc).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(d)}
                        className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingDoc(d);
                          setDeletionReason("");
                        }}
                        disabled={d.isDeletionRequested}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                      >
                        {d.isDeletionRequested ? "Deletion Pending" : "Request Deletion"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-400">Loading documents…</div>
        )}
      </div>

      {/* Document Preview Lightbox */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  {DOC_LABEL_MAP[previewDoc.type] ?? previewDoc.type}
                </p>
                <p className="text-xs text-zinc-500">{previewDoc.originalFileName}</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={driverDocuments.contentUrl(previewDoc.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Open in new tab
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-zinc-950 p-4 flex items-center justify-center min-h-[300px]">
              {previewDoc.originalFileName.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={driverDocuments.contentUrl(previewDoc.id)}
                  title={previewDoc.originalFileName}
                  className="h-[70vh] w-full rounded-lg border border-zinc-800 bg-white"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={driverDocuments.contentUrl(previewDoc.id)}
                  alt={previewDoc.originalFileName}
                  className="max-h-[70vh] max-w-full rounded-lg object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Deletion Modal */}
      {deletingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setDeletingDoc(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-zinc-900">Request Document Deletion</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Document: <span className="font-semibold text-zinc-800">{DOC_LABEL_MAP[deletingDoc.type] ?? deletingDoc.type}</span> ({deletingDoc.originalFileName})
            </p>
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
              Per platform compliance policy, drivers cannot delete documents directly. Submitting this request sends it to the admin team for review and approval.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700">
                Reason for deletion request (Optional)
              </label>
              <textarea
                rows={3}
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="e.g. Uploaded wrong document, replacing with updated policy..."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 p-3 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestDeletion}
                disabled={submittingDeletion}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-40"
              >
                {submittingDeletion ? "Submitting..." : "Submit Deletion Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${styles[status] ?? "border-zinc-200 bg-zinc-100 text-zinc-600"}`}>
      {status}
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
      <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">
        Expired ({expiresOn})
      </span>
    );
  }
  if (daysLeft <= 30) {
    return (
      <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        Expiring soon ({expiresOn})
      </span>
    );
  }
  return <span className="text-xs text-zinc-600">{expiresOn}</span>;
}
