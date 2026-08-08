"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminErrorLogs,
  ApiError,
  type ErrorLogDetail,
  type ErrorLogListItem,
  type ErrorLogPage,
  type ErrorLogSummary,
} from "@/lib/api";

const SOURCES = ["Api", "Web", "CustomerApp", "DriverApp"] as const;
const LEVELS = ["Error", "Warning", "Fatal"] as const;

const SOURCE_LABELS: Record<string, string> = {
  Api: "API",
  Web: "Web",
  CustomerApp: "Rider app",
  DriverApp: "Driver app",
};

const PAGE_SIZE = 50;

export default function AdminErrorLogsPage() {
  const [source, setSource] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [resolved, setResolved] = useState<"" | "true" | "false">("false");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ErrorLogPage | null>(null);
  const [summary, setSummary] = useState<ErrorLogSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ErrorLogDetail | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminErrorLogs.list({
        source: source || undefined,
        level: level || undefined,
        resolved: resolved === "" ? undefined : resolved === "true",
        search: applied || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
      adminErrorLogs.summary(),
    ])
      .then(([listed, counts]) => {
        setData(listed);
        setSummary(counts);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load error logs"))
      .finally(() => setLoading(false));
  }, [source, level, resolved, applied, page]);

  useEffect(load, [load]);

  async function openDetail(row: ErrorLogListItem) {
    try {
      setSelected(await adminErrorLogs.get(row.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load that entry");
    }
  }

  async function toggleResolved(row: ErrorLogListItem | ErrorLogDetail) {
    try {
      await adminErrorLogs.setResolved(row.id, !row.isResolved);
      setSelected(null);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update that entry");
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Error Logger</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Every failure across the API, the web app and both mobile apps, newest first.
        </p>
      </div>

      {summary && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Unresolved" value={summary.unresolved} tone="amber" />
          <Stat label="Last 24 hours" value={summary.lastDay} tone="blue" />
          <Stat label="Errors" value={summary.errorLevel} tone="red" />
          <Stat label="Warnings" value={summary.warningLevel} tone="zinc" />
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={source}
          onChange={(v) => {
            setSource(v);
            setPage(1);
          }}
          placeholder="All sources"
          options={SOURCES.map((s) => ({ value: s, label: SOURCE_LABELS[s] }))}
        />
        <Select
          value={level}
          onChange={(v) => {
            setLevel(v);
            setPage(1);
          }}
          placeholder="All levels"
          options={LEVELS.map((l) => ({ value: l, label: l }))}
        />
        <Select
          value={resolved}
          onChange={(v) => {
            setResolved(v as "" | "true" | "false");
            setPage(1);
          }}
          placeholder="Any state"
          options={[
            { value: "false", label: "Unresolved" },
            { value: "true", label: "Resolved" },
          ]}
        />

        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(search);
            setPage(1);
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search message, type or path…"
            className="w-64 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Search
          </button>
        </form>

        <button
          onClick={load}
          className="ml-auto rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Refresh
        </button>
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
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Level</th>
              <th className="px-5 py-3">Message</th>
              <th className="px-5 py-3">Where</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                  Loading…
                </td>
              </tr>
            )}

            {!loading &&
              data?.items.map((row) => (
                <tr
                  key={row.id}
                  className={`cursor-pointer hover:bg-zinc-50 ${row.isResolved ? "opacity-50" : ""}`}
                  onClick={() => openDetail(row)}
                >
                  <td className="whitespace-nowrap px-5 py-3 text-xs text-zinc-500">
                    {new Date(row.createdAtUtc).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                      {SOURCE_LABELS[row.source] ?? row.source}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <LevelBadge level={row.level} />
                  </td>
                  <td className="max-w-md px-5 py-3">
                    <p className="truncate font-medium text-zinc-900">{row.message}</p>
                    {row.exceptionType && (
                      <p className="truncate text-xs text-zinc-400">{row.exceptionType}</p>
                    )}
                  </td>
                  <td className="max-w-[16rem] px-5 py-3">
                    <p className="truncate text-xs text-zinc-600">{row.path || "—"}</p>
                    {row.statusCode !== null && (
                      <p className="text-xs text-zinc-400">HTTP {row.statusCode}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleResolved(row);
                      }}
                      className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                    >
                      {row.isResolved ? "Reopen" : "Resolve"}
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && data && data.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                  Nothing logged for these filters. That&rsquo;s good news.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Page {data.page} of {totalPages} · {data.total} entries
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selected && (
        <DetailDrawer
          entry={selected}
          onClose={() => setSelected(null)}
          onToggleResolved={() => toggleResolved(selected)}
        />
      )}
    </div>
  );
}

function DetailDrawer({
  entry,
  onClose,
  onToggleResolved,
}: {
  entry: ErrorLogDetail;
  onClose: () => void;
  onToggleResolved: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <LevelBadge level={entry.level} />
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                {SOURCE_LABELS[entry.source] ?? entry.source}
              </span>
              <span className="text-xs text-zinc-400">
                {new Date(entry.createdAtUtc).toLocaleString()}
              </span>
            </div>
            <h2 className="break-words text-base font-bold text-zinc-900">{entry.message}</h2>
            {entry.exceptionType && (
              <p className="mt-1 text-xs text-zinc-500">{entry.exceptionType}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 border-b border-zinc-100 p-5">
          <Field label="Path" value={entry.path} />
          <Field label="Method" value={entry.httpMethod} />
          <Field label="Status" value={entry.statusCode?.toString()} />
          <Field label="User" value={entry.userType ? `${entry.userType} ${entry.userId ?? ""}` : null} />
          <Field label="App version" value={entry.appVersion} />
          <Field label="Platform" value={entry.platform} />
          <Field label="IP" value={entry.ipAddress} />
          <Field label="Correlation" value={entry.correlationId} />
        </div>

        {entry.stackTrace && (
          <div className="p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Stack trace
            </p>
            <pre className="max-h-96 overflow-auto rounded-lg bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100">
              {entry.stackTrace}
            </pre>
          </div>
        )}

        <div className="mt-auto border-t border-zinc-100 p-5">
          <button
            onClick={onToggleResolved}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {entry.isResolved ? "Reopen this error" : "Mark as resolved"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Fatal: "bg-red-100 text-red-800",
    Error: "bg-red-50 text-red-700",
    Warning: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[level] ?? "bg-zinc-100 text-zinc-600"}`}
    >
      {level}
    </span>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    amber: "text-amber-600",
    blue: "text-blue-600",
    red: "text-red-600",
    zinc: "text-zinc-600",
  };
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-1.5 text-sm">
      <span className="text-xs text-zinc-500">{label}</span>
      <p className="break-words font-medium text-zinc-900">{value || "—"}</p>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 outline-none focus:border-blue-400"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
