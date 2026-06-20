"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { riderAuth, ApiError, type RiderSession } from "@/lib/api";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();

  const phone = params.get("phone");
  const email = params.get("email");
  const devCode = params.get("dev"); // only present in local dev

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = phone ? `+44${phone.replace("+44", "")}` : email ?? "";

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true);
    setError(null);
    try {
      let res: RiderSession;
      if (phone) {
        res = await riderAuth.verifyPhone(phone, code);
      } else if (email) {
        res = await riderAuth.verifyEmail(email, code);
      } else {
        setError("Missing phone or email");
        return;
      }
      // Session cookie is set by the BFF on success.
      router.push(res.isProfileComplete ? "/" : "/auth/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setLoading(false);
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

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
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

// useSearchParams requires Suspense boundary in Next.js App Router
export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
