"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminManagement,
  ApiError,
  type AdminListItem,
  type AdminMenuAccess,
  type MenuAccessItem,
} from "@/lib/api";

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminListItem | null>(null);

  useEffect(() => {
    adminManagement
      .listAdmins()
      .then(setAdmins)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Failed to load admins"),
      );
  }, []);

  function refreshCounts() {
    adminManagement.listAdmins().then(setAdmins).catch(() => {});
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Admin Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage admin accounts and control which menus each one can see.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Menus</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {admins?.map((a) => (
              <tr key={a.id} className="hover:bg-zinc-50">
                <td className="px-5 py-3 font-medium text-zinc-900">
                  {a.fullName}
                </td>
                <td className="px-5 py-3 text-zinc-600">{a.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      a.roleId === 1
                        ? "bg-purple-50 text-purple-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {a.role}
                  </span>
                </td>
                <td className="px-5 py-3 tabular-nums text-zinc-600">
                  {a.menuCount}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setSelected(a)}
                    disabled={a.roleId === 1}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title={a.roleId === 1 ? "SuperAdmin always has full access" : "Edit menus"}
                  >
                    Edit menus
                  </button>
                </td>
              </tr>
            ))}
            {admins && admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                  No admins yet.
                </td>
              </tr>
            )}
            {!admins && !error && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <MenuEditor
          admin={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            refreshCounts();
          }}
        />
      )}
    </div>
  );
}

// ── Slide-over editor ──────────────────────────────────────────────────────

function MenuEditor({
  admin,
  onClose,
  onSaved,
}: {
  admin: AdminListItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [access, setAccess] = useState<AdminMenuAccess | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminManagement
      .getAdminMenus(admin.id)
      .then((res) => {
        setAccess(res);
        setChecked(collectAllowed(res.menus));
      })
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Failed to load menus"),
      );
  }, [admin.id]);

  // Parent → children and child → parent maps, for cascading toggles.
  const { childrenOf, parentOf } = useMemo(
    () => buildRelations(access?.menus ?? []),
    [access],
  );

  function toggle(id: number, on: boolean) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (on) {
        // adding a menu implies its ancestors (so it's reachable in the tree)
        let cur: number | undefined = id;
        while (cur !== undefined) {
          next.add(cur);
          cur = parentOf.get(cur);
        }
      } else {
        // removing a menu removes its descendants too
        const stack = [id];
        while (stack.length) {
          const n = stack.pop()!;
          next.delete(n);
          for (const c of childrenOf.get(n) ?? []) stack.push(c);
        }
      }
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await adminManagement.setAdminMenus(admin.id, [...checked]);
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">Menu access</h2>
          <p className="text-sm text-zinc-500">
            {admin.fullName} · {admin.email}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {!access && !error && (
            <p className="text-sm text-zinc-400">Loading…</p>
          )}
          {access?.menus.map((m) => (
            <MenuNode
              key={m.id}
              node={m}
              checked={checked}
              onToggle={toggle}
              depth={0}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !access}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuNode({
  node,
  checked,
  onToggle,
  depth,
}: {
  node: MenuAccessItem;
  checked: Set<number>;
  onToggle: (id: number, on: boolean) => void;
  depth: number;
}) {
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50">
        <input
          type="checkbox"
          checked={checked.has(node.id)}
          onChange={(e) => onToggle(node.id, e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-zinc-800">{node.name}</span>
        {node.roleDefault && (
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
            role default
          </span>
        )}
      </label>
      {node.children.map((c) => (
        <MenuNode
          key={c.id}
          node={c}
          checked={checked}
          onToggle={onToggle}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

// ── Tree helpers ─────────────────────────────────────────────────────────────

function collectAllowed(nodes: MenuAccessItem[], acc = new Set<number>()): Set<number> {
  for (const n of nodes) {
    if (n.allowed) acc.add(n.id);
    collectAllowed(n.children, acc);
  }
  return acc;
}

function buildRelations(nodes: MenuAccessItem[]) {
  const childrenOf = new Map<number, number[]>();
  const parentOf = new Map<number, number>();
  const walk = (list: MenuAccessItem[], parent?: number) => {
    for (const n of list) {
      if (parent !== undefined) {
        parentOf.set(n.id, parent);
        childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), n.id]);
      }
      walk(n.children, n.id);
    }
  };
  walk(nodes);
  return { childrenOf, parentOf };
}
