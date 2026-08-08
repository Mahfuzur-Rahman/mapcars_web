"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportError } from "@/lib/api";

// App Router error boundary — catches render/runtime errors in the route tree
// and shows a recoverable fallback instead of a blank screen. Every error that
// lands here also goes to the central error log (admin portal → Error Logger).
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // `digest` is the server-side id Next assigns — it's what ties this entry
    // to the matching server log line, so it goes in as the correlation id.
    reportError(error, { path: error.digest ? `digest:${error.digest}` : undefined });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Something went wrong</h1>
      <p className="max-w-sm text-sm text-zinc-500">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      {error.digest && (
        <p className="text-xs text-zinc-400">Reference: {error.digest}</p>
      )}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
