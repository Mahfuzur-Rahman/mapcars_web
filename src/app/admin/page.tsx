"use client";

import { useCallback, useEffect, useState } from "react";
import { adminReports, ApiError, type AdminStats } from "@/lib/api";
import {
  ErrorBanner,
  Page,
  PageHeader,
  QuickLink,
  QuickLinks,
  SectionTitle,
  StatCard,
  StatGrid,
  type StatTone,
} from "@/components/ui";

type Tile = {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  icon: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminReports
      .stats()
      .then((s) => {
        setStats(s);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load stats"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const gbp = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
  const num = (n?: number) => (n == null ? "—" : n.toLocaleString());

  const loading = !stats && !error;
  const online = stats?.onlineDrivers ?? 0;
  const pending = stats?.pendingDriverApprovals ?? 0;
  const active = stats?.activeTrips ?? 0;

  const tiles: Tile[] = [
    { label: "Total riders", value: num(stats?.totalRiders), icon: "users" },
    { label: "Total drivers", value: num(stats?.totalDrivers), icon: "car" },
    {
      label: "Online drivers",
      value: num(stats?.onlineDrivers),
      hint: online > 0 ? "Live now" : "None online",
      tone: online > 0 ? "positive" : "muted",
      icon: "map-pin",
    },
    {
      label: "Pending approvals",
      value: num(stats?.pendingDriverApprovals),
      hint: pending > 0 ? "Needs review" : "All clear",
      tone: pending > 0 ? "warning" : "positive",
      icon: "shield",
    },
    {
      label: "Active trips",
      value: num(stats?.activeTrips),
      hint: active > 0 ? "In progress" : undefined,
      tone: "muted",
      icon: "route",
    },
    { label: "Trips today", value: num(stats?.tripsToday), icon: "clock" },
    {
      label: "Completed today",
      value: num(stats?.completedTripsToday),
      icon: "list",
    },
    {
      label: "Revenue today",
      value: stats ? gbp(stats.revenueTodayGbp) : "—",
      tone: "positive",
      icon: "banknote",
    },
  ];

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        subtitle="Platform activity across riders, drivers and trips"
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <StatGrid>
        {tiles.map((t) => (
          <StatCard
            key={t.label}
            label={t.label}
            value={t.value}
            hint={t.hint}
            tone={t.tone}
            icon={t.icon}
            loading={loading}
          />
        ))}
      </StatGrid>

      <div className="mt-8">
        <SectionTitle>Jump to</SectionTitle>
        <QuickLinks>
          <QuickLink
            href="/admin/riders"
            label="Manage riders"
            description="Browse rider accounts"
            icon="users"
          />
          <QuickLink
            href="/admin/drivers"
            label="Review drivers"
            description="Approve documents"
            icon="shield"
          />
          <QuickLink
            href="/admin/trips/live"
            label="Live map"
            description="Trips in progress"
            icon="map-pin"
          />
          <QuickLink
            href="/admin/trips/history"
            label="Trip history"
            description="Completed journeys"
            icon="clock"
          />
        </QuickLinks>
      </div>
    </Page>
  );
}
