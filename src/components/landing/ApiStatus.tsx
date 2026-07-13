"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Status = "checking" | "online" | "offline";

/** Small floating pill showing the live API connection status. */
export default function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    api
      .ping()
      .then(() => !cancelled && setStatus("online"))
      .catch(() => !cancelled && setStatus("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

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
