"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { adminAuth, type AdminSession, type MenuResponse } from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const [data, setData] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

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
        router.replace("/admin/login");
      });
  }, [router, isLoginPage]);

  // Login page: bypass the layout shell entirely
  if (isLoginPage) return <>{children}</>;

  if (!ready || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
        Loading…
      </div>
    );
  }

  async function signOut() {
    try {
      await adminAuth.logout();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-4">
          <span className="font-bold text-zinc-900">Mapcars</span>
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-600">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {data.menus.map((menu) => (
            <NavItem key={menu.id} item={menu} current={pathname} />
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-zinc-100 px-4 py-4">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {data.admin.fullName}
          </p>
          <p className="truncate text-xs text-zinc-500">{data.admin.role}</p>
          <button
            onClick={signOut}
            className="mt-2 text-xs font-medium text-red-500 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavItem({
  item,
  current,
}: {
  item: MenuResponse;
  current: string;
}) {
  const active =
    !!item.path &&
    (current === item.path || current.startsWith(item.path + "/"));

  return (
    <div>
      {item.path ? (
        <Link
          href={item.path}
          className={`mb-0.5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            active
              ? "bg-blue-50 text-blue-700"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          {item.name}
        </Link>
      ) : (
        <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {item.name}
        </p>
      )}

      {item.children.length > 0 && (
        <div className="ml-2.5 mt-0.5 space-y-0.5 border-l border-zinc-100 pl-2">
          {item.children.map((child) => (
            <NavItem key={child.id} item={child} current={current} />
          ))}
        </div>
      )}
    </div>
  );
}
