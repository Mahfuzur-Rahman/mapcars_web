"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, adminAuth, type AdminSession, type MenuResponse } from "@/lib/api";
import { AppShell, ErrorBanner, PageLoader, type NavNode } from "@/components/ui";
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isLoginPage) return;
    // proxy.ts already guards this route. me() loads the profile and menus and
    // renews the session cookie. Only a 401 means the session is over (the
    // BFF has already tried to renew and cleared the cookies). The API being
    // down, or a timeout, is no reason to sign an admin out.
    adminAuth
      .me()
      .then((res) => {
        setData(res);
        setReady(true);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/auth/login");
          return;
        }
        setLoadError(err instanceof Error ? err.message : "Couldn't load the portal.");
      });
  }, [router, isLoginPage, attempt]);

  // Login page: bypass the layout shell entirely
  if (isLoginPage) return <>{children}</>;

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <ErrorBanner
          message={loadError}
          onRetry={() => {
            setLoadError(null);
            setAttempt((n) => n + 1);
          }}
        />
      </div>
    );
  }

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
