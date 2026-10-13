"use client";

// Verify the SAVED profile email, shown under the Email field on the customer
// and driver "My info" pages. The API only emails receipts / earnings summaries
// to a verified address, and phone sign-ups add their email unverified.
//
// Verification always applies to the email the API has on file, so while the
// field holds an unsaved edit (`isDirty`) the verify affordance is hidden — the
// code would go to the old address, not the one on screen.
//
// This sits inside the parent's <form>, so it renders no <form> of its own:
// every button is type="button", and Enter in the code box is intercepted so it
// confirms the code instead of submitting the whole profile.

import { useEffect, useId, useState } from "react";
import { Badge, Button, Input } from "@/components/ui";
import { ApiError, type EmailCodeSentResponse } from "@/lib/api";
import { env } from "@/lib/env";

const RESEND_COOLDOWN_SECONDS = 30;

export default function EmailVerification({
  savedEmail,
  isVerified,
  isDirty,
  purpose,
  sendCode,
  verifyCode,
}: {
  /** The email the API has on file (not the form field's current value). */
  savedEmail?: string;
  isVerified: boolean;
  /** The Email field differs from `savedEmail` — verification must wait for a save. */
  isDirty: boolean;
  /** What a verified email unlocks, e.g. "trip receipts". */
  purpose: string;
  sendCode: () => Promise<EmailCodeSentResponse>;
  /** Confirms the code; the parent updates its profile from the response. Throws on failure. */
  verifyCode: (code: string) => Promise<void>;
}) {
  const id = useId();
  const codeId = `${id}-code`;
  const statusId = `${id}-status`;
  const errorId = `${id}-error`;

  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  // Tick the resend cooldown down once a second.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const res = await sendCode();
      setCodeSent(true);
      setMessage(res.message);
      setDevCode(env.isDev && res.devCode ? res.devCode : null);
      setCode("");
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    if (code.length !== 6 || verifying) return;
    setVerifying(true);
    setError(null);
    try {
      await verifyCode(code);
      // The parent now holds a verified profile, so this renders the badge.
      setCodeSent(false);
      setMessage(null);
      setDevCode(null);
      setCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't verify the code. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  if (isDirty) {
    return (
      <p className="mt-1.5 text-xs text-ink-faint">
        Save your changes, then verify this email to get {purpose} by email.
      </p>
    );
  }

  if (!savedEmail) {
    return (
      <p className="mt-1.5 text-xs text-ink-faint">Add an email to get {purpose} by email.</p>
    );
  }

  if (isVerified) {
    return (
      <div className="mt-2">
        <Badge tone="success" dot>
          Verified
        </Badge>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="warning" dot>
          Unverified
        </Badge>
        <p className="text-xs text-ink-muted">Verify your email to get {purpose} by email.</p>
      </div>

      {!codeSent && (
        <Button type="button" variant="secondary" loading={sending} onClick={handleSend}>
          {sending ? "Sending code…" : "Verify email"}
        </Button>
      )}

      {codeSent && (
        <div className="space-y-3 rounded-xl border border-line bg-app-bg p-4">
          {message && (
            <p id={statusId} role="status" aria-live="polite" className="text-sm text-ink-muted">
              {message}
            </p>
          )}

          {devCode && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs font-semibold text-amber-700">Dev mode</p>
              <p className="mt-0.5 text-base font-bold tracking-widest text-amber-800">{devCode}</p>
            </div>
          )}

          <div>
            <label htmlFor={codeId} className="mb-1.5 block text-[13px] font-semibold text-ink">
              6-digit code
            </label>
            <div className="flex gap-2">
              <Input
                id={codeId}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  // Don't let Enter submit the surrounding profile form.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleVerify();
                  }
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={[message ? statusId : null, error ? errorId : null]
                  .filter(Boolean)
                  .join(" ") || undefined}
                className="text-center font-bold tracking-[0.4em]"
              />
              <Button
                type="button"
                loading={verifying}
                disabled={code.length !== 6}
                onClick={handleVerify}
              >
                {verifying ? "Confirming…" : "Confirm"}
              </Button>
            </div>
          </div>

          {error && (
            <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || resendIn > 0}
            className="min-h-11 text-sm font-semibold text-brand-ink hover:underline disabled:cursor-not-allowed disabled:text-ink-faint disabled:no-underline"
          >
            {sending ? "Sending…" : resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      )}

      {!codeSent && error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
