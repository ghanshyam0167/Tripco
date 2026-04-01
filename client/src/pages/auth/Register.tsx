import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { Plane, ArrowRight, User, Briefcase } from "lucide-react";

type Role = "TRAVELER" | "COMPANY";

const Register = () => {
  const setAuth  = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "", confirmPassword: "" });
  const [role, setRole]       = useState<Role>("TRAVELER");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await register({ email: form.email, password: form.password, role });
      if (data.token && data.user) {
        setAuth(data.user, data.token);
        navigate(role === "TRAVELER" ? "/traveler" : "/company");
      } else {
        navigate("/login");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: Role; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: "TRAVELER",
      label: "Traveler",
      desc: "Explore & book amazing trips",
      icon: <User size={20} />,
    },
    {
      value: "COMPANY",
      label: "Company",
      desc: "Create & manage travel experiences",
      icon: <Briefcase size={20} />,
    },
  ];

  return (
    <div className="auth-wrapper">
      {/* ─── Hero Panel ──────────────────────────────────────── */}
      <div className="auth-hero">
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, var(--violet-600), #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "var(--shadow-glow)",
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          >
            <Plane size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <h2
            style={{
              fontSize: 34, fontWeight: 900, color: "#fff",
              letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16,
            }}
          >
            Join the world's
            <br />
            <span className="gradient-text">travel community.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}>
            Whether you're an adventurer or a travel company — TripCo has a place for you.
          </p>
        </div>
      </div>

      {/* ─── Form Panel ──────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="anim-fade-up" style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
              Create an account
            </h1>
            <p style={{ fontSize: 15, color: "var(--slate-500)", marginTop: 6 }}>
              Choose your role to get started
            </p>
          </div>

          {/* Role selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                id={`role-${r.value.toLowerCase()}`}
                onClick={() => setRole(r.value)}
                style={{
                  padding: "16px", border: "2px solid",
                  borderColor: role === r.value ? "var(--violet-500)" : "var(--slate-200)",
                  borderRadius: "var(--radius-lg)", background: role === r.value
                    ? "rgba(139,92,246,.06)" : "#fff",
                  cursor: "pointer", textAlign: "left",
                  transition: "all var(--transition)",
                }}
              >
                <div
                  style={{
                    color: role === r.value ? "var(--violet-500)" : "var(--slate-400)",
                    marginBottom: 8, transition: "color var(--transition)",
                  }}
                >
                  {r.icon}
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--slate-900)", marginBottom: 2 }}>
                  {r.label}
                </p>
                <p style={{ fontSize: 11, color: "var(--slate-400)" }}>{r.desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)",
                borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20,
                color: "var(--red-500)", fontSize: 14, fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-group">
              <label className="label">Email address</label>
              <input
                id="register-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                id="register-password"
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Confirm password</label>
              <input
                id="register-confirm-password"
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Creating account…
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Create account <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--slate-500)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--violet-600)", fontWeight: 600, textDecoration: "none" }}
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
