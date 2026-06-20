"use client";

import { useEffect, useState } from "react";
import { api, type PingResponse } from "@/lib/api";

type Status = "checking" | "online" | "offline";

export default function Home() {
  const [status, setStatus] = useState<Status>("checking");
  const [ping, setPing] = useState<PingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .ping()
      .then((res) => {
        setPing(res);
        setStatus("online");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("offline");
      });
  }, []);

  const dot =
    status === "online"
      ? "bg-green-500"
      : status === "offline"
        ? "bg-red-500"
        : "bg-yellow-500";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 p-8 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          Mapcars · Web
        </h1>
        <p className="text-zinc-500">UK ride-hailing — customer web app</p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${dot}`} />
          <span className="font-medium text-black dark:text-white">
            API connection: {status}
          </span>
        </div>

        {ping && (
          <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-sm text-zinc-700 dark:bg-black dark:text-zinc-300">
            {JSON.stringify(ping, null, 2)}
          </pre>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
            <br />
            Is the API running on {process.env.NEXT_PUBLIC_API_URL ??
              "http://localhost:5126"}?
          </p>
        )}
      </div>
    </div>
  );
}
