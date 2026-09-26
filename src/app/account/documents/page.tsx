"use client";

import { useEffect, useState } from "react";
import {
  customerDocuments,
  ApiError,
  type DocumentSummary,
  type CustomerDocumentType,
} from "@/lib/api";

const TYPES: { value: CustomerDocumentType; label: string }[] = [
  { value: "ProofOfIdentity", label: "Proof of identity" },
  { value: "ProofOfAddress", label: "Proof of address" },
];

export default function CustomerDocumentsPage() {
  const [docs, setDocs] = useState<DocumentSummary[] | null>(null);
  const [type, setType] = useState<CustomerDocumentType>("ProofOfIdentity");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    customerDocuments
      .list()
      .then(setDocs)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load documents"));
  }

  useEffect(refresh, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await customerDocuments.upload(type, file);
      setFile(null);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Documents</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload identity verification documents for your account.
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Document type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CustomerDocumentType)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">File</label>
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={uploading || !file}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {docs !== null && docs.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No documents uploaded yet.
        </div>
      )}

      {docs !== null && docs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-zinc-50 last:border-0">
                  <td className="px-4 py-3 text-zinc-900">{d.type}</td>
                  <td className="px-4 py-3 text-zinc-600">{d.originalFileName}</td>
                  <td className="px-4 py-3 text-zinc-600">{d.reviewStatus}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(d.createdAtUtc).toLocaleDateString()}
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
