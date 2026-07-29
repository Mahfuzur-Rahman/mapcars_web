"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { env } from "@/lib/env";

type Status = "checking" | "online" | "offline";

/**
 * Small floating pill showing the live API connection status.
 *
 * Development affordance only. mapcars.uk serves this landing page to the public,
 * where a floating "API offline" badge is noise at best and alarming at worst — so
 * it renders (and skips the ping entirely) outside local dev.
 */
export default function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (!env.isDev) return;
    let cancelled = false;
    api
      .ping()
      .then(() => !cancelled && setStatus("online"))
      .catch(() => !cancelled && setStatus("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!env.isDev) return null;

  const dot =
    status === "online"
      ? "bg-green-500"
      : status === "offline"
        ? "bg-red-500"
        : "bg-yellow-500";

  return (
    <div className="fixed bottom-4 left-4 z-[1100] flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-lg backdrop-blur">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      API {status}
    </div>
  );
}
