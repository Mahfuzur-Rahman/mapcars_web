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
  Input,
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

      <Card className="mt-5">
        <h2 className="mb-1 text-sm font-bold text-ink">Extra verification</h2>
        <p className="mb-4 text-xs text-ink-faint">
          When a customer with a saved card is asked to confirm with their bank again.
          These are triggered by risk, never on a fixed schedule — card fraud runs its
          course in days, so a monthly rule would only add friction for loyal customers
          and never meet the attacker.
        </p>

        <Checkbox
          label="On a new device"
          hint="The strongest one. Someone who got into a customer's account still does not have their banking app."
          checked={settings.challengeOnNewDevice}
          onChange={(e) => {
            const on = e.target.checked;
            mutate((d) => {
              d.challengeOnNewDevice = on;
            });
          }}
        />

        <Checkbox
          label="After a failed charge"
          hint="Before letting them book again. Cheap — they are already interrupted."
          checked={settings.challengeAfterFailedCharge}
          onChange={(e) => {
            const on = e.target.checked;
            mutate((d) => {
              d.challengeAfterFailedCharge = on;
            });
          }}
        />

        <Checkbox
          label="On cards that were never properly authenticated"
          hint="Leaves well-verified cards alone. Applies only above the fare below."
          checked={settings.challengeUnauthenticatedCards}
          onChange={(e) => {
            const on = e.target.checked;
            mutate((d) => {
              d.challengeUnauthenticatedCards = on;
            });
          }}
        />

        <div className="mt-5 grid gap-x-5 sm:grid-cols-2">
          <Field
            label="Only above this fare"
            htmlFor="challengeAboveFare"
            hint="Spends friction where a loss hurts — an airport run, not an £8 hop. 0 = always challenge."
          >
            <Input
              id="challengeAboveFare"
              type="number"
              min={0}
              max={1000}
              step={1}
              value={settings.challengeAboveFarePence / 100}
              onChange={(e) => {
                const pounds = Number(e.target.value);
                mutate((d) => {
                  d.challengeAboveFarePence = Math.round(pounds * 100);
                });
              }}
            />
          </Field>

          <Field
            label="Re-verify after this many dormant days"
            htmlFor="dormantDays"
            hint="An account waking after a long silence is a real resale signal. 0 = off."
          >
            <Input
              id="dormantDays"
              type="number"
              min={0}
              max={3650}
              step={1}
              value={settings.reverifyAfterDormantDays}
              onChange={(e) => {
                const days = Number(e.target.value);
                mutate((d) => {
                  d.reverifyAfterDormantDays = days;
                });
              }}
            />
          </Field>
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="mb-1 text-sm font-bold text-ink">Limits</h2>
        <p className="mb-4 text-xs text-ink-faint">
          What caps the damage when a card turns out not to belong to the person using
          it.
        </p>

        <div className="grid gap-x-5 sm:grid-cols-2">
          <Field
            label="Saved cards per customer"
            htmlFor="maxCards"
            hint="A real customer needs two or three. A card tester needs hundreds. 1–20."
          >
            <Input
              id="maxCards"
              type="number"
              min={1}
              max={20}
              step={1}
              value={settings.maxSavedCardsPerCustomer}
              onChange={(e) => {
                const n = Number(e.target.value);
                mutate((d) => {
                  d.maxSavedCardsPerCustomer = n;
                });
              }}
            />
          </Field>

          <Field
            label="Card-add attempts per day"
            htmlFor="maxAttempts"
            hint="Failures included. This follows the person, where the rate limit only follows the connection. 1–50."
          >
            <Input
              id="maxAttempts"
              type="number"
              min={1}
              max={50}
              step={1}
              value={settings.maxCardAddAttemptsPerDay}
              onChange={(e) => {
                const n = Number(e.target.value);
                mutate((d) => {
                  d.maxCardAddAttemptsPerDay = n;
                });
              }}
            />
          </Field>

          <Field
            label="Block booking above this unpaid balance"
            htmlFor="debtBlock"
            hint="The cap on blast radius — what stops one bad card funding ten rides. 0 = block on any settled debt."
          >
            <Input
              id="debtBlock"
              type="number"
              min={0}
              max={1000}
              step={1}
              value={settings.blockBookingWhenDebtExceedsPence / 100}
              onChange={(e) => {
                const pounds = Number(e.target.value);
                mutate((d) => {
                  d.blockBookingWhenDebtExceedsPence = Math.round(pounds * 100);
                });
              }}
            />
          </Field>
        </div>

        <p className="mt-1 text-xs text-ink-faint">
          Saved and editable now, but nothing reads them yet — they take effect with the
          card payment release.
        </p>
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
