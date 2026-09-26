"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { adminCustomers, ApiError, type AdminCustomerListItem } from "@/lib/api";

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id;

  const [customer, setCustomer] = useState<AdminCustomerListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminCustomers
      .get(customerId)
      .then(setCustomer)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load customer"));
  }, [customerId]);

  if (error && !customer) {
    return (
      <div className="p-8">
        <BackLink />
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!customer) {
    return <div className="p-8 text-sm text-zinc-400">Loading…</div>;
  }

  return (
    <div className="p-8">
      <BackLink />

      <div className="mb-6 mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{customer.fullName || "Unnamed customer"}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {customer.email || "—"} · {customer.phoneNumber || "—"}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            customer.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {customer.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Profile</h2>
        <Field label="Full name" value={customer.fullName} />
        <Field label="Email" value={customer.email} />
        <Field label="Phone" value={customer.phoneNumber} />
        <Field label="Joined" value={new Date(customer.createdAtUtc).toLocaleDateString()} />
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/admin/customers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
      ← Back to customers
    </Link>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-900">{value || "—"}</span>
    </div>
  );
}
