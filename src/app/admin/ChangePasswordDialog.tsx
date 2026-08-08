"use client";

import { useState } from "react";
import { adminAuth, ApiError } from "@/lib/api";
import { Button, ErrorBanner, Field, Icon, Input, SlideOver } from "@/components/ui";

/** Mirrors StrongPassword in CommonRules.cs so we fail fast, client-side. */
const RULES = [
  { label: "At least 8 characters", ok: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", ok: (p: string) => /[A-Z]/.test(p) },
  { label: "One digit", ok: (p: string) => /[0-9]/.test(p) },
];

export default function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pwOk = RULES.every((r) => r.ok(next));
  const matches = next !== "" && next === confirm;
  const canSubmit = current !== "" && pwOk && matches && !saving;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await adminAuth.changePassword(current, next);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <SlideOver title="Password changed" onClose={onClose}>
        <div className="flex items-start gap-2.5 rounded-xl bg-accent-tint px-4 py-3.5">
          <Icon name="check" className="mt-0.5 size-4 shrink-0 text-accent-ink" />
          <p className="text-sm font-medium text-accent-ink">
            Your password has been changed. Use it next time you sign in.
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </SlideOver>
    );
  }

  return (
    <SlideOver
      title="Change password"
      subtitle="Update the password for your own account"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!canSubmit}>
            Change password
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <ErrorBanner message={error} />}

        <Field label="Current password" htmlFor="currentPassword">
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPw ? "text" : "password"}
              required
              autoFocus
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide passwords" : "Show passwords"}
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-slate-50 hover:text-ink-muted"
            >
              <Icon name={showPw ? "eye-off" : "eye"} className="size-4" />
            </button>
          </div>
        </Field>

        <Field
          label="New password"
          htmlFor="newPassword"
          hint={
            <ul className="space-y-1">
              {RULES.map((r) => {
                const ok = r.ok(next);
                return (
                  <li
                    key={r.label}
                    className={`flex items-center gap-1.5 ${ok ? "text-accent-ink" : ""}`}
                  >
                    <Icon
                      name={ok ? "check" : "close"}
                      className={`size-3 ${ok ? "text-accent-ink" : "text-ink-faint"}`}
                    />
                    {r.label}
                  </li>
                );
              })}
            </ul>
          }
        >
          <Input
            id="newPassword"
            type={showPw ? "text" : "password"}
            required
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <Field
          label="Confirm new password"
          htmlFor="confirmPassword"
          error={confirm !== "" && !matches ? "Doesn't match the new password." : undefined}
        >
          <Input
            id="confirmPassword"
            type={showPw ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </SlideOver>
  );
}
