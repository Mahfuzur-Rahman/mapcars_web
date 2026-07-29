"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { riderAuth, type RiderProfileResponse } from "@/lib/api";
import { AppShell, type NavNode } from "@/components/ui";

const NAV: NavNode[] = [
  { key: "dashboard", href: "/account", label: "Dashboard", icon: "layout-dashboard" },
  { key: "profile", href: "/account/profile", label: "My info", icon: "user" },
  { key: "records", href: "/account/records", label: "Trip records", icon: "clock" },
  { key: "payment", href: "/account/payment", label: "Payment", icon: "credit-card" },
  { key: "documents", href: "/account/documents", label: "Documents", icon: "file-text" },
  { key: "places", href: "/account/saved-places", label: "Saved places", icon: "map-pin" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<RiderProfileResponse | null>(null);

  // Non-blocking: the sidebar renders immediately and fills in the rider's
  // name once it arrives. proxy.ts already guards this route.
  useEffect(() => {
    riderAuth.getProfile().then(setProfile).catch(() => {});
  }, []);

  async function signOut() {
    try {
      await riderAuth.logout();
    } finally {
      router.replace("/auth/login");
      router.refresh();
    }
  }

  return (
    <AppShell
      tone="rider"
      nav={NAV}
      user={{ name: profile?.fullName ?? "Rider", meta: profile?.email }}
      onSignOut={signOut}
    >
      {children}
    </AppShell>
  );
}
