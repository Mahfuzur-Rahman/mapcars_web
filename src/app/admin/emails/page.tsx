"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminAuth,
  adminEmails,
  ApiError,
  type EmailLogDetail,
  type EmailLogListItem,
  type EmailLogPage,
} from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  Icon,
  Input,
  Page,
  PageHeader,
  Select,
  Skeleton,
  SlideOver,
} from "@/components/ui";
import RichTextEditor from "./RichTextEditor";

interface FromOption {
  address: string;
  name?: string;
}

const STATIC_FROM_OPTIONS: FromOption[] = [
  { address: "no-reply@mapcars.uk" },
  { address: "info@mapcars.uk" },
  { address: "hello@mapcars.uk" },
  { address: "admin@mapcars.uk" },
];

/** "Mahfuzur Rahman" → "mahfuzur.rahman@mapcars.uk" */
function slugAddress(fullName: string): string {
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${slug}@mapcars.uk`;
}

const PAGE_SIZE = 50;

export default function AdminEmailsPage() {
  const [adminName, setAdminName] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<EmailLogPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EmailLogDetail | null>(null);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    adminAuth
      .me()
      .then((res) => setAdminName(res.admin.fullName))
      .catch(() => {
        /* From dropdown just falls back to the 4 static addresses. */
      });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    adminEmails
      .list({
        category: category || undefined,
        status: status || undefined,
        search: applied || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load emails"))
      .finally(() => setLoading(false));
  }, [category, status, applied, page]);

  useEffect(load, [load]);

  async function openDetail(row: EmailLogListItem) {
    try {
      setSelected(await adminEmails.get(row.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load that entry");
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const fromOptions: FromOption[] = adminName
    ? [...STATIC_FROM_OPTIONS, { address: slugAddress(adminName), name: adminName }]
    : STATIC_FROM_OPTIONS;

  return (
    <Page>
      <PageHeader
        title="Email"
        subtitle="Every email the platform has sent — system and Compose — newest first."
        actions={
          <Button onClick={() => setComposing(true)}>
            <Icon name="mail" className="size-4" />
            Compose
          </Button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-auto"
        >
          <option value="">All categories</option>
          <option value="System">System</option>
          <option value="Compose">Compose</option>
        </Select>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-auto"
        >
          <option value="">Any status</option>
          <option value="Sent">Sent</option>
          <option value="Failed">Failed</option>
        </Select>

        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(search);
            setPage(1);
          }}
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search to, from, or subject…"
            className="w-64"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <Button variant="secondary" size="sm" className="ml-auto" onClick={load}>
          Refresh
        </Button>
      </div>

      <Card padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3">From</th>
              <th className="px-5 py-3">To</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-4">
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            )}

            {!loading &&
              data?.items.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-slate-50/60"
                  onClick={() => openDetail(row)}
                >
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-faint">
                    {new Date(row.createdAtUtc).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">{row.fromAddress}</td>
                  <td className="px-5 py-3.5 text-ink-muted">{row.toEmail}</td>
                  <td className="max-w-sm truncate px-5 py-3.5 font-medium text-ink">{row.subject}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={row.category === "Compose" ? "brand" : "neutral"}>{row.category}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={row.status === "Sent" ? "success" : "critical"}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {!loading && data?.items.length === 0 && (
          <EmptyState
            icon="mail"
            title="No emails yet"
            description="Sent mail — system or Compose — will show up here."
          />
        )}
      </Card>

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
          <span>
            Page {data.page} of {totalPages} · {data.total} entries
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selected && <DetailView entry={selected} onClose={() => setSelected(null)} />}

      {composing && (
        <ComposeForm
          fromOptions={fromOptions}
          onClose={() => setComposing(false)}
          onSent={() => {
            setComposing(false);
            load();
          }}
        />
      )}
    </Page>
  );
}

function DetailView({ entry, onClose }: { entry: EmailLogDetail; onClose: () => void }) {
  return (
    <SlideOver
      title={entry.subject}
      subtitle={`${entry.fromAddress} → ${entry.toEmail}`}
      onClose={onClose}
    >
      <div className="mb-4 flex items-center gap-2">
        <Badge tone={entry.category === "Compose" ? "brand" : "neutral"}>{entry.category}</Badge>
        <Badge tone={entry.status === "Sent" ? "success" : "critical"}>{entry.status}</Badge>
        <span className="text-xs text-ink-faint">{new Date(entry.createdAtUtc).toLocaleString()}</span>
      </div>

      {entry.errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {entry.errorMessage}
        </div>
      )}

      {/* Always our own backend copy or an admin's own Compose input — never customer/driver content. */}
      <div
        className="rounded-xl border border-line bg-slate-50/50 px-4 py-3.5 text-sm text-ink"
        dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
      />
    </SlideOver>
  );
}

function ComposeForm({
  fromOptions,
  onClose,
  onSent,
}: {
  fromOptions: FromOption[];
  onClose: () => void;
  onSent: () => void;
}) {
  const [to, setTo] = useState("");
  const [fromAddress, setFromAddress] = useState(fromOptions[0].address);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = to.trim() !== "" && subject.trim() !== "" && bodyHtml.trim() !== "" && !sending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError(null);
    try {
      const from = fromOptions.find((f) => f.address === fromAddress);
      await adminEmails.compose({
        to: to.trim(),
        subject: subject.trim(),
        bodyHtml,
        fromAddress,
        fromName: from?.name,
      });
      onSent();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send");
      setSending(false);
    }
  }

  return (
    <SlideOver
      title="Compose"
      subtitle="Send an ad-hoc email from a @mapcars.uk address"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={submit} loading={sending} disabled={!canSubmit}>
            Send
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <ErrorBanner message={error} />}

        <Field label="From" htmlFor="fromAddress">
          <Select id="fromAddress" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)}>
            {fromOptions.map((f) => (
              <option key={f.address} value={f.address}>
                {f.name ? `${f.name} <${f.address}>` : f.address}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="To" htmlFor="to">
          <Input
            id="to"
            type="email"
            required
            autoFocus
            autoComplete="off"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="someone@example.com"
          />
        </Field>

        <Field label="Subject" htmlFor="subject">
          <Input
            id="subject"
            required
            autoComplete="off"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
          />
        </Field>

        <Field label="Body" htmlFor="bodyHtml">
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} placeholder="Write your message…" />
        </Field>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </SlideOver>
  );
}
