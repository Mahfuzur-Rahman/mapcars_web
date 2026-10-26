"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { customerAuth, ApiError, type CustomerSession } from "@/lib/api";
import { env } from "@/lib/env";

// Fallback cooldown when the server didn't say (email resends, or an old API).
const DEFAULT_RESEND_SECONDS = 60;

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();

  const phone = params.get("phone");
  const email = params.get("email");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Seconds until "Resend code" is allowed. Started from the server's
  // resendAfterSeconds (?wait=), and restarted from retryAfterSeconds on a 429.
  const [initialWait] = useState(() => Number(params.get("wait")) || DEFAULT_RESEND_SECONDS);
  const [secondsLeft, setSecondsLeft] = useState(initialWait);
  const [resending, setResending] = useState(false);
  // Dev-only: the API echoes the code back; show it to speed up local testing.
  const [devCode, setDevCode] = useState<string | null>(params.get("dev"));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ticks secondsLeft down to 0. The starting value is set by the caller.
  const runTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const startCountdown = useCallback(
    (seconds: number) => {
      setSecondsLeft(seconds);
      runTimer();
    },
    [runTimer],
  );

  useEffect(() => {
    // secondsLeft already starts at initialWait; just start ticking.
    runTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [runTimer]);

  const label = phone ? `+44${phone.replace("+44", "")}` : email ?? "";
  const canResend = secondsLeft === 0;
  const mmss = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let res: CustomerSession;
      if (phone) {
        res = await customerAuth.verifyPhone(phone, code);
      } else if (email) {
        res = await customerAuth.verifyEmail(email, code);
      } else {
        setError("Missing phone or email");
        return;
      }
      router.push(res.isProfileComplete ? "/" : "/auth/profile");
      router.refresh();
    } catch (err) {
      // A wrong code is cleared, so the next attempt starts from empty boxes.
      setCode("");
      setError(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      const res = phone
        ? await customerAuth.sendOtp(phone)
        : await customerAuth.resendEmail(email!);
      setCode("");
      setDevCode(env.isDev && res.devCode ? res.devCode : null);
      startCountdown(res.resendAfterSeconds ?? DEFAULT_RESEND_SECONDS);
      setInfo("A new code has been sent.");
    } catch (err) {
      if (err instanceof ApiError && err.retryAfterSeconds) startCountdown(err.retryAfterSeconds);
      setError(err instanceof ApiError ? err.message : "Could not resend the code");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Enter the code
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Sent to <span className="font-medium text-zinc-700">{label}</span>
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
        >
          {devCode && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700">Dev mode</p>
              <p className="mt-0.5 text-lg font-bold tracking-widest text-amber-800">
                {devCode}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {info && !error && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {info}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-center text-xl font-bold tracking-[0.4em] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !canResend}
            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-zinc-400"
          >
            {resending ? (
              "Sending…"
            ) : canResend ? (
              "Resend code"
            ) : (
              <>
                Resend code in <span className="tabular-nums">{mmss}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-center text-sm text-zinc-400 hover:text-zinc-600"
          >
            ← Back
          </button>
        </form>
      </div>
    </div>
  );
}

// useSearchParams requires a Suspense boundary in the Next.js App Router.
export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
