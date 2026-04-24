import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "../lib/api";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      setIsLoading(true);
      setError("");

      try {
        const response = await apiFetch("/requests");
        if (!isMounted) return;
        setRequests(response.requests || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="panel overflow-hidden">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="inline-flex rounded-full border border-pine/20 bg-pine/10 px-4 py-2 text-sm font-semibold text-pine">
              NGO Requests
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight">
              Respond to urgent NGO requests with focused giving.
            </h1>
            <p className="text-lg text-ink/70">
              Browse live requests from partner NGOs, understand what they need, and move
              straight into the donation flow with one click.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-ink p-5 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Open requests</p>
                <p className="mt-3 font-display text-4xl font-bold">{requests.length}</p>
              </div>
              <div className="rounded-3xl bg-white p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Action</p>
                <p className="mt-3 font-display text-3xl font-bold text-ember">Donate faster</p>
                <p className="mt-2 text-sm text-ink/65">Jump directly to the donation page.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-ink p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
              What you see
            </p>
            <div className="mt-5 space-y-4">
              {[
                "Title for quick scanning",
                "Description for context",
                "Urgency level for prioritization",
                "Donate button to act immediately",
              ].map((item) => (
                <div key={item} className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-semibold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <article className="panel p-6">
            <p className="text-sm text-ink/65">Loading NGO requests...</p>
          </article>
        ) : requests.length === 0 ? (
          <article className="panel p-6">
            <h2 className="font-display text-2xl font-bold">No requests yet</h2>
            <p className="mt-2 text-ink/65">Check back soon for new NGO requests.</p>
          </article>
        ) : (
          requests.map((request) => (
            <article key={request.id} className="panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">
                    {request.NGOId?.name || "NGO partner"}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold">{request.title}</h2>
                </div>
                <span className="inline-flex rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
                  {request.urgencyLevel}
                </span>
              </div>

              <p className="mt-4 text-base leading-7 text-ink/72">{request.description}</p>

              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="rounded-full bg-sand px-3 py-2 text-sm font-semibold capitalize text-ink/70">
                  {request.category}
                </span>
                <Link
                  to={`/donate?ngo=${request.NGOId?.id || ""}`}
                  className="primary-button px-5 py-2.5"
                >
                  Donate
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
