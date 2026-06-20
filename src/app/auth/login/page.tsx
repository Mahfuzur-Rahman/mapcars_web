"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { riderAuth, ApiError } from "@/lib/api";
import { env } from "@/lib/env";
import { normalizeUkPhone } from "@/lib/phone";

type Tab = "email" | "phone";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("email");

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone state
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await riderAuth.login(email, password);
      router.push(res.isProfileComplete ? "/" : "/auth/profile");
      router.refresh();
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to Mapcars</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex rounded-xl border border-zinc-200 bg-white p-1">
          {(["email", "phone"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t === "email" ? "Email" : "Phone"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {tab === "email" ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Mobile number
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center rounded-lg border border-zinc-200 px-3 text-sm text-zinc-500">
                    🇬🇧 +44
                  </span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="7700 900000"
                    className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending code…" : "Send code"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-zinc-500">
          New to Mapcars?{" "}
          <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
