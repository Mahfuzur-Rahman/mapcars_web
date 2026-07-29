"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  riderAuth,
  riderTrips,
  savedPlaces,
  ApiError,
  type RiderProfileResponse,
  type TripSummary,
  type SavedPlaceResponse,
} from "@/lib/api";
import {
  Card,
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

export default function AccountDashboard() {
  const [profile, setProfile] = useState<RiderProfileResponse | null>(null);
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [places, setPlaces] = useState<SavedPlaceResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([riderAuth.getProfile(), riderTrips.list(), savedPlaces.list()])
      .then(([p, t, sp]) => {
        setProfile(p);
        setTrips(t);
        setPlaces(sp);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load dashboard"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const completedTrips = trips?.filter((t) => t.status === "Completed").length;
  const loading = !trips && !error;

  return (
    <Page>
      <PageHeader
        title={
          profile?.fullName
            ? `Welcome back, ${profile.fullName.split(" ")[0]}`
            : "Dashboard"
        }
        subtitle="Here's what's happening with your account"
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <Card className="mb-6">
        {profile ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Signed in as
              </p>
              <p className="mt-1 font-display text-lg font-bold text-ink">
                {profile.fullName ?? "—"}
              </p>
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

            {!profile.isProfileComplete && (
              <Link
                href="/auth/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
              >
                Complete your profile
                <Icon name="arrow-right" className="size-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-48" />
          </div>
        )}
      </Card>

      <StatGrid cols={3}>
        <StatCard
          label="Total trips"
          value={trips ? trips.length.toLocaleString() : "—"}
          icon="route"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={completedTrips != null ? completedTrips.toLocaleString() : "—"}
          icon="list"
          loading={loading}
        />
        <StatCard
          label="Saved places"
          value={places ? places.length.toLocaleString() : "—"}
          icon="map-pin"
          loading={loading}
        />
      </StatGrid>

      <div className="mt-8">
        <SectionTitle>Jump to</SectionTitle>
        <QuickLinks>
          <QuickLink
            href="/account/profile"
            label="My info"
            description="Name & contact"
            icon="user"
          />
          <QuickLink
            href="/account/records"
            label="Trip records"
            description="Your ride history"
            icon="clock"
          />
          <QuickLink
            href="/account/payment"
            label="Payment"
            description="Cards & receipts"
            icon="credit-card"
          />
          <QuickLink
            href="/account/saved-places"
            label="Saved places"
            description="Home, work & more"
            icon="map-pin"
          />
        </QuickLinks>
      </div>
    </Page>
  );
}
