import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { apiFetch } from "../lib/api";

const emptyRequestForm = {
  title: "",
  description: "",
  category: "food",
  urgencyLevel: "medium",
};

export default function DashboardHomePage() {
  const { token, user } = useAuth();
  const [requests, setRequests]     = useState([]);
  const [donations, setDonations]   = useState([]);
  const [ngos, setNgos]             = useState([]);
  const [requestForm, setRequestForm] = useState(emptyRequestForm);
  const [isLoading, setIsLoading]   = useState(true);
  const [isSavingRequest, setIsSavingRequest] = useState(false);
  const [error, setError]           = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [reqRes, donRes, ngoRes] = await Promise.all([
        apiFetch("/requests"),
        apiFetch("/donations/my"),
        apiFetch("/auth/ngos"),
      ]);

      // Requests
      const requestList =
        reqRes?.data?.requests ?? reqRes?.requests ??
        (Array.isArray(reqRes) ? reqRes : []);

      // Donations — backend formatDonation returns { id, NGOId: { id, name }, ... }
      const rawDonations =
        donRes?.data?.donations ?? donRes?.donations ??
        (Array.isArray(donRes) ? donRes : []);

      // NGOs
      const ngoList =
        ngoRes?.data?.ngos ?? ngoRes?.ngos ??
        (Array.isArray(ngoRes) ? ngoRes : []);

      setRequests(requestList);
      setDonations(rawDonations);
      setNgos(ngoList);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadDashboard();
  }, [token, loadDashboard]);

  // NGOs the donor has NOT yet donated to
  const donatedNgoIds = new Set(
    donations.map((d) =>
      typeof d.NGOId === "object" ? (d.NGOId?.id || d.NGOId?._id) : d.NGOId
    ).filter(Boolean)
  );
  const availableNgos = ngos.filter(
    (n) => !donatedNgoIds.has(n._id) && !donatedNgoIds.has(n.id)
  );

  const handleRequestFieldChange = (e) =>
    setRequestForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMessage(""); setIsSavingRequest(true);
    try {
      await apiFetch("/requests", { method: "POST", body: JSON.stringify(requestForm) });
      setSuccessMessage("Request created successfully.");
      setRequestForm(emptyRequestForm);
      await loadDashboard();
    } catch (err) { setError(err.message); }
    finally { setIsSavingRequest(false); }
  };

  const handleStatusUpdate = async (donationId, status) => {
    setError(""); setSuccessMessage("");
    try {
      await apiFetch(`/donations/${donationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSuccessMessage(`Donation marked as ${status}.`);
      await loadDashboard();
    } catch (err) { setError(err.message); }
  };

  const handleRequestDelete = async (id) => {
    setError(""); setSuccessMessage("");
    try {
      await apiFetch(`/requests/${id}`, { method: "DELETE" });
      setSuccessMessage("Request deleted successfully.");
      await loadDashboard();
    } catch (err) { setError(err.message); }
  };

  const canCreateRequest = user?.role === "ngo" || user?.role === "admin";

  return (
    <DashboardLayout>
      {/* ── Hero ── */}
      <section className="panel overflow-hidden">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ember">Daily Brief</p>
            <h1 className="font-display text-4xl font-bold leading-tight">
              Welcome back, {user?.name}.
            </h1>
            <p className="max-w-2xl text-lg text-ink/65">
              Your {user?.role} workspace is connected to the live backend.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="secondary-button">{user?.email}</span>
              <span className="primary-button bg-pine hover:bg-teal-700">{user?.role}</span>
            </div>
          </div>
          <div className="rounded-[28px] bg-ink p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Focus</p>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-4xl font-bold">{isLoading ? "…" : requests.length}</p>
                <p className="mt-2 text-white/75">Active requests visible across the platform.</p>
              </div>
              <div className="h-2 rounded-full bg-white/15">
                <div className="h-2 w-4/5 rounded-full bg-ember" />
              </div>
              <p className="text-sm text-white/70">
                Data refreshes whenever you create, update, or delete records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Alerts ── */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{successMessage}</div>
      ) : null}

      {/* ── Stat cards ── */}
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            label: user?.role === "ngo" ? "Incoming donations" : "My donations",
            value: isLoading ? "…" : String(donations.length).padStart(2, "0"),
            accent: "bg-ember/12 text-ember",
            note: null,
          },
          {
            label: "Open NGO requests",
            value: isLoading ? "…" : String(requests.length).padStart(2, "0"),
            accent: "bg-pine/12 text-pine",
            note: null,
          },
          {
            label: user?.role === "ngo" ? "Total NGOs" : "Available NGOs",
            value: isLoading ? "…" : user?.role === "ngo"
              ? String(ngos.length).padStart(2, "0")
              : String(availableNgos.length).padStart(2, "0"),
            accent: "bg-ink/10 text-ink",
            note: user?.role === "donor" && !isLoading && donatedNgoIds.size > 0
              ? `${donatedNgoIds.size} already donated`
              : null,
          },
        ].map((card) => (
          <article key={card.label} className="panel p-6">
            <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${card.accent}`}>
              {card.label}
            </div>
            <p className="mt-5 font-display text-5xl font-bold">{card.value}</p>
            {card.note && !isLoading ? (
              <p className="mt-2 text-xs text-ink/50">{card.note}</p>
            ) : null}
          </article>
        ))}
      </section>

      {/* ── NGO Requests + My Donations ── */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Latest NGO requests */}
        <article className="panel p-6">
          <h2 className="font-display text-2xl font-bold">Latest NGO requests</h2>
          <p className="mt-1 text-ink/65">Live data from the backend request API.</p>
          <div className="mt-6 space-y-4">
            {isLoading ? (
              <p className="text-sm text-ink/65">Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="text-sm text-ink/65">No requests available yet.</p>
            ) : (
              requests.map((request) => {
                const ownsRequest =
                  request.NGOId && String(request.NGOId.id) === String(user?.id);
                return (
                  <div key={request.id} className="rounded-3xl border border-ink/10 bg-sand p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">{request.title}</p>
                        <p className="mt-1 text-sm text-ink/65">
                          {request.NGOId?.name || "NGO"} · {request.category} · {request.urgencyLevel}
                        </p>
                        <p className="mt-3 text-sm text-ink/70">{request.description}</p>
                      </div>
                      {ownsRequest && canCreateRequest ? (
                        <button
                          type="button"
                          className="secondary-button shrink-0 px-4 py-2"
                          onClick={() => handleRequestDelete(request.id)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        {/* Donations panel — label and content change based on role */}
        <article className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {user?.role === "ngo" ? "Incoming Donations" : "My donations"}
              </h2>
              <p className="mt-1 text-ink/65">
                {user?.role === "ngo"
                  ? "Donations received by your NGO."
                  : "Live donation data scoped to your account."}
              </p>
            </div>
            {user?.role === "donor" ? (
              <Link to="/donate" className="text-sm font-semibold text-ember">
                + Donate
              </Link>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <p className="text-sm text-ink/65">Loading donations...</p>
            ) : donations.length === 0 ? (
              <div className="rounded-3xl border border-ink/10 bg-sand p-5 text-center">
                <p className="text-sm text-ink/65">
                  {user?.role === "ngo"
                    ? "No incoming donations yet."
                    : "No donations found yet."}
                </p>
                {user?.role === "donor" ? (
                  <Link to="/donate" className="mt-3 inline-block text-sm font-semibold text-ember">
                    Make your first donation →
                  </Link>
                ) : null}
              </div>
            ) : (
              donations.map((donation) => {
                const donationId = donation.id || donation._id;

                // For NGO: show donor name. For donor: show NGO name.
                const ngoName =
                  typeof donation.NGOId === "object"
                    ? donation.NGOId?.name || "NGO"
                    : ngos.find((n) => (n._id || n.id) === donation.NGOId)?.name || "NGO";

                const donorName =
                  typeof donation.donorId === "object"
                    ? donation.donorId?.name || "Donor"
                    : "Donor";

                return (
                  <div key={donationId} className="rounded-3xl border border-ink/10 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold capitalize">
                          {donation.type} donation
                        </p>
                        {/* NGO sees donor name; donor sees NGO name */}
                        <p className="mt-1 text-sm font-medium text-pine">
                          {user?.role === "ngo" ? `From: ${donorName}` : ngoName}
                        </p>
                        <p className="mt-1 text-sm text-ink/65">
                          {donation.type === "money"
                            ? `Amount: ${donation.amount}`
                            : donation.itemDetails || "No details"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={[
                            "inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                            donation.status === "delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : donation.status === "accepted"
                              ? "bg-pine/10 text-pine"
                              : "bg-ink/10 text-ink",
                          ].join(" ")}
                        >
                          {donation.status || "pending"}
                        </span>
                        {/* NGO can accept/deliver incoming donations */}
                        {user?.role === "ngo" && donation.status === "pending" ? (
                          <button
                            type="button"
                            className="secondary-button px-3 py-1 text-xs"
                            onClick={() => handleStatusUpdate(donationId, "accepted")}
                          >
                            Accept
                          </button>
                        ) : null}
                        {user?.role === "ngo" && donation.status === "accepted" ? (
                          <button
                            type="button"
                            className="secondary-button px-3 py-1 text-xs"
                            onClick={() => handleStatusUpdate(donationId, "delivered")}
                          >
                            Deliver
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      {/* ── Create NGO request (NGO / admin only) ── */}
      {canCreateRequest ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <article className="panel p-6">
            <h2 className="font-display text-2xl font-bold">Create NGO request</h2>
            <p className="mt-1 text-ink/65">Publish a new request to the backend request API.</p>
            <form className="mt-6 space-y-4" onSubmit={handleRequestSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="request-title">Title</label>
                <input id="request-title" name="title" type="text" className="input-field"
                  value={requestForm.title} onChange={handleRequestFieldChange} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="request-description">Description</label>
                <textarea id="request-description" name="description" rows="4" className="input-field"
                  value={requestForm.description} onChange={handleRequestFieldChange} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="request-category">Category</label>
                  <select id="request-category" name="category" className="input-field"
                    value={requestForm.category} onChange={handleRequestFieldChange}>
                    <option value="food">food</option>
                    <option value="clothes">clothes</option>
                    <option value="money">money</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="request-urgency">Urgency</label>
                  <select id="request-urgency" name="urgencyLevel" className="input-field"
                    value={requestForm.urgencyLevel} onChange={handleRequestFieldChange}>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="primary-button" disabled={isSavingRequest}>
                {isSavingRequest ? "Saving..." : "Publish request"}
              </button>
            </form>
          </article>
        </section>
      ) : null}
    </DashboardLayout>
  );
}