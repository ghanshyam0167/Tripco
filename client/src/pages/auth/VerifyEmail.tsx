import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail, resendOTP } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import OTPInput from "../../components/ui/OTPInput";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Standalone Email Verification page.
 *
 * Reached via:
 *   /verify-email?userId=<id>&email=<addr>
 *
 * Using search-params keeps the data alive across page refreshes.
 * After successful verification the user is redirected to the profile-
 * completion step inside /register (they still need to fill profile).
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const setAuth         = useAuthStore((s) => s.setAuth);

  const userId = searchParams.get("userId") ?? "";
  const email  = searchParams.get("email")  ?? "";

  const [otp,            setOtp]            = useState("");
  const [otpError,       setOtpError]       = useState("");
  const [otpLoading,     setOtpLoading]     = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Redirect to login if params are missing
  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResendCountdown((n) => n - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCountdown]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const data = await verifyEmail({ userId, otp });
      // Store auth so they can make authenticated profile-completion requests
      setAuth(data.user, data.token);
      toast.success("Email verified! Complete your profile.");
      // Send to profile-completion step inside /register
      navigate("/register", {
        replace: true,
        state: {
          step:   "profile",
          userId: data.user._id,
          email:  data.user.email,
          role:   data.user.role,
        },
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setOtpError(e.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || !userId) return;
    try {
      await resendOTP({ userId });
      setResendCountdown(60);
      setOtp("");
      toast.success("New verification code sent!");
    } catch {
      toast.error("Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* ─── Hero Panel ─────────────────────────────────────── */}
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
            <Mail size={28} color="#fff" strokeWidth={2.5} />
          </div>

          <h2
            style={{
              fontSize: 32, fontWeight: 900, color: "#fff",
              letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 14,
            }}
          >
            <span className="gradient-text">Check your inbox.</span>
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.75 }}>
            {email
              ? <>We sent a 6-digit code to <strong style={{ color: "#fff" }}>{email}</strong>. Enter it below to verify your account.</>
              : "Enter the 6-digit verification code sent to your email."}
          </p>

          {/* Step pills */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 40 }}>
            {["Account", "Verify", "Profile"].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: i < 1 ? "var(--green-500)" : i === 1 ? "#fff" : "rgba(255,255,255,.15)",
                      color: i < 1 ? "#fff" : i === 1 ? "var(--violet-700)" : "rgba(255,255,255,.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13,
                      transition: "all .3s ease",
                    }}
                  >
                    {i < 1 ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 10, color: i === 1 ? "#fff" : "rgba(255,255,255,.3)", fontWeight: 600 }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{ width: 40, height: 2, background: i < 1 ? "var(--green-500)" : "rgba(255,255,255,.15)", margin: "0 4px 18px", transition: "background .3s" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Form Panel ─────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="anim-fade-up" style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
              Verify your email
            </h1>
            <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 6 }}>
              Enter the 6-digit code sent to{" "}
              <strong style={{ color: "var(--slate-700)" }}>{email || "your email"}</strong>
            </p>
          </div>

          <OTPInput value={otp} onChange={setOtp} disabled={otpLoading} />

          {otpError && (
            <div
              style={{
                background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)",
                borderRadius: "var(--radius-md)", padding: "12px 16px", marginTop: 20,
                color: "var(--red-500)", fontSize: 13, textAlign: "center",
              }}
            >
              {otpError}
            </div>
          )}

          <button
            id="verify-email-submit"
            className="btn btn-primary btn-lg"
            onClick={handleVerify}
            disabled={otpLoading || otp.length < 6}
            style={{ width: "100%", marginTop: 28 }}
          >
            {otpLoading
              ? <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Verifying…
                </span>
              : <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <CheckCircle size={18} /> Verify Email
                </span>}
          </button>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              id="verify-email-resend"
              onClick={handleResend}
              disabled={resendCountdown > 0}
              style={{
                background: "none", border: "none",
                cursor: resendCountdown > 0 ? "default" : "pointer",
                color: resendCountdown > 0 ? "var(--slate-400)" : "var(--violet-600)",
                fontSize: 14, fontWeight: 600,
              }}
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
            </button>
          </div>

          <button
            id="verify-email-back"
            onClick={() => navigate("/login")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: "var(--slate-400)", fontSize: 13, marginTop: 20,
            }}
          >
            <ArrowLeft size={14} /> Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
