"use client";

import "../auth.css";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { passwordReset, ApiError, type ResettableUserType } from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";

type Step = "request" | "reset" | "done";

// Mirrors CommonRules.StrongPassword on the API. The API is still the
// authority — this only saves a round trip and shows progress while typing.
const RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
];

// The API issues reset codes valid for 15 minutes (OtpService.ResetExpiryMinutes).
const CODE_TTL_MINUTES = 15;

const IC = {
  warn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ),
};

/** 429 gets its own copy — the API's rate limiter sends no message of its own. */
function messageFor(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return "Too many attempts from this device. Please wait about 15 minutes and try again.";
    }
    return err.message;
  }
  return fallback;
}

function ForgotPasswordFlow() {
  const params = useSearchParams();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [userType, setUserType] = useState<ResettableUserType>(
    params.get("as") === "driver" ? "driver" : "customer",
  );

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      await passwordReset.forgot(email.trim(), userType);
      setCode("");
      setStep("reset");
      setNotice(
        `If a ${userType} account exists for ${email.trim()}, we've emailed it a 6-digit code. It expires in ${CODE_TTL_MINUTES} minutes.`,
      );
    } catch (err) {
      setError(messageFor(err, "We couldn't send a code. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  const rulesMet = RULES.every((r) => r.test(password));
  const mismatch = confirm.length > 0 && confirm !== password;

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    if (!rulesMet) {
      setError("Your new password doesn't meet the rules below yet.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await passwordReset.reset(email.trim(), userType, code, password);
      setStep("done");
      setNotice(null);
    } catch (err) {
      setError(messageFor(err, "We couldn't reset your password. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setStep("request");
    setCode("");
    setPassword("");
    setConfirm("");
    setError(null);
    setNotice(null);
  }

  const title =
    step === "request" ? "Forgot password" : step === "reset" ? "Set a new password" : "Password updated";
  const sub =
    step === "request"
      ? "Tell us which account it is and we'll email you a code to reset it."
      : step === "reset"
        ? "Enter the code from the email and choose a new password."
        : "You've been signed out on every device. Sign in with your new password.";

  return (
    <AuthShell
      headlineLead="Get back into"
      headlineHighlight="MapCars"
      tagline="Reset your password with a one-time code sent to your email."
    >
      <Link href="/auth/login" className="auth-back">
        {IC.back}
        Back to sign in
      </Link>

      <h2 className="auth-title">{title}</h2>
      <p className="auth-sub">{sub}</p>

      {error && (
        <div className="auth-error" role="alert">
          {IC.warn}
          <span>{error}</span>
        </div>
      )}
      {notice && !error && (
        <div className="auth-notice" role="status">
          {IC.check}
          <span>{notice}</span>
        </div>
      )}

      {step === "request" && (
        <form className="auth-form" onSubmit={sendCode}>
          <div className="auth-field">
            <span className="auth-label" id="account-type-label">
              Account type
            </span>
            <div className="auth-tabs is-flush" role="radiogroup" aria-labelledby="account-type-label">
              {(["customer", "driver"] as ResettableUserType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={userType === t}
                  className={`auth-tab${userType === t ? " active" : ""}`}
                  onClick={() => setUserType(t)}
                >
                  {t === "customer" ? "I'm a customer" : "I'm a driver"}
                </button>
              ))}
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Email address
            </label>
            <div className="auth-input-wrap">
              <input
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading || !email.trim()}>
            {loading ? <span className="auth-spinner" /> : <>Email me a code {IC.arrow}</>}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form className="auth-form" onSubmit={submitReset}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="code">
              6-digit code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              className="auth-input auth-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="new-password">
              New password
            </label>
            <div className="auth-input-wrap">
              <input
                id="new-password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="new-password"
                className="auth-input has-toggle"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-rules"
              />
              <button
                type="button"
                className="auth-pw-toggle"
                aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? IC.eyeOff : IC.eye}
              </button>
            </div>
            <ul className="auth-rules" id="password-rules">
              {RULES.map((r) => (
                <li key={r.label} className={r.test(password) ? "ok" : undefined}>
                  {r.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type={showPw ? "text" : "password"}
              required
              autoComplete="new-password"
              className="auth-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={mismatch}
            />
            {mismatch && (
              <span className="auth-field-error">
                The passwords don&rsquo;t match.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || code.length !== 6 || !rulesMet || password !== confirm}
          >
            {loading ? <span className="auth-spinner" /> : <>Reset password {IC.arrow}</>}
          </button>

          <div className="auth-row-between">
            <button type="button" className="auth-link" onClick={startOver} disabled={loading}>
              Use a different email
            </button>
            <button type="button" className="auth-link" onClick={() => void sendCode()} disabled={loading}>
              Send a new code
            </button>
          </div>
          <p className="auth-hint">
            Five wrong codes cancel it — after that, send yourself a new one.
          </p>
        </form>
      )}

      {step === "done" && (
        <div className="auth-form">
          <div className="auth-notice is-flush" role="status">
            {IC.check}
            <span>Your password has been changed.</span>
          </div>
          <Link href="/auth/login" className="auth-btn">
            Go to sign in {IC.arrow}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

// useSearchParams requires a Suspense boundary in the Next.js App Router.
export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordFlow />
    </Suspense>
  );
}
