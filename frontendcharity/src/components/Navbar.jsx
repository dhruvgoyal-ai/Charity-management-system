import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = isAuthenticated
    ? [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Requests", to: "/requests" },
        ...(user?.role === "donor" || user?.role === "admin"
          ? [{ label: "Donate", to: "/donate" }]
          : []),
      ]
    : [
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
      ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-sand/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-lg font-bold text-white">
            CH
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-tight">CharityHub</p>
            <p className="text-sm text-ink/60">Serve faster. Give smarter.</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 p-1 shadow-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-sand",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {isAuthenticated && user ? (
            <div className="hidden items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-sm sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/55">{user.role}</p>
              </div>
              <button type="button" className="secondary-button px-4 py-2" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
