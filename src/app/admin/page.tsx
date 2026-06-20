// Admin dashboard — layout.tsx handles auth; this page just renders content.
export default function AdminDashboard() {
  const cards = [
    { label: "Total Riders", value: "—" },
    { label: "Total Drivers", value: "—" },
    { label: "Active Trips", value: "—" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Welcome to Mapcars Admin Portal
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-zinc-500">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">{c.value}</p>
            <p className="mt-1 text-xs text-zinc-400">Stats endpoint coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
