import DashboardLayout from "../layouts/DashboardLayout";

const statCards = [
  { label: "Donations this week", value: "128", accent: "bg-ember/12 text-ember" },
  { label: "Open NGO requests", value: "34", accent: "bg-pine/12 text-pine" },
  { label: "Pending approvals", value: "09", accent: "bg-ink/10 text-ink" },
];

const requests = [
  { title: "Emergency food kits", category: "Food", urgency: "High", ngo: "Hope Shelter" },
  { title: "Winter blanket drive", category: "Clothes", urgency: "Medium", ngo: "Warm Hands" },
  { title: "School fee support", category: "Money", urgency: "High", ngo: "Future First" },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <section className="panel overflow-hidden">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ember">
              Daily Brief
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight">
              Make today’s giving pipeline visible, calm, and actionable.
            </h1>
            <p className="max-w-2xl text-lg text-ink/65">
              Review what needs attention, coordinate NGO requests, and keep donors moving
              from intent to impact.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="primary-button">Create donation</button>
              <button className="secondary-button">Review requests</button>
            </div>
          </div>

          <div className="rounded-[28px] bg-ink p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
              Focus
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-4xl font-bold">83%</p>
                <p className="mt-2 text-white/75">Fulfillment rate on urgent requests this month.</p>
              </div>
              <div className="h-2 rounded-full bg-white/15">
                <div className="h-2 w-4/5 rounded-full bg-ember" />
              </div>
              <p className="text-sm text-white/70">
                Strong donor momentum. Prioritize food and education needs today.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {statCards.map((card) => (
          <article key={card.label} className="panel p-6">
            <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${card.accent}`}>
              {card.label}
            </div>
            <p className="mt-5 font-display text-5xl font-bold">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Latest NGO requests</h2>
              <p className="mt-1 text-ink/65">Quick view of the most urgent asks.</p>
            </div>
            <button className="secondary-button">See all</button>
          </div>

          <div className="mt-6 space-y-4">
            {requests.map((request) => (
              <div
                key={request.title}
                className="rounded-3xl border border-ink/10 bg-sand p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{request.title}</p>
                    <p className="mt-1 text-sm text-ink/65">
                      {request.ngo} • {request.category}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-ember/10 px-3 py-1 text-sm font-semibold text-ember">
                    {request.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-6">
          <h2 className="font-display text-2xl font-bold">Team notes</h2>
          <p className="mt-1 text-ink/65">
            Align volunteers and admins around the next actions.
          </p>

          <div className="mt-6 space-y-4">
            {[
              "Confirm delivery routes for accepted food donations.",
              "Review new NGO onboarding requests before evening.",
              "Follow up with top recurring donors for campaign refresh.",
            ].map((note) => (
              <div key={note} className="rounded-3xl border border-ink/10 bg-white p-4">
                <p className="text-sm font-semibold text-ink/80">{note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
