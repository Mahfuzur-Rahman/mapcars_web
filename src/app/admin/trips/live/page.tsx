"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { adminReports, ApiError, type AdminLive } from "@/lib/api";
import { env } from "@/lib/env";

const LONDON = { lat: 51.5074, lng: -0.1278 };
const POLL_MS = 6000;

// Load the Google Maps JS API once, reusing the same promise across remounts.
let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

const STATUS_COLOR: Record<string, string> = {
  Requested: "#2563eb",
  DriverAssigned: "#d97706",
  DriverArrived: "#d97706",
  InProgress: "#16a34a",
};

export default function AdminLiveMapPage() {
  const [live, setLive] = useState<AdminLive | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapDiv = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const markers = useRef<any[]>([]);

  const hasKey = !!env.googleMapsKey;

  // Poll the live payload.
  useEffect(() => {
    let active = true;
    const tick = () =>
      adminReports
        .live()
        .then((d) => active && setLive(d))
        .catch((e) => active && setError(e instanceof ApiError ? e.message : "Failed to load live data"));
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Init the map once (only when a key is configured).
  useEffect(() => {
    if (!hasKey || !mapDiv.current || mapObj.current) return;
    loadGoogleMaps(env.googleMapsKey)
      .then(() => {
        if (!mapDiv.current) return;
        mapObj.current = new (window as any).google.maps.Map(mapDiv.current, {
          center: LONDON,
          zoom: 11,
          disableDefaultUI: true,
          zoomControl: true,
        });
      })
      .catch(() => setMapError("Couldn't load Google Maps — check the API key and its referrer restriction."));
  }, [hasKey]);

  // Redraw markers whenever the live data changes.
  useEffect(() => {
    const g = (window as any).google;
    if (!g?.maps || !mapObj.current || !live) return;

    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    const dot = (color: string, scale: number) => ({
      path: g.maps.SymbolPath.CIRCLE,
      scale,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    });

    for (const t of live.activeTrips) {
      markers.current.push(
        new g.maps.Marker({
          position: { lat: t.pickupLat, lng: t.pickupLng },
          map: mapObj.current,
          icon: dot(STATUS_COLOR[t.status] ?? "#2563eb", 7),
          title: `${t.customerName ?? "Customer"} → ${t.dropoffAddress} (${t.status})`,
        }),
      );
    }
    for (const d of live.onlineDrivers) {
      markers.current.push(
        new g.maps.Marker({
          position: { lat: d.lat, lng: d.lng },
          map: mapObj.current,
          icon: dot("#059669", 5),
          title: d.name ?? "Driver",
        }),
      );
    }
  }, [live]);

  return (
    <div className="p-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Live map</h1>
          <p className="mt-1 text-sm text-zinc-500">
            In-flight trips and online drivers · refreshes every {POLL_MS / 1000}s.
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <Stat label="Active trips" value={live?.activeTrips.length} accent="text-blue-600" />
          <Stat label="Online drivers" value={live?.onlineDrivers.length} accent="text-green-600" />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {hasKey ? (
        <div className="relative">
          <div ref={mapDiv} className="h-[70vh] w-full rounded-2xl border border-zinc-200 bg-zinc-100" />
          {mapError && (
            <div className="absolute inset-x-0 top-0 m-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {mapError}
            </div>
          )}
          <Legend />
        </div>
      ) : (
        <NoKeyFallback live={live} />
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value?: number; accent: string }) {
  return (
    <div className="text-right">
      <p className={`text-2xl font-bold ${accent}`}>{value ?? "—"}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function Legend() {
  const items = [
    { c: "#2563eb", l: "Requested" },
    { c: "#d97706", l: "Assigned / arrived" },
    { c: "#16a34a", l: "In progress" },
    { c: "#059669", l: "Online driver" },
  ];
  return (
    <div className="absolute bottom-3 left-3 rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-sm">
      <div className="flex flex-col gap-1">
        {items.map((i) => (
          <div key={i.l} className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: i.c }} />
            {i.l}
          </div>
        ))}
      </div>
    </div>
  );
}

// Shown when no Google Maps key is configured — the ops data is still useful
// without the visual map.
function NoKeyFallback({ live }: { live: AdminLive | null }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Set <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> (a browser key with the Maps
        JavaScript API enabled) to see the visual map. Showing the live data below meanwhile.
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Active trips (${live?.activeTrips.length ?? 0})`}>
          {live?.activeTrips.length ? (
            <ul className="divide-y divide-zinc-100">
              {live.activeTrips.map((t) => (
                <li key={t.id} className="py-2 text-sm">
                  <span className="font-medium text-zinc-900">{t.customerName ?? "Customer"}</span>
                  <span className="text-zinc-400"> → </span>
                  <span className="text-zinc-700">{t.dropoffAddress}</span>
                  <span className="ml-2 text-xs text-zinc-400">{t.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">No active trips.</p>
          )}
        </Panel>
        <Panel title={`Online drivers (${live?.onlineDrivers.length ?? 0})`}>
          {live?.onlineDrivers.length ? (
            <ul className="divide-y divide-zinc-100">
              {live.onlineDrivers.map((d) => (
                <li key={d.driverId} className="py-2 text-sm text-zinc-700">
                  {d.name ?? "Driver"}
                  <span className="ml-2 text-xs text-zinc-400">
                    {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">No drivers online.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">{title}</h2>
      {children}
    </div>
  );
}
