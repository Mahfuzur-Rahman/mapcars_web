"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/api";

/**
 * Catches the failures React's error boundary never sees — a throw inside an
 * event handler, a rejected promise nobody awaited, a script error from an
 * async chunk — and sends them to the central error log.
 *
 * Mounted once in the root layout. Renders nothing.
 */
export default function ErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportError(event.error ?? event.message, { path: window.location.pathname });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason, { path: window.location.pathname });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
