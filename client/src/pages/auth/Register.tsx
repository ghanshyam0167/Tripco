import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { register, verifyEmail, resendOTP } from "../../api/auth.api";
import { updateTravelerProfile, updateCompanyProfile, requestVerification } from "../../api/profile.api";
import { useAuthStore } from "../../store/authStore";
import OTPInput from "../../components/ui/OTPInput";
import {
  Plane, ArrowRight, ArrowLeft, User, Briefcase,
  Mail, CheckCircle, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

type Role = "TRAVELER" | "COMPANY";
type Step = "credentials" | "otp" | "profile";

const Register = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location  = useLocation();

  // Step tracking — may start at "otp" if coming from Login's unverified-email flow,
  // or at "profile" if coming from VerifyEmail after successful OTP verification.
  const [step, setStep] = useState<Step>(
    (location.state as { step?: Step })?.step ?? "credentials"
  );

  // Flag: were we sent here from an external flow (VerifyEmail / Login redirect)?
  // If so, the OTP back-button should return to /login, not credentials.
  const _state = location.state as {
    step?: Step;
    userId?: string;
    email?: string;
    role?: Role;
    fromLogin?: boolean;
    userNotFound?: boolean;
  } | null;
  const fromLogin = !!(_state?.fromLogin || _state?.step === "profile");

  const [email, setEmail]           = useState(_state?.email ?? "");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [role, setRole]             = useState<Role>(
    (_state?.role as Role | undefined) ?? "TRAVELER"
  );
  const [userId, setUserId]         = useState(_state?.userId ?? "");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // Step 2 state
  const [otp, setOtp]               = useState("");
  const [otpError, setOtpError]     = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResend] = useState(_state?.step === "otp" ? 60 : 0);

  // Step 3 state — Traveler
  const [travellerForm, setTravForm] = useState({
    fullName: "", phone: "", age: "", gender: "prefer_not_to_say", bio: "", travelStyle: "budget",
  });
  // Step 3 state — Company
  const [companyForm, setCompForm] = useState({
    companyName: "", contactPhone: "", website: "", description: "",
    registrationNumber: "", establishedYear: "", city: "", country: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const hasToastedRef = useRef(false);

  // Countdown timer for resend
  useEffect(() => {
    if (_state?.userNotFound && !hasToastedRef.current) {
      toast.error("User not found. Please create a new account to continue.");
      hasToastedRef.current = true;
      // Optional cleanup of history stat if navigated away
      window.history.replaceState({}, "");
    }
  }, [_state?.userNotFound]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResend((n) => n - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCountdown]);

  // ─── Step 1: Register ──────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const data = await register({ email, password, role });
      setUserId(data.userId);
      setResend(60);
      setStep("otp");
      toast.success("Verification code sent! Check your email.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    if (otp.length < 6) { setOtpError("Please enter the complete 6-digit code."); return; }
    setOtpError("");
    setOtpLoading(true);
    try {
      const data = await verifyEmail({ userId, otp });
      setAuth(data.user, data.token);
      setStep("profile");
      toast.success("Email verified! Complete your profile.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setOtpError(e.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    try {
      await resendOTP({ userId });
      setResend(60);
      setOtp("");
      toast.success("New code sent!");
    } catch {
      toast.error("Failed to resend code");
    }
  };

  // ─── Step 3: Complete Profile ──────────────────────────────────────────────
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      if (role === "TRAVELER") {
        await updateTravelerProfile({
          fullName: travellerForm.fullName,
          phone: travellerForm.phone || undefined,
          age: travellerForm.age ? Number(travellerForm.age) : undefined,
          gender: travellerForm.gender,
          bio: travellerForm.bio || undefined,
          preferences: { travelStyle: travellerForm.travelStyle },
        });
        toast.success("Profile complete! Welcome to TripCo ✈️");
        navigate("/traveler");
      } else {
        await updateCompanyProfile({
          companyName: companyForm.companyName,
          contactPhone: companyForm.contactPhone || undefined,
          website: companyForm.website || undefined,
          description: companyForm.description || undefined,
          registrationNumber: companyForm.registrationNumber || undefined,
          establishedYear: companyForm.establishedYear ? Number(companyForm.establishedYear) : undefined,
          location: { city: companyForm.city, country: companyForm.country },
        });
        // Auto-request verification
        await requestVerification().catch(() => {});
        toast.success("Profile submitted for verification!");
        navigate("/company");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to save profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const heroContent = {
    credentials: {
      heading: "Join the world's travel community.",
      sub: "Whether you're an adventurer or a travel company — TripCo has a place for you.",
    },
    otp: {
      heading: "Check your inbox.",
      sub: `We sent a 6-digit verification code to ${email}. Enter it to activate your account.`,
    },
    profile: {
      heading: role === "TRAVELER" ? "Tell us about yourself." : "Set up your company.",
      sub: role === "TRAVELER"
        ? "A complete profile helps us personalise your travel recommendations."
        : "Complete your company profile to apply for verification and start listing trips.",
    },
  };

  const current = heroContent[step];

  // Step progress bar label
  const steps = ["Account", "Verify", "Profile"];
  const stepIndex = step === "credentials" ? 0 : step === "otp" ? 1 : 2;

  return (
    <div className="auth-wrapper">
      {/* ─── Hero ──────────────────────────────────────────────── */}
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
            {step === "otp" ? <Mail size={28} color="#fff" strokeWidth={2.5} />
              : step === "profile" ? (role === "TRAVELER" ? <User size={28} color="#fff" strokeWidth={2.5} /> : <Briefcase size={28} color="#fff" strokeWidth={2.5} />)
              : <Plane size={28} color="#fff" strokeWidth={2.5} />}
          </div>
          <h2
            style={{
              fontSize: 32, fontWeight: 900, color: "#fff",
              letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 14,
            }}
          >
            <span className="gradient-text">{current.heading}</span>
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.75 }}>
            {current.sub}
          </p>

          {/* Progress steps */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 40 }}>
            {steps.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: i < stepIndex ? "var(--green-500)" : i === stepIndex ? "#fff" : "rgba(255,255,255,.15)",
                      color: i < stepIndex ? "#fff" : i === stepIndex ? "var(--violet-700)" : "rgba(255,255,255,.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13,
                      transition: "all .3s ease",
                    }}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 10, color: i === stepIndex ? "#fff" : "rgba(255,255,255,.3)", fontWeight: 600 }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{ width: 40, height: 2, background: i < stepIndex ? "var(--green-500)" : "rgba(255,255,255,.15)", margin: "0 4px 18px", transition: "background .3s" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Form Panel ────────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="anim-fade-up" style={{ width: "100%", maxWidth: 440 }}>

          {/* ── STEP 1: Credentials ── */}
          {step === "credentials" && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
                  Create an account
                </h1>
                <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 6 }}>
                  Choose your role to get started
                </p>
              </div>

              {/* Role selector */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                {([
                  { value: "TRAVELER" as Role, label: "Traveler", desc: "Explore & book amazing trips", icon: <User size={18} /> },
                  { value: "COMPANY" as Role, label: "Company", desc: "Create & manage experiences", icon: <Briefcase size={18} /> },
                ] as const).map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    style={{
                      padding: "14px 16px", border: "2px solid",
                      borderColor: role === r.value ? "var(--violet-500)" : "var(--slate-200)",
                      borderRadius: "var(--radius-lg)",
                      background: role === r.value ? "rgba(139,92,246,.06)" : "#fff",
                      cursor: "pointer", textAlign: "left",
                      transition: "all var(--transition)",
                    }}
                  >
                    <div style={{ color: role === r.value ? "var(--violet-500)" : "var(--slate-400)", marginBottom: 6 }}>{r.icon}</div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--slate-900)", marginBottom: 2 }}>{r.label}</p>
                    <p style={{ fontSize: 11, color: "var(--slate-400)" }}>{r.desc}</p>
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 18, color: "var(--red-500)", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="label">Email address</label>
                  <input id="reg-email" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Password</label>
                  <input id="reg-password" type="password" className="input" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Confirm password</label>
                  <input id="reg-confirm" type="password" className="input" placeholder="Repeat your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
                <button id="reg-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
                  {loading
                    ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account…</span>
                    : <span style={{ display: "flex", alignItems: "center", gap: 8 }}>Continue <ArrowRight size={18} /></span>}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--slate-500)" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "var(--violet-600)", fontWeight: 600, textDecoration: "none" }}>Sign in →</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === "otp" && (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
                  Verify your email
                </h1>
                <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 6 }}>
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
              </div>

              <OTPInput value={otp} onChange={setOtp} disabled={otpLoading} />

              {otpError && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginTop: 20, color: "var(--red-500)", fontSize: 13, textAlign: "center" }}>
                  {otpError}
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                onClick={handleVerifyOTP}
                disabled={otpLoading || otp.length < 6}
                style={{ width: "100%", marginTop: 28 }}
              >
                {otpLoading
                  ? <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Verifying…</span>
                  : <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}><CheckCircle size={18} /> Verify Email</span>}
              </button>

              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  onClick={handleResendOTP}
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

              <button
                onClick={() => {
                  if (fromLogin) navigate("/login");
                  else setStep("credentials");
                }}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", fontSize: 13, marginTop: 16 }}
              >
                <ArrowLeft size={14} /> {fromLogin ? "Back to login" : "Back"}
              </button>
            </>
          )}

          {/* ── STEP 3: Profile Completion ── */}
          {step === "profile" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em" }}>
                  {role === "TRAVELER" ? "Complete your profile" : "Set up your company"}
                </h1>
                <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 6 }}>
                  {role === "TRAVELER"
                    ? "All fields below help us personalise your TripCo experience"
                    : "Required before you can list trips. Your info will be reviewed by our team."}
                </p>
              </div>

              <form onSubmit={handleCompleteProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {role === "TRAVELER" ? (
                  <>
                    <div className="form-group">
                      <label className="label">Full name *</label>
                      <input className="input" placeholder="Your full name" value={travellerForm.fullName} onChange={(e) => setTravForm({ ...travellerForm, fullName: e.target.value })} required />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label className="label">Phone</label>
                        <input className="input" placeholder="+91 xxxxx xxxxx" value={travellerForm.phone} onChange={(e) => setTravForm({ ...travellerForm, phone: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="label">Age</label>
                        <input className="input" type="number" placeholder="25" min={13} max={120} value={travellerForm.age} onChange={(e) => setTravForm({ ...travellerForm, age: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label className="label">Gender</label>
                        <select className="input" value={travellerForm.gender} onChange={(e) => setTravForm({ ...travellerForm, gender: e.target.value })}>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="label">Travel style</label>
                        <select className="input" value={travellerForm.travelStyle} onChange={(e) => setTravForm({ ...travellerForm, travelStyle: e.target.value })}>
                          <option value="budget">Budget</option>
                          <option value="backpacking">Backpacking</option>
                          <option value="luxury">Luxury</option>
                          <option value="family">Family</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label">Bio</label>
                      <textarea className="input" rows={3} placeholder="Tell us about yourself…" value={travellerForm.bio} onChange={(e) => setTravForm({ ...travellerForm, bio: e.target.value })} style={{ resize: "vertical" }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="label">Company name *</label>
                      <input className="input" placeholder="Acme Travels Pvt. Ltd." value={companyForm.companyName} onChange={(e) => setCompForm({ ...companyForm, companyName: e.target.value })} required />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label className="label">Phone *</label>
                        <input className="input" placeholder="+91 xxxxx xxxxx" value={companyForm.contactPhone} onChange={(e) => setCompForm({ ...companyForm, contactPhone: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="label">Website</label>
                        <input className="input" placeholder="https://..." value={companyForm.website} onChange={(e) => setCompForm({ ...companyForm, website: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label className="label">City</label>
                        <input className="input" placeholder="Mumbai" value={companyForm.city} onChange={(e) => setCompForm({ ...companyForm, city: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="label">Country</label>
                        <input className="input" placeholder="India" value={companyForm.country} onChange={(e) => setCompForm({ ...companyForm, country: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label className="label">Registration no.</label>
                        <input className="input" placeholder="CIN / GST No." value={companyForm.registrationNumber} onChange={(e) => setCompForm({ ...companyForm, registrationNumber: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="label">Est. year</label>
                        <input className="input" type="number" placeholder="2015" value={companyForm.establishedYear} onChange={(e) => setCompForm({ ...companyForm, establishedYear: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label">Description</label>
                      <textarea className="input" rows={3} placeholder="Tell travellers about your company…" value={companyForm.description} onChange={(e) => setCompForm({ ...companyForm, description: e.target.value })} style={{ resize: "vertical" }} />
                    </div>

                    {/* Verification notice */}
                    <div
                      style={{
                        background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)",
                        borderRadius: "var(--radius-md)", padding: "14px 16px",
                        display: "flex", gap: 12, alignItems: "flex-start",
                      }}
                    >
                      <ShieldCheck size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>Verification required</p>
                        <p style={{ fontSize: 12, color: "#92400e", marginTop: 2, lineHeight: 1.5 }}>
                          After submitting, an admin will review your details. You'll be able to list trips once approved.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={profileLoading || (role === "TRAVELER" && !travellerForm.fullName) || (role === "COMPANY" && !companyForm.companyName)}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {profileLoading
                    ? <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving…</span>
                    : <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                        {role === "COMPANY" ? <><ShieldCheck size={18} /> Submit & Request Verification</> : <><CheckCircle size={18} /> Complete Profile</>}
                      </span>}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
