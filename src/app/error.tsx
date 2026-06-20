"use client";

import Link from "next/link";

// App Router error boundary — catches render/runtime errors in the route tree
// and shows a recoverable fallback instead of a blank screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
