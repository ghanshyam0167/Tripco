import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword, verifyResetOTP, resetPassword } from "../../api/auth.api";
import OTPInput from "../../components/ui/OTPInput";
import { Mail, CheckCircle, ArrowLeft, KeyRound, Lock } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"EMAIL" | "OTP" | "RESET">("EMAIL");
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResendCountdown((n) => n - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCountdown]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      await forgotPassword({ email });
      setStep("OTP");
      setResendCountdown(60);
      toast.success("Reset code sent! Check your email.");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await verifyResetOTP({ email, otp });
      setResetToken(res.resetToken);
      setStep("RESET");
      toast.success("Code verified! Set your new password.");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      await resetPassword({ email, resetToken, newPassword });
      toast.success("Password reset securely! You can now log in.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    await handleSendOTP();
  };

  // ─── Rendering helpers ────────────────────────────────────────────────────────

  const renderHeroIcon = () => {
    if (step === "EMAIL") return <Mail size={28} color="#fff" strokeWidth={2.5} />;
    if (step === "OTP") return <KeyRound size={28} color="#fff" strokeWidth={2.5} />;
    return <Lock size={28} color="#fff" strokeWidth={2.5} />;
  };

  const renderHeroText = () => {
    if (step === "EMAIL") return "Forgot password?";
    if (step === "OTP") return "Check your email.";
    return "Secure your account.";
  };

  const renderHeroSubtext = () => {
    if (step === "EMAIL") return "No worries, we'll send you reset instructions.";
    if (step === "OTP") return `We sent a reset code to ${email}`;
    return "Choose a new password for your account.";
  };

  const stepsList = ["Email", "Verify", "New Password"];
  const currentStepIdx = step === "EMAIL" ? 0 : step === "OTP" ? 1 : 2;

  const renderStepIcon = (i: number) => {
    if (i < currentStepIdx) return "✓";
    if (i === currentStepIdx) {
      if (i === 1) return <KeyRound size={14} />;
      if (i === 2) return <Lock size={14} />;
      return <Mail size={14} />;
    }
    return i + 1;
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-hero" style={{ background: "linear-gradient(to right, #0f172a, #1e293b)" }}>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, #ef4444, #f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {renderHeroIcon()}
          </div>

          <h2
            style={{
              fontSize: 32, fontWeight: 900, color: "#fff",
              letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 14,
            }}
          >
            {renderHeroText()}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.75 }}>
            {renderHeroSubtext()}
          </p>

          {/* Stepper tracking progress */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 40 }}>
            {stepsList.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: i < currentStepIdx 
                        ? "var(--green-500)" 
                        : i === currentStepIdx ? "#fff" : "rgba(255,255,255,.15)",
                      color: i < currentStepIdx 
                        ? "#fff" 
                        : i === currentStepIdx ? "var(--slate-900)" : "rgba(255,255,255,.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13,
                      transition: "all .3s ease",
                    }}
                  >
                    {renderStepIcon(i)}
                  </div>
                  <span style={{ fontSize: 10, color: i === currentStepIdx ? "#fff" : "rgba(255,255,255,.3)", fontWeight: 600 }}>
                    {label}
                  </span>
                </div>
                {i < stepsList.length - 1 && (
                  <div style={{ 
                    width: 40, height: 2, 
                    background: i < currentStepIdx ? "var(--green-500)" : "rgba(255,255,255,.15)", 
                    margin: "0 4px 18px", transition: "background .3s" 
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="anim-fade-up" style={{ width: "100%", maxWidth: 400 }}>
          
          {step === "EMAIL" && (
            <form onSubmit={handleSendOTP} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
                  Reset Password
                </h1>
                <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 6, marginBottom: 20 }}>
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <div className="form-group">
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {errorMsg && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", color: "var(--red-500)", fontSize: 13, textAlign: "center" }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isLoading || !email}
                style={{ width: "100%", marginTop: 8 }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Sending…
                  </span>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>
          )}

          {step === "OTP" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
                  Enter Reset Code
                </h1>
                <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 6, marginBottom: 12 }}>
                  We sent a 6-digit code to <strong style={{ color: "var(--slate-700)" }}>{email}</strong>.
                </p>
              </div>

              <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

              {errorMsg && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", color: "var(--red-500)", fontSize: 13, textAlign: "center" }}>
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                className="btn btn-primary btn-lg"
                disabled={isLoading || otp.length < 6}
                style={{ width: "100%", marginTop: 8 }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Verifying…
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <CheckCircle size={18} /> Verify Code
                  </span>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button
                  onClick={handleResend}
                  disabled={resendCountdown > 0}
                  style={{
                    background: "none", border: "none", cursor: resendCountdown > 0 ? "default" : "pointer",
                    color: resendCountdown > 0 ? "var(--slate-400)" : "var(--violet-600)",
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}

          {step === "RESET" && (
            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
                  Set New Password
                </h1>
                <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 6, marginBottom: 20 }}>
                  Almost there! Create a new strong password for your account.
                </p>
              </div>

              <div className="form-group">
                <label className="label">New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", color: "var(--red-500)", fontSize: 13, textAlign: "center" }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isLoading || !newPassword || !confirmPassword}
                style={{ width: "100%", marginTop: 8 }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Saving…
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {step === "EMAIL" && (
            <button
              onClick={() => navigate("/login")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer",
                color: "var(--slate-400)", fontSize: 13, marginTop: 24, padding: 0
              }}
            >
              <ArrowLeft size={14} /> Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
