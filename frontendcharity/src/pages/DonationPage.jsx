import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

const initialForm = {
  NGOId: "",
  type: "money",
  amount: "",
  itemDetails: "",
};

// Backend formatDonation returns:
//   id (not _id)
//   NGOId: { id, name, email, role }  (not { _id, name })
// This normalises a donation so the UI can rely on donation.id and donation.NGOId.name
function normalizeDonation(donation) {
  if (!donation || typeof donation !== "object") return null;
  return {
    ...donation,
    id: donation.id || donation._id,
    NGOId:
      donation.NGOId && typeof donation.NGOId === "object"
        ? { ...donation.NGOId, id: donation.NGOId.id || donation.NGOId._id }
        : donation.NGOId,
  };
}

// Extract the NGO id string regardless of whether NGOId is an object or raw string
function getNgoId(ngoIdField) {
  if (!ngoIdField) return null;
  if (typeof ngoIdField === "object") return ngoIdField.id || ngoIdField._id || null;
  return ngoIdField;
}

export default function DonationPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [ngos, setNgos] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [recentDonations, setRecentDonations] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donatedNgoIds, setDonatedNgoIds] = useState(new Set());

  const selectedNgoFromQuery = searchParams.get("ngo") || "";

  useEffect(() => {
    let isMounted = true;

    async function loadDonationPage() {
      setIsLoading(true);
      setError("");

      try {
        const [ngosResponse, donationsResponse] = await Promise.all([
          apiFetch("/auth/ngos"),
          apiFetch("/donations/my"),
        ]);

        if (!isMounted) return;

        const ngoList =
          ngosResponse?.data?.ngos ||
          ngosResponse?.ngos ||
          ngosResponse?.data ||
          (Array.isArray(ngosResponse) ? ngosResponse : []);

        // Backend returns { data: { donations: [...] } }
        const rawDonations =
          donationsResponse?.data?.donations ||
          donationsResponse?.donations ||
          donationsResponse?.data ||
          (Array.isArray(donationsResponse) ? donationsResponse : []);

        const donationList = rawDonations.map(normalizeDonation).filter(Boolean);

        setNgos(ngoList);
        setRecentDonations(donationList.slice(0, 3));

        // Backend returns NGOId as { id, name, … } — use .id not ._id
        const donatedIds = new Set(
          donationList.map((d) => getNgoId(d.NGOId)).filter(Boolean)
        );
        setDonatedNgoIds(donatedIds);

        const availableNgos = ngoList.filter(
          (n) => !donatedIds.has(n._id) && !donatedIds.has(n.id)
        );

        const defaultNgoId =
          selectedNgoFromQuery ||
          (availableNgos.length > 0 ? availableNgos[0]._id || availableNgos[0].id : "");

        setFormData((current) => ({
          ...current,
          NGOId: defaultNgoId || current.NGOId,
        }));
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load donation page. Please refresh.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDonationPage();
    return () => { isMounted = false; };
  }, [selectedNgoFromQuery]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.NGOId) {
      setError("Please select an NGO before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload =
        formData.type === "money"
          ? { NGOId: formData.NGOId, type: "money", amount: Number(formData.amount) }
          : { NGOId: formData.NGOId, type: "item", itemDetails: formData.itemDetails };

      const response = await apiFetch("/donations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Try every possible nesting the API might return
      const rawDonation =
        response?.data?.donation ||
        response?.donation ||
        (response?.id ? response : null) ||        // flat donation object
        (response?.data?.id ? response.data : null) ||
        null;

      // Normalize whatever we got from the API
      let newDonation = normalizeDonation(rawDonation);

      // Always enrich NGOId with the local NGO object so the name is guaranteed
      const donatedNgo = ngos.find(
        (n) => (n._id || n.id) === formData.NGOId
      );

      if (newDonation) {
        // Overwrite NGOId with the full local object for reliable name display
        if (donatedNgo) {
          newDonation.NGOId = { id: donatedNgo._id || donatedNgo.id, name: donatedNgo.name };
        }
      } else {
        // API response shape was unrecognised — build the card from local state
        newDonation = {
          id: `local-${Date.now()}`,
          type: formData.type,
          amount: formData.type === "money" ? Number(formData.amount) : undefined,
          itemDetails: formData.type === "item" ? formData.itemDetails : undefined,
          status: "pending",
          NGOId: donatedNgo
            ? { id: donatedNgo._id || donatedNgo.id, name: donatedNgo.name }
            : { id: formData.NGOId, name: "NGO" },
          createdAt: new Date().toISOString(),
        };
      }

      setSuccessMessage("Donation submitted successfully.");
      setDonatedNgoIds((current) => new Set([...current, formData.NGOId]));

      setRecentDonations((current) =>
        [newDonation, ...current]
          .filter((d) => d && typeof d === "object" && (d.id || d._id))
          .slice(0, 3)
      );

      // Auto-select the next available NGO
      const updatedDonated = new Set([...donatedNgoIds, formData.NGOId]);
      const nextNgo = ngos.find(
        (n) => !updatedDonated.has(n._id) && !updatedDonated.has(n.id)
      );
      setFormData({
        NGOId: nextNgo?._id || nextNgo?.id || "",
        type: "money",
        amount: "",
        itemDetails: "",
      });
    } catch (err) {
      setError(err.message || "Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableNgos = ngos.filter(
    (n) => !donatedNgoIds.has(n._id) && !donatedNgoIds.has(n.id)
  );

  if (user?.role !== "donor" && user?.role !== "admin") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="panel max-w-2xl p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Donation Access</p>
          <h1 className="mt-4 font-display text-4xl font-bold">This page is for donors.</h1>
          <p className="mt-4 text-lg text-ink/70">
            NGO accounts can manage incoming donations from the dashboard, while donors can
            create new donations here.
          </p>
          <Link to="/dashboard" className="primary-button mt-6">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="panel overflow-hidden">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-ember/20 bg-ember/10 px-4 py-2 text-sm font-semibold text-ember">
                Donation Studio
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight">
                Turn intent into action with a clean donation flow.
              </h1>
              <p className="text-lg text-ink/70">
                Choose how you want to give, add the relevant details, and send your donation
                directly to a live NGO partner.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-ink p-5 text-white">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Options</p>
                  <p className="mt-3 font-display text-3xl font-bold">Money or item</p>
                </div>
                <div className="rounded-3xl bg-white p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Partners</p>
                  <p className="mt-3 font-display text-3xl font-bold text-pine">
                    {isLoading ? "..." : availableNgos.length}
                  </p>
                  <p className="mt-2 text-sm text-ink/65">NGOs available to receive your support.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-soft">
              <div className="mb-6">
                <h2 className="font-display text-3xl font-bold">Create donation</h2>
                <p className="mt-2 text-ink/65">
                  Select a donation type, enter the needed details, and submit.
                </p>
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="donate-ngo">
                    Choose NGO
                  </label>
                  {!isLoading && availableNgos.length === 0 ? (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                      {ngos.length === 0
                        ? "No NGOs available at the moment. Please try again later."
                        : "You have already donated to all available NGOs. Check back when new NGOs are added."}
                    </p>
                  ) : (
                    <select
                      id="donate-ngo"
                      name="NGOId"
                      className="input-field"
                      value={formData.NGOId}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select NGO</option>
                      {availableNgos.map((ngo) => (
                        <option key={ngo._id || ngo.id} value={ngo._id || ngo.id}>
                          {ngo.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-ink/75">
                    Select donation type
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        value: "money",
                        title: "Money donation",
                        copy: "Direct financial support for urgent NGO needs.",
                      },
                      {
                        value: "item",
                        title: "Item donation",
                        copy: "Supplies, clothes, kits, and other essentials.",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={[
                          "cursor-pointer rounded-3xl border p-4 transition",
                          formData.type === option.value
                            ? "border-ink bg-ink text-white"
                            : "border-ink/10 bg-sand hover:border-ink/35",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={option.value}
                          className="sr-only"
                          checked={formData.type === option.value}
                          onChange={handleChange}
                        />
                        <p className="font-semibold">{option.title}</p>
                        <p
                          className={[
                            "mt-2 text-sm",
                            formData.type === option.value ? "text-white/75" : "text-ink/65",
                          ].join(" ")}
                        >
                          {option.copy}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.type === "money" ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="donate-amount">
                      Enter amount
                    </label>
                    <input
                      id="donate-amount"
                      name="amount"
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="donate-itemDetails">
                      Enter item details
                    </label>
                    <textarea
                      id="donate-itemDetails"
                      name="itemDetails"
                      rows="4"
                      className="input-field"
                      placeholder="Describe what you are donating"
                      value={formData.itemDetails}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button w-full"
                  disabled={isSubmitting || isLoading || availableNgos.length === 0}
                >
                  {isSubmitting ? "Submitting donation..." : "Submit donation"}
                </button>
              </form>
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="panel p-6">
            <h2 className="font-display text-2xl font-bold">How it works</h2>
            <div className="mt-5 space-y-4">
              {[
                "Choose an NGO from the live backend list.",
                "Select whether you want to donate money or items.",
                "Fill in the matching details and submit instantly.",
              ].map((step, index) => (
                <div key={step} className="flex gap-4 rounded-3xl bg-sand p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ember text-sm font-bold text-white">
                    0{index + 1}
                  </div>
                  <p className="pt-2 text-sm font-semibold text-ink/80">{step}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Recent donations</h2>
              <Link to="/dashboard" className="text-sm font-semibold text-ember">
                Dashboard
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {isLoading ? (
                <p className="text-sm text-ink/65">Loading recent donations...</p>
              ) : recentDonations.length === 0 ? (
                <p className="text-sm text-ink/65">No donations submitted yet.</p>
              ) : (
                recentDonations.map((donation, index) => (
                  <div
                    key={donation.id || donation._id || index}
                    className="rounded-3xl border border-ink/10 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold capitalize">
                          {donation.type || "Unknown"} donation
                        </p>
                        {/* Backend returns NGOId as { id, name, email, role } */}
                        <p className="mt-1 text-sm text-ink/65">
                          {typeof donation.NGOId === "object"
                            ? donation.NGOId?.name || "NGO"
                            : ngos.find(
                                (n) => (n._id || n.id) === donation.NGOId
                              )?.name || "NGO"}
                        </p>
                        <p className="mt-2 text-sm text-ink/70">
                          {donation.type === "money"
                            ? `Amount: ${donation.amount ?? 0}`
                            : donation.itemDetails || "No details"}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                        {donation.status || "pending"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
