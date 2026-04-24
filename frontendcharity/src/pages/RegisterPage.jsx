import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

const aside = [
  { value: "Food", title: "Community Relief", copy: "Coordinate meals and essentials from one interface." },
  { value: "Clothes", title: "Seasonal Drives", copy: "Launch item-based campaigns for local shelters." },
  { value: "Money", title: "Direct Funding", copy: "Track monetary support for urgent NGO goals." },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "donor",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Start here"
      title="Create an account built for donors, NGOs, and admins."
      description="Register once, then move from outreach to action with a fast and focused workflow."
      aside={aside}
    >
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-3xl font-bold">Register</h2>
          <p className="mt-2 text-ink/65">
            Join the platform and start coordinating impact.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="register-name">
              Full name
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              className="input-field"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="register-role">
                Role
              </label>
              <select
                id="register-role"
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
              >
                <option>donor</option>
                <option>ngo</option>
                <option>admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="input-field"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="primary-button flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </button>
            <Link to="/login" className="secondary-button flex-1">
              Already have an account
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
