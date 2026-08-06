"use client";

import "../auth.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { riderAuth, ApiError } from "@/lib/api";
import { env } from "@/lib/env";
import { normalizeUkPhone } from "@/lib/phone";
import AuthShell from "@/components/auth/AuthShell";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

type Tab = "email" | "phone";

const IC = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
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

export default function CustomerSignupPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("email");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await riderAuth.signup(email, password, fullName);
      const params = new URLSearchParams({ email, intent: "signup" });
      if (env.isDev && res.devCode) params.set("dev", res.devCode);
      router.push(`/auth/verify?${params}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const normalized = normalizeUkPhone(phone);
      const res = await riderAuth.sendOtp(normalized);
      const params = new URLSearchParams({ phone: normalized, intent: "signup" });
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
      headlineLead="Get moving with"
      headlineHighlight="MapCars"
      tagline="Create your account in seconds and join thousands of riders getting ready for launch across the South Coast."
    >
      <h2 className="auth-title">Create your account</h2>
      <p className="auth-sub">It only takes a minute to get started.</p>

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

      {error && (
        <div className="auth-error" role="alert">
          {IC.warn}
          <span>{error}</span>
        </div>
      )}

      {tab === "email" ? (
        <form className="auth-form" onSubmit={handleEmailSignup}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="fullName">Full name</label>
            <div className="auth-input-wrap">
              <input
                id="fullName"
                type="text"
                required
                autoFocus
                autoComplete="name"
                className="auth-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
              />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email address</label>
            <div className="auth-input-wrap">
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                className="auth-input has-toggle"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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
            {loading ? <span className="auth-spinner" /> : <>Create account {IC.arrow}</>}
          </button>
          <p className="auth-hint">We&rsquo;ll send a verification code to your email.</p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handlePhoneSignup}>
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
            {loading ? <span className="auth-spinner" /> : <>Send verification code {IC.arrow}</>}
          </button>
          <p className="auth-hint">We&rsquo;ll text you a 6-digit code. Standard SMS rates apply.</p>
        </form>
      )}

      <GoogleAuthButton onError={setError} intent="signup" />

      <p className="auth-legal">
        By continuing you agree to our{" "}
        <Link href="/legal/terms">Terms of Service</Link> and{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>

      <p className="auth-alt">
        Already have an account? <Link href="/auth/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
