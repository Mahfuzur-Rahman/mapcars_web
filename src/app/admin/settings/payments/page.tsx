"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  paymentSettings,
  type PaymentMethodName,
  type PaymentSettings,
} from "@/lib/api";
import {
  Button,
  Card,
  Checkbox,
  ErrorBanner,
  Field,
  Page,
  PageHeader,
  PageLoader,
  Select,
} from "@/components/ui";

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // State is only set inside the promise callbacks, never synchronously in the
  // effect body — that is what react-hooks/set-state-in-effect is about, and it
  // is why admin/fare/page.tsx still carries that error.
  const load = useCallback(() => {
    paymentSettings
      .get()
      .then((res) => {
        setSettings(res);
        setLoadError(null);
        setError(null);
        setSaved(null);
      })
      .catch((e) =>
        setLoadError(e instanceof ApiError ? e.message : "Failed to load payment settings"),
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Immutable edit, same shape as the fare page: clone, mutate the draft, set.
  function mutate(fn: (draft: PaymentSettings) => void) {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev) as PaymentSettings;
      fn(next);
      return next;
    });
    setSaved(null);
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const updated = await paymentSettings.update(settings);
      setSettings(updated);
      setSaved(
        updated.defaultMethod !== settings.defaultMethod
          ? `Saved. The default was changed to ${updated.defaultMethod}, because ${settings.defaultMethod} is no longer enabled.`
          : "Saved. Live now — customers see this on their next booking.",
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <Page>
        <PageHeader title="Payment settings" />
        <ErrorBanner message={loadError} onRetry={load} />
      </Page>
    );
  }
  if (!settings) {
    return (
      <Page>
        <PageHeader title="Payment settings" />
        <PageLoader label="Loading payment settings" />
      </Page>
    );
  }

  // Exactly one method left on means its checkbox must not be untickable. A
  // disabled box that says why beats a click that silently does nothing, and
  // beats letting it through and failing on save.
  const onlyCash = settings.cashEnabled && !settings.cardEnabled;
  const onlyCard = settings.cardEnabled && !settings.cashEnabled;
  const lockNote = "At least one payment method has to stay on.";

  return (
    <Page>
      <PageHeader
        title="Payment settings"
        subtitle="How customers can pay. Takes effect immediately, with no app release."
      />

      {error && <ErrorBanner message={error} />}
      {saved && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {saved}
        </div>
      )}

      <Card>
        <h2 className="mb-1 text-sm font-bold text-ink">Accepted payment methods</h2>
        <p className="mb-4 text-xs text-ink-faint">
          Customers only ever see methods that are enabled here.
        </p>

        <Checkbox
          label="Cash"
          hint="Settled in person with the driver at drop-off."
          checked={settings.cashEnabled}
          lockedReason={onlyCash ? lockNote : undefined}
          onChange={(e) => {
            const on = e.target.checked;
            mutate((d) => {
              d.cashEnabled = on;
              if (!on && d.defaultMethod === "Cash") d.defaultMethod = "Card";
            });
          }}
        />

        <Checkbox
          label="Card (online)"
          hint="Charged automatically when the trip ends. Needs Stripe to be configured first."
          checked={settings.cardEnabled}
          lockedReason={onlyCard ? lockNote : undefined}
          onChange={(e) => {
            const on = e.target.checked;
            mutate((d) => {
              d.cardEnabled = on;
              if (!on && d.defaultMethod === "Card") d.defaultMethod = "Cash";
            });
          }}
        />

        <div className="mt-5 max-w-xs">
          <Field
            label="Preselected method"
            htmlFor="defaultMethod"
            hint="What the app has chosen when a customer opens the booking sheet."
          >
            <Select
              id="defaultMethod"
              value={settings.defaultMethod}
              onChange={(e) =>
                mutate((d) => {
                  d.defaultMethod = e.target.value as PaymentMethodName;
                })
              }
            >
              {settings.cashEnabled && <option value="Cash">Cash</option>}
              {settings.cardEnabled && <option value="Card">Card</option>}
            </Select>
          </Field>
        </div>
      </Card>

      {/* These two checkboxes are quietly enormous. Say so, next to them, rather
          than leaving it in a runbook nobody opens mid-change. */}
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
        <h3 className="text-sm font-bold text-amber-900">Before you change these</h3>
        <ul className="mt-2 space-y-1.5 text-xs text-amber-900">
          {!settings.cashEnabled && (
            <li>
              <strong>Cash is off.</strong> A customer with no saved card cannot book at
              all. Do not leave it off until card payments are live and tested.
            </li>
          )}
          {!settings.cardEnabled && (
            <li>
              <strong>Card is off.</strong> Every fare is collected in person by the
              driver, and the platform takes no money at the time of the trip.
            </li>
          )}
          <li>
            Turning cash off only works once the card build has reached almost every
            install. Customers on an older app show Card as &ldquo;Soon&rdquo; and would be
            left unable to book.
          </li>
          <li>
            Individual drivers can be narrowed further on their own page. These settings
            are the ceiling — a per-driver setting can restrict, never widen.
          </li>
        </ul>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={save} loading={saving} disabled={saving}>
          Save settings
        </Button>
        <Button variant="secondary" onClick={load} disabled={saving}>
          Discard changes
        </Button>
      </div>
    </Page>
  );
}
