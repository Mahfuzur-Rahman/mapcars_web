"use client";

import { useEffect, useState } from "react";
import {
  savedPlaces,
  ApiError,
  type SavedPlaceResponse,
} from "@/lib/api";

export default function SavedPlacesPage() {
  const [places, setPlaces] = useState<SavedPlaceResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    savedPlaces
      .list()
      .then(setPlaces)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load saved places"),
      );
  }

  useEffect(refresh, []);

  function resetForm() {
    setEditingId(null);
    setLabel("");
    setAddress("");
    setLat("");
    setLng("");
  }

  function startEdit(place: SavedPlaceResponse) {
    setEditingId(place.id);
    setLabel(place.label);
    setAddress(place.address);
    setLat(String(place.lat));
    setLng(String(place.lng));
  }

  const isValid = label.trim() && address.trim() && lat.trim() && lng.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const body = {
      label: label.trim(),
      address: address.trim(),
      lat: Number(lat),
      lng: Number(lng),
    };
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await savedPlaces.update(editingId, body);
      } else {
        await savedPlaces.create(body);
      }
      resetForm();
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save place");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await savedPlaces.remove(id);
      if (editingId === id) resetForm();
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete place");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Saved places</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Save addresses like Home or Work for faster booking.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Label</label>
          <input
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Home"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="min-w-48 flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Example Street, London"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Latitude</label>
          <input
            type="number"
            step="any"
            required
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="51.5074"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Longitude</label>
          <input
            type="number"
            step="any"
            required
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="-0.1278"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !isValid}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : editingId ? "Save changes" : "Add place"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
        )}
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {places !== null && places.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No saved places yet.
        </div>
      )}

      {places !== null && places.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {places.map((p) => (
                <tr key={p.id} className="border-b border-zinc-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.label}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.address}</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-500">
                    {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(p)}
                      className="mr-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
