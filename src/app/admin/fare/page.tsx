"use client";

import { useEffect, useRef, useState } from "react";
import {
  fareChart,
  ApiError,
  type FareChart,
  type ZoneSurcharge,
  type BusyArea,
  type RushHourRule,
} from "@/lib/api";

// All money in the chart is integer pence; the UI shows pounds.
const toPounds = (pence: number) => (pence / 100).toFixed(2);
const toPence = (pounds: string) => {
  const n = parseFloat(pounds);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const asNum = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const asInt = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // ISO 1..7

export default function FareSettingsPage() {
  const [chart, setChart] = useState<FareChart | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoadError(null);
    setError(null);
    setSaved(null);
    setChart(null);
    fareChart
      .get()
      .then(setChart)
      .catch((e) =>
        setLoadError(e instanceof ApiError ? e.message : "Failed to load the fare chart"),
      );
  }

  useEffect(load, []);

  // Immutable edit: clone, mutate the draft, set.
  function mutate(fn: (draft: FareChart) => void) {
    setChart((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev) as FareChart;
      fn(next);
      return next;
    });
    setSaved(null);
  }

  async function publish() {
    if (!chart) return;
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const updated = await fareChart.update(chart);
      setChart(updated);
      setSaved(`Published v${updated.version}. Live now — no restart needed.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to publish");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
        <button
          onClick={load}
          className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-zinc-400">
        Loading fare chart…
      </div>
    );
  }

  const driverKeeps = Math.max(0, 100 - chart.platform.driverFeePercent);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Fare settings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Rates, tiers, surge, area surcharges and commission. Publishing creates a
            new version and goes live immediately.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
            Live v{chart.version}
          </span>
          <button
            onClick={load}
            disabled={saving}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            onClick={publish}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Publish changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {saved}
        </div>
      )}

      <div className="grid gap-6">
        {/* Base & rates */}
        <Card title="Base & rates" subtitle="Applied once per trip, plus the per-mile / per-minute meter.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Booking fee">
              <MoneyInput pence={chart.base.bookingFeePence} onPence={(p) => mutate((d) => (d.base.bookingFeePence = p))} />
            </Field>
            <Field label="Minimum fare">
              <MoneyInput pence={chart.base.minimumFarePence} onPence={(p) => mutate((d) => (d.base.minimumFarePence = p))} />
            </Field>
            <Field label="Per mile">
              <MoneyInput pence={chart.rates.perMilePence} onPence={(p) => mutate((d) => (d.rates.perMilePence = p))} />
            </Field>
            <Field label="Per minute">
              <MoneyInput pence={chart.rates.perMinutePence} onPence={(p) => mutate((d) => (d.rates.perMinutePence = p))} />
            </Field>
          </div>
        </Card>

        {/* Commission */}
        <Card title="Platform commission" subtitle="MAP CARS' cut of each fare. The driver keeps the rest.">
          <div className="flex flex-wrap items-end gap-4">
            <Field label="Commission %">
              <NumInput
                value={chart.platform.driverFeePercent}
                onChange={(n) => mutate((d) => (d.platform.driverFeePercent = clamp(n, 0, 100)))}
                className={inputCls + " w-28"}
              />
            </Field>
            <p className="pb-2 text-sm text-zinc-500">
              Drivers keep <span className="font-semibold text-zinc-800">{driverKeeps}%</span> of every fare.
            </p>
          </div>
        </Card>

        {/* Tiers */}
        <Card title="Ride tiers" subtitle="Each tier scales the metered subtotal by its multiplier.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Base fare</th>
                  <th className="py-2 pr-3">Multiplier</th>
                  <th className="py-2 pr-3">Seats</th>
                  <th className="py-2 pr-3">ETA (min)</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {chart.tiers.map((t, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3">
                      <input value={t.id} onChange={(e) => mutate((d) => (d.tiers[i].id = e.target.value))} className={inputCls + " w-24"} />
                    </td>
                    <td className="py-2 pr-3">
                      <input value={t.name} onChange={(e) => mutate((d) => (d.tiers[i].name = e.target.value))} className={inputCls + " w-32"} />
                    </td>
                    <td className="py-2 pr-3">
                      <MoneyInput pence={t.baseFarePence} onPence={(p) => mutate((d) => (d.tiers[i].baseFarePence = p))} width="w-20" />
                    </td>
                    <td className="py-2 pr-3">
                      <NumInput value={t.multiplier} onChange={(n) => mutate((d) => (d.tiers[i].multiplier = n))} className={inputCls + " w-20"} />
                    </td>
                    <td className="py-2 pr-3">
                      <NumInput value={t.capacity} integer onChange={(n) => mutate((d) => (d.tiers[i].capacity = n))} className={inputCls + " w-16"} />
                    </td>
                    <td className="py-2 pr-3">
                      <NumInput value={t.etaMinutes} integer onChange={(n) => mutate((d) => (d.tiers[i].etaMinutes = n))} className={inputCls + " w-16"} />
                    </td>
                    <td className="py-2 text-right">
                      <RemoveBtn
                        onClick={() => mutate((d) => d.tiers.splice(i, 1))}
                        disabled={chart.tiers.length <= 1}
                        title={chart.tiers.length <= 1 ? "At least one tier is required" : "Remove tier"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddBtn
            label="Add tier"
            onClick={() =>
              mutate((d) =>
                d.tiers.push({ id: "", name: "", description: "", icon: "car", baseFarePence: 0, multiplier: 1, capacity: 4, etaMinutes: 5 }),
              )
            }
          />
        </Card>

        {/* Rush hour */}
        <Card title="Rush hour" subtitle="Time-of-day surge. Windows may wrap past midnight (from > to).">
          <div className="grid gap-3">
            {chart.modifiers.rushHour.map((r, i) => (
              <RushHourRow
                key={i}
                rule={r}
                onChange={(fn) => mutate((d) => fn(d.modifiers.rushHour[i]))}
                onRemove={() => mutate((d) => d.modifiers.rushHour.splice(i, 1))}
              />
            ))}
            {chart.modifiers.rushHour.length === 0 && <p className="text-sm text-zinc-400">No rush-hour rules.</p>}
          </div>
          <AddBtn
            label="Add rush-hour window"
            onClick={() => mutate((d) => d.modifiers.rushHour.push({ days: [1, 2, 3, 4, 5], from: "07:00", to: "10:00", multiplier: 1.25 }))}
          />
        </Card>

        {/* Area surcharges (zones) */}
        <Card
          title="Area surcharges"
          subtitle="Flat add-ons for airports / stations. Matches when a pickup or drop-off falls within the radius."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Lat</th>
                  <th className="py-2 pr-3">Lng</th>
                  <th className="py-2 pr-3">Radius (m)</th>
                  <th className="py-2 pr-3">Surcharge</th>
                  <th className="py-2 pr-3">Pickup</th>
                  <th className="py-2 pr-3">Drop-off</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {chart.modifiers.zones.map((z, i) => (
                  <ZoneRow
                    key={i}
                    zone={z}
                    onChange={(fn) => mutate((d) => fn(d.modifiers.zones[i]))}
                    onRemove={() => mutate((d) => d.modifiers.zones.splice(i, 1))}
                  />
                ))}
                {chart.modifiers.zones.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-zinc-400">
                      No area surcharges.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <AddBtn
            label="Add area"
            onClick={() =>
              mutate((d) =>
                d.modifiers.zones.push({
                  id: "",
                  type: "airport",
                  lat: 51.5074,
                  lng: -0.1278,
                  radiusM: 1000,
                  surchargePence: 0,
                  appliesToPickup: true,
                  appliesToDropoff: true,
                }),
              )
            }
          />
        </Card>

        {/* Busy areas */}
        <Card title="Busy areas" subtitle="Demand multipliers for a geographic bubble (stacks with rush hour).">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-2 pr-3">Lat</th>
                  <th className="py-2 pr-3">Lng</th>
                  <th className="py-2 pr-3">Radius (m)</th>
                  <th className="py-2 pr-3">Multiplier</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {chart.modifiers.busyAreas.map((b, i) => (
                  <BusyAreaRow
                    key={i}
                    area={b}
                    onChange={(fn) => mutate((d) => fn(d.modifiers.busyAreas[i]))}
                    onRemove={() => mutate((d) => d.modifiers.busyAreas.splice(i, 1))}
                  />
                ))}
                {chart.modifiers.busyAreas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400">
                      No busy areas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <AddBtn
            label="Add busy area"
            onClick={() => mutate((d) => d.modifiers.busyAreas.push({ lat: 51.5074, lng: -0.1278, radiusM: 3000, multiplier: 1.1 }))}
          />
        </Card>

        {/* Outside city */}
        <Card title="Outside-city surge" subtitle="Multiplier applied when a pickup falls outside the city boundary.">
          {chart.modifiers.outsideCity ? (
            <div className="flex flex-wrap items-end gap-4">
              <Field label="City lat">
                <NumInput value={chart.modifiers.outsideCity.cityLat} onChange={(n) => mutate((d) => (d.modifiers.outsideCity!.cityLat = n))} className={inputCls + " w-28"} />
              </Field>
              <Field label="City lng">
                <NumInput value={chart.modifiers.outsideCity.cityLng} onChange={(n) => mutate((d) => (d.modifiers.outsideCity!.cityLng = n))} className={inputCls + " w-28"} />
              </Field>
              <Field label="Radius (m)">
                <NumInput value={chart.modifiers.outsideCity.radiusM} integer onChange={(n) => mutate((d) => (d.modifiers.outsideCity!.radiusM = n))} className={inputCls + " w-28"} />
              </Field>
              <Field label="Multiplier">
                <NumInput value={chart.modifiers.outsideCity.multiplier} onChange={(n) => mutate((d) => (d.modifiers.outsideCity!.multiplier = n))} className={inputCls + " w-24"} />
              </Field>
              <RemoveBtn onClick={() => mutate((d) => (d.modifiers.outsideCity = null))} title="Remove outside-city rule" />
            </div>
          ) : (
            <AddBtn
              label="Add outside-city rule"
              onClick={() => mutate((d) => (d.modifiers.outsideCity = { cityLat: 51.509, cityLng: -0.126, radiusM: 25000, multiplier: 1.15 }))}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Reusable bits ────────────────────────────────────────────────────────────

const inputCls =
  "rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-zinc-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

/**
 * Numeric input backed by local text state, so intermediate values ("1.", "-",
 * "") stay editable and the caret never jumps. Emits the parsed number on each
 * change; re-syncs its text only when `value` changes from OUTSIDE (load /
 * publish / discard), tracked via a ref.
 */
function NumInput({
  value,
  onChange,
  className,
  integer,
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
  integer?: boolean;
}) {
  const [text, setText] = useState(String(value));
  const last = useRef(value);
  useEffect(() => {
    if (value !== last.current) {
      setText(String(value));
      last.current = value;
    }
  }, [value]);
  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        const n = integer ? asInt(t) : asNum(t);
        last.current = n;
        onChange(n);
      }}
      className={className}
    />
  );
}

/** Money field with a £ prefix. Value in pounds, reported back in pence. */
function MoneyInput({ pence, onPence, width = "w-full" }: { pence: number; onPence: (pence: number) => void; width?: string }) {
  const [text, setText] = useState(toPounds(pence));
  const last = useRef(pence);
  useEffect(() => {
    if (pence !== last.current) {
      setText(toPounds(pence));
      last.current = pence;
    }
  }, [pence]);
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-zinc-400">£</span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          const p = toPence(t);
          last.current = p;
          onPence(p);
        }}
        className={inputCls + " " + width}
      />
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-blue-300 hover:text-blue-700"
    >
      + {label}
    </button>
  );
}

function RemoveBtn({ onClick, disabled, title }: { onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
    >
      Remove
    </button>
  );
}

function RushHourRow({
  rule,
  onChange,
  onRemove,
}: {
  rule: RushHourRule;
  onChange: (fn: (r: RushHourRule) => void) => void;
  onRemove: () => void;
}) {
  function toggleDay(isoDay: number, on: boolean) {
    onChange((r) => {
      const set = new Set(r.days);
      if (on) set.add(isoDay);
      else set.delete(isoDay);
      r.days = [...set].sort((a, b) => a - b);
    });
  }
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Days</span>
        <div className="flex gap-1">
          {WEEKDAYS.map((label, idx) => {
            const iso = idx + 1;
            const on = rule.days.includes(iso);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => toggleDay(iso, !on)}
                className={`h-8 w-9 rounded-lg text-xs font-semibold transition ${
                  on ? "bg-blue-600 text-white" : "bg-white text-zinc-500 ring-1 ring-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <Field label="From">
        <input type="time" value={rule.from} onChange={(e) => onChange((r) => (r.from = e.target.value))} className={inputCls} />
      </Field>
      <Field label="To">
        <input type="time" value={rule.to} onChange={(e) => onChange((r) => (r.to = e.target.value))} className={inputCls} />
      </Field>
      <Field label="Multiplier">
        <NumInput value={rule.multiplier} onChange={(n) => onChange((r) => (r.multiplier = n))} className={inputCls + " w-24"} />
      </Field>
      <div className="pb-1">
        <RemoveBtn onClick={onRemove} title="Remove window" />
      </div>
    </div>
  );
}

function ZoneRow({
  zone,
  onChange,
  onRemove,
}: {
  zone: ZoneSurcharge;
  onChange: (fn: (z: ZoneSurcharge) => void) => void;
  onRemove: () => void;
}) {
  return (
    <tr>
      <td className="py-2 pr-3">
        <input value={zone.id} onChange={(e) => onChange((z) => (z.id = e.target.value))} className={inputCls + " w-28"} />
      </td>
      <td className="py-2 pr-3">
        <select value={zone.type} onChange={(e) => onChange((z) => (z.type = e.target.value))} className={inputCls}>
          <option value="airport">airport</option>
          <option value="station">station</option>
          <option value="venue">venue</option>
          <option value="other">other</option>
        </select>
      </td>
      <td className="py-2 pr-3">
        <NumInput value={zone.lat} onChange={(n) => onChange((z) => (z.lat = n))} className={inputCls + " w-24"} />
      </td>
      <td className="py-2 pr-3">
        <NumInput value={zone.lng} onChange={(n) => onChange((z) => (z.lng = n))} className={inputCls + " w-24"} />
      </td>
      <td className="py-2 pr-3">
        <NumInput value={zone.radiusM} integer onChange={(n) => onChange((z) => (z.radiusM = n))} className={inputCls + " w-24"} />
      </td>
      <td className="py-2 pr-3">
        <MoneyInput pence={zone.surchargePence} onPence={(p) => onChange((z) => (z.surchargePence = p))} width="w-20" />
      </td>
      <td className="py-2 pr-3 text-center">
        <input
          type="checkbox"
          checked={zone.appliesToPickup}
          onChange={(e) => onChange((z) => (z.appliesToPickup = e.target.checked))}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="py-2 pr-3 text-center">
        <input
          type="checkbox"
          checked={zone.appliesToDropoff}
          onChange={(e) => onChange((z) => (z.appliesToDropoff = e.target.checked))}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="py-2 text-right">
        <RemoveBtn onClick={onRemove} title="Remove area" />
      </td>
    </tr>
  );
}

function BusyAreaRow({
  area,
  onChange,
  onRemove,
}: {
  area: BusyArea;
  onChange: (fn: (b: BusyArea) => void) => void;
  onRemove: () => void;
}) {
  return (
    <tr>
      <td className="py-2 pr-3">
        <NumInput value={area.lat} onChange={(n) => onChange((b) => (b.lat = n))} className={inputCls + " w-24"} />
      </td>
      <td className="py-2 pr-3">
        <NumInput value={area.lng} onChange={(n) => onChange((b) => (b.lng = n))} className={inputCls + " w-24"} />
      </td>
      <td className="py-2 pr-3">
        <NumInput value={area.radiusM} integer onChange={(n) => onChange((b) => (b.radiusM = n))} className={inputCls + " w-24"} />
      </td>
      <td className="py-2 pr-3">
        <NumInput value={area.multiplier} onChange={(n) => onChange((b) => (b.multiplier = n))} className={inputCls + " w-24"} />
      </td>
      <td className="py-2 text-right">
        <RemoveBtn onClick={onRemove} title="Remove busy area" />
      </td>
    </tr>
  );
}
