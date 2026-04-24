import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

const aside = [
  { value: "450+", title: "Active NGOs", copy: "Local partners updating needs in real time." },
  { value: "2.1k", title: "Monthly Donors", copy: "People giving money, meals, and essentials." },
  { value: "24h", title: "Rapid Response", copy: "Urgent needs surfaced fast through one dashboard." },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      await login(formData);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to manage giving with clarity and speed."
      description="Use one clean workspace for donor activity, NGO requests, and mission updates."
      aside={aside}
    >
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-3xl font-bold">Sign in</h2>
          <p className="mt-2 text-ink/65">
            Continue to your CharityHub dashboard.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
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
            <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="input-field"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="primary-button flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            <Link to="/register" className="secondary-button flex-1">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
