"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  adminDriverReview,
  ApiError,
  type DriverDocumentListItem,
} from "@/lib/api";

type FilterTab = "All" | "Pending" | "Approved" | "Rejected";

const DOC_LABELS: Record<string, string> = {
  PhvLicence: "PHV licence",
  VehicleInsurance: "Vehicle insurance",
  VehicleRegistration: "Vehicle registration",
  DbsCheck: "DBS check",
  Passport: "Passport",
  DrivingLicence: "Driving licence",
  VehicleBadge: "Vehicle PHV badge",
  BankStatement: "Bank statement",
  ProofOfAddress: "Utility bill",
  VehicleFrontPhoto: "Vehicle front photo",
  VehicleRearPhoto: "Vehicle rear photo",
  VehicleInteriorPhoto: "Vehicle interior photo",
};

const NOW_MS = Date.now();

function ExpiryBadge({ expiresOn }: { expiresOn?: string }) {
  if (!expiresOn) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((new Date(expiresOn).getTime() - NOW_MS) / msPerDay);

  if (daysLeft < 0) {
    return (
      <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        Expired
      </span>
    );
  }
  if (daysLeft <= 30) {
    return (
      <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        Expiring soon
      </span>
    );
  }
  return (
    <span className="text-xs text-zinc-500">
      Exp: {new Date(expiresOn).toLocaleDateString()}
    </span>
  );
}

function ReviewBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
      {status}
    </span>
  );
}

export default function AdminDriverDocumentsPage() {
  const [documents, setDocuments] = useState<DriverDocumentListItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("Pending");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<DriverDocumentListItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const statusParam = activeTab === "All" ? undefined : activeTab;
    adminDriverReview
      .listDocuments(statusParam)
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load driver documents");
        setLoading(false);
      });
  }, [activeTab]);

  useEffect(load, [load]);

  async function handleReviewDoc(doc: DriverDocumentListItem, status: "Approved" | "Rejected") {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await adminDriverReview.reviewDocument(doc.id, status);
      setSuccess(`Document ${doc.originalFileName} marked as ${status}.`);
      if (previewDoc?.id === doc.id) {
        setPreviewDoc(null);
      }
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Failed to mark document as ${status}`);
    } finally {
      setBusy(false);
    }
  }

  // Filter and search
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Type filter
      if (selectedType !== "All" && doc.type !== selectedType) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.driverName?.toLowerCase().includes(q);
        const matchesEmail = doc.driverEmail?.toLowerCase().includes(q);
        const matchesPhone = doc.driverPhone?.toLowerCase().includes(q);
        const matchesFile = doc.originalFileName.toLowerCase().includes(q);
        const matchesType = (DOC_LABELS[doc.type] ?? doc.type).toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesFile && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [documents, selectedType, searchQuery]);

  const counts = {
    pending: documents.filter((d) => d.reviewStatus === "Pending").length,
    approved: documents.filter((d) => d.reviewStatus === "Approved").length,
    rejected: documents.filter((d) => d.reviewStatus === "Rejected").length,
    total: documents.length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Driver Documents</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Review, verify, and approve driver licences, insurance, and vehicle certifications.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Uploads</p>
          <p className="mt-1 text-2xl font-black text-zinc-900">{counts.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending Review</p>
          <p className="mt-1 text-2xl font-black text-amber-600">{counts.pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Approved</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{counts.approved}</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Rejected</p>
          <p className="mt-1 text-2xl font-black text-red-600">{counts.rejected}</p>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex flex-wrap gap-2">
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
              {tab === "Pending" && counts.pending > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm focus:border-zinc-500 focus:outline-none"
          >
            <option value="All">All Document Types</option>
            {Object.entries(DOC_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search driver or file…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Notifications */}
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

      {/* Content Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-5 py-3">Driver</th>
              <th className="px-5 py-3">Document Type</th>
              <th className="px-5 py-3">File / Expiry</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Uploaded</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {!loading &&
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-zinc-50/80 transition">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-zinc-900">
                      {doc.driverName || <span className="text-zinc-400">Unnamed Driver</span>}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {doc.driverEmail || doc.driverPhone || "—"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-zinc-900">
                      {DOC_LABELS[doc.type] ?? doc.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="truncate max-w-[200px] text-xs font-mono text-zinc-600">
                      {doc.originalFileName}
                    </div>
                    <div className="mt-1">
                      <ExpiryBadge expiresOn={doc.expiresOn} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <ReviewBadge status={doc.reviewStatus} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">
                    {new Date(doc.createdAtUtc).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleReviewDoc(doc, "Approved")}
                        disabled={busy || doc.reviewStatus === "Approved"}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewDoc(doc, "Rejected")}
                        disabled={busy || doc.reviewStatus === "Rejected"}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                      >
                        Reject
                      </button>
                      <Link
                        href={`/admin/drivers/${doc.driverId}`}
                        className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                        title="View Driver Profile"
                      >
                        Profile
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && filteredDocs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-zinc-400">
                  No documents found in this category.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-zinc-400">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900 mb-2"></div>
                  <div>Loading documents…</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <div>
                <h3 className="font-bold text-zinc-900">
                  {DOC_LABELS[previewDoc.type] ?? previewDoc.type}
                </h3>
                <p className="text-xs text-zinc-500">
                  Uploaded by {previewDoc.driverName || "Driver"} • {previewDoc.originalFileName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={adminDriverReview.documentContentUrl(previewDoc.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Open in new tab
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-auto bg-zinc-50 p-6 flex items-center justify-center min-h-[300px]">
              {previewDoc.originalFileName.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={adminDriverReview.documentContentUrl(previewDoc.id)}
                  className="h-[60vh] w-full rounded-lg border border-zinc-200"
                  title={previewDoc.originalFileName}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={adminDriverReview.documentContentUrl(previewDoc.id)}
                  alt={previewDoc.originalFileName}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow"
                />
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <ReviewBadge status={previewDoc.reviewStatus} />
                <ExpiryBadge expiresOn={previewDoc.expiresOn} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReviewDoc(previewDoc, "Approved")}
                  disabled={busy || previewDoc.reviewStatus === "Approved"}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
                >
                  Approve Document
                </button>
                <button
                  onClick={() => handleReviewDoc(previewDoc, "Rejected")}
                  disabled={busy || previewDoc.reviewStatus === "Rejected"}
                  className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                >
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
