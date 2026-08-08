"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminAuth, type AdminSession, type MenuResponse } from "@/lib/api";
import { AppShell, PageLoader, type NavNode } from "@/components/ui";
import ChangePasswordDialog from "./ChangePasswordDialog";

/** The API's menu tree is already the shape we need — just rename the fields. */
function toNav(menus: MenuResponse[]): NavNode[] {
  return menus.map((m) => ({
    key: String(m.id),
    label: m.name,
    href: m.path ?? undefined,
    icon: m.icon ?? undefined,
    children: m.children.length ? toNav(m.children) : undefined,
  }));
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const [data, setData] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;
    // proxy.ts already guards this route; me() loads the profile/menus and
    // refreshes the session cookie. On any failure (e.g. expired session, which
    // the BFF clears server-side), bounce to login.
    adminAuth
      .me()
      .then((res) => {
        setData(res);
        setReady(true);
      })
      .catch(() => {
        router.replace("/auth/login");
      });
  }, [router, isLoginPage]);

  // Login page: bypass the layout shell entirely
  if (isLoginPage) return <>{children}</>;

  if (!ready || !data) return <PageLoader label="Loading your portal" />;

  async function signOut() {
    try {
      await adminAuth.logout();
    } finally {
      router.replace("/auth/login");
      router.refresh();
    }
  }

  return (
    <AppShell
      tone="admin"
      nav={toNav(data.menus)}
      user={{ name: data.admin.fullName, meta: data.admin.role }}
      onUserClick={() => setChangingPassword(true)}
      onSignOut={signOut}
    >
      {children}
      {changingPassword && <ChangePasswordDialog onClose={() => setChangingPassword(false)} />}
    </AppShell>
  );
}
