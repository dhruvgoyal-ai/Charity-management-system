import { NavLink } from "react-router-dom";

const sidebarItems = [
  { label: "Overview", to: "/dashboard" },
  { label: "Donations", to: "/donate" },
  { label: "Requests", to: "/requests" },
];

export default function DashboardLayout({ children }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">
            Mission Control
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold">Dashboard</h2>
          <p className="mt-2 text-sm text-ink/65">
            Track donations, respond to NGO requests, and keep outreach organized.
          </p>

          <nav className="mt-8 space-y-2">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                    isActive
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-sand text-ink hover:border-ink/30",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 space-y-6">{children}</section>
      </div>
    </main>
  );
}

