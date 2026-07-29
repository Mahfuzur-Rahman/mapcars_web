"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { driverAuth, type DriverProfileResponse } from "@/lib/api";
import { AppShell, type NavNode } from "@/components/ui";

const NAV: NavNode[] = [
  { key: "dashboard", href: "/driver", label: "Dashboard", icon: "layout-dashboard" },
  { key: "profile", href: "/driver/profile", label: "My info", icon: "user" },
  { key: "records", href: "/driver/records", label: "Trip records", icon: "clock" },
  { key: "documents", href: "/driver/documents", label: "Documents", icon: "file-text" },
  { key: "payout", href: "/driver/payout", label: "Payouts", icon: "banknote" },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfileResponse | null>(null);

  // Non-blocking: the sidebar renders immediately and fills in the driver's
  // name once it arrives. A failure here is harmless — proxy.ts guards the
  // route and each page reports its own load errors.
  useEffect(() => {
    driverAuth.getProfile().then(setProfile).catch(() => {});
  }, []);

  async function signOut() {
    try {
      await driverAuth.logout();
    } finally {
      router.replace("/auth/login");
      router.refresh();
    }
  }

  return (
    <AppShell
      tone="driver"
      nav={NAV}
      user={{ name: profile?.fullName ?? "Driver", meta: profile?.email }}
      onSignOut={signOut}
    >
      {children}
    </AppShell>
  );
}
