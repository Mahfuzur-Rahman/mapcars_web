"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminAuth,
  adminManagement,
  ApiError,
  type AdminListItem,
  type AdminMenuAccess,
  type MenuAccessItem,
} from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  Icon,
  Input,
  Page,
  PageHeader,
  Select,
  Skeleton,
  SlideOver,
} from "@/components/ui";

// The platform ships exactly two roles, seeded in `database/001_admin_auth.sql`
// and structural to the permission model (a SuperAdmin can't be menu-restricted).
// There's no roles endpoint; the client already hardcodes role 1 elsewhere
// (`adminAuth.setup`), so keep that convention rather than inventing a contract.
const ROLES = [
  { id: 2, name: "Admin", blurb: "Menu-based access you control per account." },
  { id: 1, name: "SuperAdmin", blurb: "Full access to every menu. Cannot be restricted." },
];

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminListItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    adminManagement
      .listAdmins()
      .then((res) => {
        setAdmins(res);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load admins"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page>
      <PageHeader
        title="Admin Users"
        subtitle="Manage admin accounts and control which menus each one can see."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Icon name="user-plus" className="size-4" />
            Add admin
          </Button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {flash && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-accent bg-accent-tint px-4 py-3">
          <Icon name="check" className="size-4 shrink-0 text-accent-ink" />
          <p className="text-sm font-medium text-accent-ink">{flash}</p>
        </div>
      )}

      <Card padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Menus</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {admins?.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-medium text-ink">{a.fullName}</td>
                <td className="px-5 py-3.5 text-ink-muted">{a.email}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={a.roleId === 1 ? "brand" : "neutral"}>{a.role}</Badge>
                </td>
                <td className="px-5 py-3.5 tabular-nums text-ink-muted">{a.menuCount}</td>
                <td className="px-5 py-3.5 text-right">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelected(a)}
                    disabled={a.roleId === 1}
                    title={
                      a.roleId === 1
                        ? "SuperAdmin always has full access"
                        : "Edit menu access"
                    }
                  >
                    Edit menus
                  </Button>
                </td>
              </tr>
            ))}

            {!admins && !error && (
              <tr>
                <td colSpan={5} className="px-5 py-4">
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {admins?.length === 0 && (
          <EmptyState
            icon="shield"
            title="No admins yet"
            description="Create the first admin account to get started."
            action={<Button onClick={() => setCreating(true)}>Add admin</Button>}
          />
        )}
      </Card>

      {creating && (
        <CreateAdminForm
          onClose={() => setCreating(false)}
          onCreated={(name) => {
            setCreating(false);
            setFlash(`${name} can now sign in. Remember to send them their password.`);
            load();
          }}
        />
      )}

      {selected && (
        <MenuEditor
          admin={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </Page>
  );
}

// ── Create admin ─────────────────────────────────────────────────────────────

/** Mirrors CreateAdminRequestValidator on the API so we fail fast, client-side. */
const RULES = [
  { label: "At least 8 characters", ok: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", ok: (p: string) => /[A-Z]/.test(p) },
  { label: "One digit", ok: (p: string) => /[0-9]/.test(p) },
];

function CreateAdminForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [roleId, setRoleId] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwOk = RULES.every((r) => r.ok(password));
  const canSubmit = fullName.trim() !== "" && email.trim() !== "" && pwOk && !saving;
  const role = ROLES.find((r) => r.id === roleId)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await adminAuth.register(email.trim(), password, fullName.trim(), roleId);
      onCreated(fullName.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create admin");
      setSaving(false);
    }
  }

  return (
    <SlideOver
      title="Add admin"
      subtitle="Create a new admin account"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!canSubmit}>
            Create admin
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <ErrorBanner message={error} />}

        <Field label="Full name" htmlFor="fullName">
          <Input
            id="fullName"
            required
            autoFocus
            autoComplete="off"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
          />
        </Field>

        <Field
          label="Email address"
          htmlFor="newEmail"
          hint="They'll sign in with this at /auth/login."
        >
          <Input
            id="newEmail"
            type="email"
            required
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@mapcars.co.uk"
          />
        </Field>

        <Field
          label="Temporary password"
          htmlFor="newPassword"
          hint={
            <ul className="space-y-1">
              {RULES.map((r) => {
                const ok = r.ok(password);
                return (
                  <li
                    key={r.label}
                    className={`flex items-center gap-1.5 ${ok ? "text-accent-ink" : ""}`}
                  >
                    <Icon
                      name={ok ? "check" : "close"}
                      className={`size-3 ${ok ? "text-accent-ink" : "text-ink-faint"}`}
                    />
                    {r.label}
                  </li>
                );
              })}
            </ul>
          }
        >
          <div className="relative">
            <Input
              id="newPassword"
              type={showPw ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-slate-50 hover:text-ink-muted"
            >
              <Icon name={showPw ? "eye-off" : "eye"} className="size-4" />
            </button>
          </div>
        </Field>

        <Field label="Role" htmlFor="roleId" hint={role.blurb}>
          <Select
            id="roleId"
            value={roleId}
            onChange={(e) => setRoleId(Number(e.target.value))}
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>

        {/* RegisterAsync emails a welcome note, but deliberately never the
            password — the creator has to pass it on out of band. */}
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 ring-1 ring-amber-200">
          <Icon name="alert-circle" className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <p className="text-xs text-amber-800">
            They&rsquo;ll get a welcome email, but{" "}
            <strong className="font-semibold">it won&rsquo;t include the password</strong> —
            share it with them yourself and ask them to change it after signing in.
          </p>
        </div>

        {/* Lets Enter submit the form without a visible duplicate button. */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </SlideOver>
  );
}

// ── Menu access editor ───────────────────────────────────────────────────────

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
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load menus"));
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
    <SlideOver
      title="Menu access"
      subtitle={`${admin.fullName} · ${admin.email}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!access}>
            Save changes
          </Button>
        </>
      }
    >
      {error && <ErrorBanner message={error} />}
      {!access && !error && (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      )}
      {access?.menus.map((m) => (
        <MenuNode key={m.id} node={m} checked={checked} onToggle={toggle} depth={0} />
      ))}
    </SlideOver>
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
      <label className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50">
        <input
          type="checkbox"
          checked={checked.has(node.id)}
          onChange={(e) => onToggle(node.id, e.target.checked)}
          className="size-4 rounded border-line-strong text-brand-ink focus:ring-brand/30"
        />
        <span className="text-sm text-ink">{node.name}</span>
        {node.roleDefault && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
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
