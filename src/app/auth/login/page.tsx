"use client";

import "../auth.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { riderAuth, unifiedAuth, ApiError } from "@/lib/api";
import { env } from "@/lib/env";
import { normalizeUkPhone } from "@/lib/phone";
import AuthShell from "@/components/auth/AuthShell";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

type Tab = "email" | "phone";

const IC = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.81.53 2.81.66A2 2 0 0 1 22 16.92z" />
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
  warn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
};

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set when the same email+password matches both a rider and a driver
  // account — the user picks which one they mean before we redirect.
  const [choosingRole, setChoosingRole] = useState(false);

  function goToDestination(res: { userType: string; isProfileComplete?: boolean }) {
    switch (res.userType) {
      case "admin":
        router.push("/admin");
        break;
      case "driver":
        router.push("/driver");
        break;
      default:
        router.push(res.isProfileComplete ? "/account" : "/auth/profile");
    }
    router.refresh();
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await unifiedAuth.login(email, password);
      if (res.requiresChoice) {
        setChoosingRole(true);
        return;
      }
      goToDestination(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function chooseRole(userType: "rider" | "driver") {
    setLoading(true);
    setError(null);
    try {
      goToDestination(await unifiedAuth.login(email, password, userType));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const normalized = normalizeUkPhone(phone);
      const res = await riderAuth.sendOtp(normalized);
      const params = new URLSearchParams({ phone: normalized, intent: "login" });
      if (env.isDev && res.devCode) params.set("dev", res.devCode);
      router.push(`/auth/verify?${params}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headlineLead="Welcome back to"
      headlineHighlight="MapCars"
      tagline="One sign-in for riders, drivers, and admins — we'll take you straight to your dashboard."
    >
      <h2 className="auth-title">Sign in</h2>
      <p className="auth-sub">
        {choosingRole
          ? "This email is used by both a rider and a driver account."
          : "Good to see you again. Let’s get you moving."}
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {IC.warn}
          <span>{error}</span>
        </div>
      )}

      {choosingRole ? (
        <div className="auth-form">
          <button
            type="button"
            className="auth-btn"
            disabled={loading}
            onClick={() => chooseRole("rider")}
          >
            {loading ? <span className="auth-spinner" /> : <>Continue as rider {IC.arrow}</>}
          </button>
          <button
            type="button"
            className="auth-btn"
            disabled={loading}
            onClick={() => chooseRole("driver")}
          >
            {loading ? <span className="auth-spinner" /> : <>Continue as driver {IC.arrow}</>}
          </button>
          <button
            type="button"
            className="auth-link"
            disabled={loading}
            onClick={() => {
              setChoosingRole(false);
              setError(null);
            }}
          >
            &larr; Use a different account
          </button>
        </div>
      ) : (
        <>
          <div className="auth-tabs" role="tablist">
            {(["email", "phone"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={`auth-tab${tab === t ? " active" : ""}`}
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
              >
                {t === "email" ? IC.mail : IC.phone}
                {t === "email" ? "Email" : "Phone"}
              </button>
            ))}
          </div>

          {tab === "email" ? (
            <form className="auth-form" onSubmit={handleEmailLogin}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="email">Email address</label>
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
              <div className="auth-field">
                <div className="auth-row-between">
                  <label className="auth-label" htmlFor="password">Password</label>
                  <Link href="/#contact" className="auth-link">Forgot password?</Link>
                </div>
                <div className="auth-input-wrap">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="auth-input has-toggle"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : <>Sign in {IC.arrow}</>}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handlePhoneLogin}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="phone">Mobile number</label>
                <div className="auth-phone">
                  <span className="auth-prefix">🇬🇧 +44</span>
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoFocus
                    autoComplete="tel"
                    className="auth-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="7700 900000"
                  />
                </div>
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : <>Send login code {IC.arrow}</>}
              </button>
              <p className="auth-hint">
                We&rsquo;ll text you a 6-digit code. Standard SMS rates apply. Phone
                sign-in is for rider accounts — drivers and admins should use the
                Email tab.
              </p>
            </form>
          )}

          <GoogleAuthButton onError={setError} intent="signin" />
          <p className="auth-hint auth-social-hint">
            Google sign-in works for both Customer and Driver Partner accounts.
          </p>
        </>
      )}

      {/* Create account link/button hidden for now */}
    </AuthShell>
  );
}
