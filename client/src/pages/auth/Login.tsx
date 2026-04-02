import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { Plane, Eye, EyeOff, ArrowRight, Mail } from "lucide-react";

const Login = () => {
  const setAuth  = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const [form, setForm]           = useState({ email: "", password: "" });
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const [unverifiedUserId, setUnverifiedUserId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotVerified(false);
    setLoading(true);
    try {
      const data = await login(form);
      setAuth(data.user, data.token);
      if (data.user.role === "TRAVELER")      navigate("/traveler");
      else if (data.user.role === "COMPANY")  navigate("/company");
      else                                    navigate("/admin");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; code?: string; userId?: string; email?: string } } };
      const msg = e.response?.data?.message;
      const code = e.response?.data?.code;
      if (code === "EMAIL_NOT_VERIFIED") {
        setNotVerified(true);
        setUnverifiedUserId(e.response?.data?.userId || "");
      } else if (msg === "User not found") {
        navigate("/register", {
          state: {
            email: form.email,
            userNotFound: true,
          },
        });
      } else {
        setError(msg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* ─── Hero Panel ────────────────────────────────────────── */}
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
              fontSize: 36, fontWeight: 900, color: "#fff",
              letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16,
            }}
          >
            Your next adventure
            <br />
            <span className="gradient-text">starts here.</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.55)", lineHeight: 1.7 }}>
            Join thousands of travelers discovering the world's most incredible destinations with TripCo.
          </p>

          {/* Floating stat pills */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
            {[
              { num: "50K+", label: "Travelers" },
              { num: "1200+", label: "Trips" },
              { num: "4.9★", label: "Rating" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-glass"
                style={{ padding: "12px 18px", textAlign: "center" }}
              >
                <p style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{stat.num}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Form Panel ────────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="anim-fade-up" style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 15, color: "var(--slate-500)", marginTop: 6 }}>
              Sign in to continue your journey
            </p>
          </div>

          {notVerified && (
            <div
              style={{
                background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)",
                borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: 20,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}
            >
              <Mail size={16} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>Email not verified</p>
                <p style={{ fontSize: 12, color: "#92400e", marginTop: 2 }}>
                  Please verify your email before logging in.
                </p>
                <button
                  id="go-to-verify"
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams({
                      userId: unverifiedUserId,
                      email: form.email,
                    });
                    navigate(`/verify-email?${params.toString()}`);
                  }}
                  style={{
                    marginTop: 8,
                    background: "var(--violet-600)", color: "#fff",
                    border: "none", borderRadius: "var(--radius-md)",
                    padding: "6px 14px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Verify Email →
                </button>
              </div>
            </div>
          )}

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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-group">
              <label className="label">Email address</label>
              <input
                id="login-email"
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
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--slate-400)", display: "flex", alignItems: "center",
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Signing in…
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Sign in <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--slate-500)" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ color: "var(--violet-600)", fontWeight: 600, textDecoration: "none" }}
            >
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;