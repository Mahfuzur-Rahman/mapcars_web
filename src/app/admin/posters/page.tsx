"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  adminPosters,
  posterImageUrl,
  type PosterResponse,
  type UpsertPosterFields,
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
  Skeleton,
  SlideOver,
} from "@/components/ui";

export default function AdminPostersPage() {
  const [posters, setPosters] = useState<PosterResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PosterResponse | "new" | null>(null);

  const load = useCallback(() => {
    adminPosters
      .list()
      .then((res) => {
        setPosters(res);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load posters"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(poster: PosterResponse) {
    if (!window.confirm(`Delete "${poster.title || "this poster"}"? This can't be undone.`)) return;
    try {
      await adminPosters.remove(poster.id);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete poster");
    }
  }

  return (
    <Page>
      <PageHeader
        title="Posters"
        subtitle="Promo banners on the landing page, between Hero and Coverage. Up to 3 show as a static row — a 4th and beyond rotate automatically."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Icon name="image" className="size-4" />
            Add poster
          </Button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {!posters && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {posters?.length === 0 && (
        <Card>
          <EmptyState
            icon="image"
            title="No posters yet"
            description="Add up to 3 — a 4th and beyond will rotate automatically on the landing page."
            action={<Button onClick={() => setEditing("new")}>Add poster</Button>}
          />
        </Card>
      )}

      {posters && posters.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <Card key={poster.id} padded={false} className="overflow-hidden">
              <div className="aspect-video w-full bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterImageUrl(poster.id)}
                  alt={poster.title ?? "Poster"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="truncate font-display text-sm font-bold text-ink">
                    {poster.title || "Untitled"}
                  </p>
                  <Badge tone={poster.isActive ? "success" : "neutral"}>
                    {poster.isActive ? "Active" : "Hidden"}
                  </Badge>
                </div>
                {poster.subtitle && (
                  <p className="mb-2 line-clamp-2 text-xs text-ink-muted">{poster.subtitle}</p>
                )}
                <p className="mb-3 truncate text-xs text-ink-faint">
                  Order {poster.sortOrder}
                  {poster.linkUrl ? ` · links to ${poster.linkUrl}` : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(poster)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(poster)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <PosterForm
          poster={editing === "new" ? null : editing}
          nextSortOrder={posters?.length ?? 0}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </Page>
  );
}

// ── Create / edit form ───────────────────────────────────────────────────────

function PosterForm({
  poster,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  poster: PosterResponse | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = poster === null;
  const [title, setTitle] = useState(poster?.title ?? "");
  const [subtitle, setSubtitle] = useState(poster?.subtitle ?? "");
  const [linkUrl, setLinkUrl] = useState(poster?.linkUrl ?? "");
  const [sortOrder, setSortOrder] = useState(poster?.sortOrder ?? nextSortOrder);
  const [isActive, setIsActive] = useState(poster?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    poster ? posterImageUrl(poster.id) : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    setPreview(picked ? URL.createObjectURL(picked) : poster ? posterImageUrl(poster.id) : null);
  }

  const canSubmit = (isNew ? file !== null : true) && !saving;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);

    const fields: UpsertPosterFields = {
      title: title.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      linkUrl: linkUrl.trim() || undefined,
      sortOrder,
      isActive,
    };

    try {
      if (poster) {
        await adminPosters.update(poster.id, fields);
        if (file) await adminPosters.replaceImage(poster.id, file);
      } else {
        await adminPosters.create(file!, fields);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save poster");
      setSaving(false);
    }
  }

  return (
    <SlideOver
      title={isNew ? "Add poster" : "Edit poster"}
      subtitle="Shown on the landing page, between Hero and Coverage."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!canSubmit}>
            {isNew ? "Add poster" : "Save changes"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <ErrorBanner message={error} />}

        <Field label="Image" hint="JPG, PNG, WEBP or HEIC. Max 8 MB.">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="mb-2 h-36 w-full rounded-xl object-cover" />
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? "Replace image" : "Choose image"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={onFileChange}
          />
        </Field>

        <Field label="Title" htmlFor="posterTitle" hint="Optional.">
          <Input
            id="posterTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summer offer"
          />
        </Field>

        <Field label="Subtitle" htmlFor="posterSubtitle" hint="Optional.">
          <Input
            id="posterSubtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="20% off your next ride"
          />
        </Field>

        <Field
          label="Link URL"
          htmlFor="posterLink"
          hint="Optional — where the poster takes riders when clicked."
        >
          <Input
            id="posterLink"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://mapcars.uk/promo"
          />
        </Field>

        <Field label="Sort order" htmlFor="posterSort" hint="Lower numbers show first.">
          <Input
            id="posterSort"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </Field>

        <label className="flex items-center gap-2.5 rounded-lg px-1 py-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 rounded border-line-strong text-brand-ink focus:ring-brand/30"
          />
          <span className="text-sm text-ink">Active (visible on the landing page)</span>
        </label>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </SlideOver>
  );
}
