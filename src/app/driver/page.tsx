"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  driverAuth,
  driverTrips,
  driverPayouts,
  ApiError,
  type DriverProfileResponse,
  type DriverTripSummary,
  type PayoutAccountStatus,
} from "@/lib/api";
import {
  Badge,
  Card,
  driverStatusTone,
  ErrorBanner,
  Icon,
  Page,
  PageHeader,
  QuickLink,
  QuickLinks,
  SectionTitle,
  Skeleton,
  StatCard,
  StatGrid,
} from "@/components/ui";

export default function DriverDashboard() {
  const [profile, setProfile] = useState<DriverProfileResponse | null>(null);
  const [trips, setTrips] = useState<DriverTripSummary[] | null>(null);
  const [payoutStatus, setPayoutStatus] = useState<PayoutAccountStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([driverAuth.getProfile(), driverTrips.list(), driverPayouts.getAccountStatus()])
      .then(([p, t, ps]) => {
        setProfile(p);
        setTrips(t);
        setPayoutStatus(ps);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load dashboard"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const completed = trips?.filter((t) => t.status === "Completed") ?? [];
  const totalEarnings = completed.reduce((sum, t) => sum + (t.driverEarnings ?? 0), 0);
  const loading = !trips && !error;

  const gbp = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  return (
    <Page>
      <PageHeader
        title={
          profile?.fullName
            ? `Welcome back, ${profile.fullName.split(" ")[0]}`
            : "Dashboard"
        }
        subtitle="Your driving activity at a glance"
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* Status card */}
      <Card className="mb-6">
        {profile ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-lg font-bold text-ink">
                  {profile.fullName ?? "—"}
                </p>
                <Badge tone={driverStatusTone(profile.status)}>{profile.status}</Badge>
                <Badge tone={profile.isOnline ? "success" : "neutral"} dot>
                  {profile.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                {profile.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="user" className="size-3.5 text-ink-faint" />
                    {profile.email}
                  </span>
                )}
                {profile.phone && <span>{profile.phone}</span>}
              </div>
            </div>

            {payoutStatus && !payoutStatus.payoutsEnabled && (
              <Link
                href="/driver/payout"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
              >
                <Icon name="banknote" className="size-4" />
                Finish payout setup
                <Icon name="arrow-right" className="size-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        )}
      </Card>

      <StatGrid>
        <StatCard
          label="Total trips"
          value={trips ? trips.length.toLocaleString() : "—"}
          icon="route"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={trips ? completed.length.toLocaleString() : "—"}
          icon="list"
          loading={loading}
        />
        <StatCard
          label="Total earnings"
          value={trips ? gbp(totalEarnings) : "—"}
          tone="positive"
          icon="banknote"
          loading={loading}
        />
        <StatCard
          label="Rating"
          value={profile?.averageRating != null ? profile.averageRating.toFixed(2) : "—"}
          hint={profile ? `${profile.ratingCount} ratings` : undefined}
          icon="star"
          loading={loading}
        />
      </StatGrid>

      <div className="mt-8">
        <SectionTitle>Jump to</SectionTitle>
        <QuickLinks>
          <QuickLink
            href="/driver/profile"
            label="My info"
            description="Profile & licence"
            icon="user"
          />
          <QuickLink
            href="/driver/records"
            label="Trip records"
            description="Your journey history"
            icon="clock"
          />
          <QuickLink
            href="/driver/documents"
            label="Documents"
            description="Upload & renew"
            icon="file-text"
          />
          <QuickLink
            href="/driver/payout"
            label="Payouts"
            description="Earnings & bank"
            icon="banknote"
          />
        </QuickLinks>
      </div>
    </Page>
  );
}
