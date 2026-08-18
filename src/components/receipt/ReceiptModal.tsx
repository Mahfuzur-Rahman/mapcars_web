"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";

export interface ReceiptTripData {
  id: string;
  createdAtUtc: string;
  completedAtUtc?: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  fareAmount?: number | null;
  tipAmount?: number | null;
  driverEarnings?: number | null;
  distanceMiles?: number | null;
  durationMinutes?: number | null;
  tier?: string | null;
  paymentMethod?: string | null;
  driverName?: string | null;
  driverVehicle?: string | null;
  driverPlate?: string | null;
}

interface ReceiptModalProps {
  trip: ReceiptTripData | null;
  isOpen: boolean;
  onClose: () => void;
  userType?: "rider" | "driver" | "admin";
}

export function ReceiptModal({
  trip,
  isOpen,
  onClose,
  userType = "rider",
}: ReceiptModalProps) {
  if (!isOpen || !trip) return null;

  const receiptNumber = `MC-${trip.id.slice(0, 8).toUpperCase()}`;
  const tripDate = new Date(trip.createdAtUtc);
  const formattedDate = tripDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = tripDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fare = trip.fareAmount ?? 0;
  const tip = trip.tipAmount ?? 0;
  const total = fare + tip;
  const earnings = trip.driverEarnings ?? fare;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
      {/* Container / Modal Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Icon name="receipt" className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Trip Receipt</h3>
              <p className="text-xs text-slate-500">{receiptNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700 active:scale-95"
            >
              <Icon name="download" className="h-3.5 w-3.5" />
              Download / Print PDF
            </button>
            <button
              onClick={onClose}
              type="button"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              aria-label="Close"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="receipt-printable p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-sky-600">
                  MAP CARS
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Official
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-400">
                UK Ride-Hailing Service
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Receipt Number
              </div>
              <div className="text-base font-black text-slate-900">
                {receiptNumber}
              </div>
              <div className="text-xs text-slate-500">
                {formattedDate} · {formattedTime}
              </div>
            </div>
          </div>

          {/* Route Details Box */}
          <div className="my-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pickup
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {trip.pickupAddress}
                  </div>
                </div>
              </div>

              <div className="ml-1.5 h-3 w-0.5 border-l-2 border-dashed border-slate-300" />

              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm bg-sky-600 ring-4 ring-sky-100" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Drop-off
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {trip.dropoffAddress}
                  </div>
                </div>
              </div>
            </div>

            {(trip.distanceMiles != null || trip.durationMinutes != null) && (
              <div className="mt-4 flex items-center gap-4 border-t border-slate-200/60 pt-3 text-xs text-slate-600">
                {trip.distanceMiles != null && (
                  <div>
                    <span className="font-semibold text-slate-900">
                      {trip.distanceMiles.toFixed(1)}
                    </span>{" "}
                    miles
                  </div>
                )}
                {trip.durationMinutes != null && (
                  <div>
                    <span className="font-semibold text-slate-900">
                      {Math.round(trip.durationMinutes)}
                    </span>{" "}
                    mins
                  </div>
                )}
                {trip.tier && (
                  <div className="capitalize text-slate-500">
                    Tier: <span className="font-semibold text-slate-900">{trip.tier}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Trip Fare</span>
              <span className="font-semibold text-slate-900">£{fare.toFixed(2)}</span>
            </div>

            {tip > 0 && (
              <div className="flex justify-between py-1 text-slate-600">
                <span>Driver Tip</span>
                <span className="font-semibold text-slate-900">£{tip.toFixed(2)}</span>
              </div>
            )}

            {userType === "driver" && (
              <div className="flex justify-between py-1 font-medium text-emerald-700">
                <span>Your Driver Earnings</span>
                <span className="font-bold">£{earnings.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
              <span>{userType === "driver" ? "Trip Total" : "Total Paid"}</span>
              <span className="text-xl text-sky-600">£{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Status Note */}
          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-100/80 px-4 py-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Icon name="credit-card" className="h-4 w-4 text-slate-400" />
              <span>
                Payment:{" "}
                <strong className="text-slate-900">
                  {trip.paymentMethod ?? "Card / Online"}
                </strong>
              </span>
            </div>
            <span className="font-bold text-emerald-600">
              Status: {trip.status}
            </span>
          </div>

          {/* Footer Note */}
          <div className="mt-8 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
            <p className="font-medium text-slate-500">
              MapCars UK Ltd · Bournemouth & Poole, Dorset, UK
            </p>
            <p className="mt-0.5">
              Questions? Contact us anytime at support@mapcars.uk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
