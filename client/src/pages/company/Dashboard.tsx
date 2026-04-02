import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import StatsCard from "../../components/ui/StatsCard";
import PageLoader from "../../components/ui/PageLoader";
import { useTripStore } from "../../store/tripStore";
import { useBookingStore } from "../../store/bookingStore";
import { getCompanyProfile, requestVerification, updateCompanyProfile } from "../../api/profile.api";
import type { CompanyProfile } from "../../types";
import { List, CalendarCheck, PlusCircle, TrendingUp, ArrowRight, DollarSign, ShieldCheck, Clock, AlertTriangle, Building } from "lucide-react";
import toast from "react-hot-toast";

const CompanyDashboard = () => {
  const { trips, fetchTrips, loading: tripsLoading } = useTripStore();
  const { companyBookings, fetchCompanyBookings } = useBookingStore();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [companyForm, setCompForm] = useState({
    companyName: "", contactPhone: "", website: "", description: "",
    registrationNumber: "", establishedYear: "", city: "", country: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
    fetchCompanyBookings();
    getCompanyProfile().then((p) => {
      setProfile(p);
      if (p) {
        setCompForm({
          companyName: p.companyName || "",
          contactPhone: p.contactPhone || "",
          website: p.website || "",
          description: p.description || "",
          registrationNumber: p.registrationNumber || "",
          establishedYear: p.establishedYear ? p.establishedYear.toString() : "",
          city: p.location?.city || "",
          country: p.location?.country || "",
        });
      }
    }).catch(() => {});
  }, []);

  if (tripsLoading && trips.length === 0) return <PageLoader />;

  const totalRevenue = companyBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const activeTrips = trips.filter((t) => t.status === "active").length;

  const verStatus = profile?.verificationStatus;

  const handleRequestVerification = async () => {
    try {
      await requestVerification();
      setProfile((p) => p ? { ...p, verificationStatus: "pending" } : p);
      toast.success("Verification request sent!");
    } catch {
      toast.error("Failed to submit request");
    }
  };

  const handleCompleteProfileAndVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateCompanyProfile({
        companyName: companyForm.companyName,
        contactPhone: companyForm.contactPhone || undefined,
        website: companyForm.website || undefined,
        description: companyForm.description || undefined,
        registrationNumber: companyForm.registrationNumber || undefined,
        establishedYear: companyForm.establishedYear ? Number(companyForm.establishedYear) : undefined,
        location: { city: companyForm.city, country: companyForm.country },
      });
      await requestVerification();
      toast.success("Profile verified! Your request is pending admin approval.");
      const updatedProfile = await getCompanyProfile();
      setProfile(updatedProfile);
    } catch {
      toast.error("Failed to submit profile details.");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">

        {/* Missing or Rejected Profile Form Banner */}
        {!profile || verStatus === "rejected" ? (
          <div className="card" style={{ marginBottom: 32, padding: 24, border: `2px solid ${verStatus === "rejected" ? "rgba(239,68,68,.2)" : "var(--violet-200)"}`, background: verStatus === "rejected" ? "rgba(239,68,68,.03)" : "rgba(139,92,246,.03)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              {verStatus === "rejected" ? <AlertTriangle size={24} color="#dc2626" /> : <Building size={24} color="var(--violet-600)" />}
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--slate-900)" }}>
                  {verStatus === "rejected" ? "Application Rejected — Update Profile" : "Complete Your Profile to Get Verified"}
                </h2>
                <p style={{ fontSize: 13, color: "var(--slate-500)", marginTop: 2 }}>
                  {verStatus === "rejected" ? (
                    <>
                      <strong style={{ color: "#dc2626" }}>Admin Note: </strong> 
                      {profile?.verificationMessage || "Please review and update your information."}
                    </>
                  ) : (
                    "You skipped profile completion. Fill these details to request verification and start creating trips."
                  )}
                </p>
              </div>
            </div>
            <form onSubmit={handleCompleteProfileAndVerify} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="input" rows={2} placeholder="Tell travellers about your company…" value={companyForm.description} onChange={(e) => setCompForm({ ...companyForm, description: e.target.value })} style={{ resize: "vertical" }} />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading || !companyForm.companyName || !companyForm.contactPhone}
                style={{ alignSelf: "flex-start", marginTop: 8 }}
              >
                {profileLoading ? "Submitting..." : "Submit Profile & Request Verification"}
              </button>
            </form>
          </div>
        ) : verStatus !== "approved" && (
          <div
            style={{
              marginBottom: 24,
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              display: "flex", gap: 14, alignItems: "center",
              background: "rgba(245,158,11,.06)",
              border: "1.5px solid rgba(245,158,11,.2)"
            }}
          >
            {verStatus === "pending"
              ? <Clock size={20} color="#b45309" style={{ flexShrink: 0 }} />
              : <ShieldCheck size={20} color="#b45309" style={{ flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>
                {verStatus === "pending" ? "Verification pending" : "Verification required"}
              </p>
              <p style={{ fontSize: 12, color: "#92400e", marginTop: 2 }}>
                {verStatus === "pending"
                  ? "Your verification request is under review. You'll be notified once approved."
                  : "Submit a verification request to start listing trips."}
              </p>
            </div>
            {(verStatus !== "pending") && (
              <button
                className="btn btn-sm"
                onClick={handleRequestVerification}
                style={{ background: "rgba(245,158,11,.12)", color: "#b45309", border: "none", fontWeight: 700, flexShrink: 0 }}
              >
                <ShieldCheck size={14} /> Request Verification
              </button>
            )}
          </div>
        )}
        {/* Welcome banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1145 0%, var(--navy-900) 60%, #0f3460 100%)",
            borderRadius: "var(--radius-xl)", padding: "32px 36px",
            marginBottom: 32, position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, background: "radial-gradient(circle, rgba(245,158,11,.2), transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Company Portal</p>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 8 }}>
              Manage your travel experiences
            </h1>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15 }}>
              {trips.length} trips listed · {companyBookings.length} total bookings
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/company/create")}
              disabled={verStatus !== "approved"}
              title={verStatus !== "approved" ? "You must be approved to create trips" : ""}
              style={{ marginTop: 20, opacity: verStatus !== "approved" ? 0.6 : 1, cursor: verStatus !== "approved" ? "not-allowed" : "pointer" }}
            >
              <PlusCircle size={16} /> Create New Trip
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 36 }}>
          <StatsCard
            title="Total Trips"
            value={trips.length}
            subtitle={`${activeTrips} active`}
            icon={<List size={22} />}
            color="var(--violet-500)"
          />
          <StatsCard
            title="Total Bookings"
            value={companyBookings.length}
            subtitle="across all trips"
            icon={<CalendarCheck size={22} />}
            color="var(--amber-500)"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            subtitle="from confirmed bookings"
            icon={<DollarSign size={22} />}
            color="var(--green-500)"
          />
          <StatsCard
            title="Avg. per Booking"
            value={companyBookings.length > 0 ? `₹${Math.round(totalRevenue / companyBookings.length).toLocaleString()}` : "—"}
            subtitle="average booking value"
            icon={<TrendingUp size={22} />}
            color="var(--red-500)"
          />
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            { label: "Manage Trips",    icon: <List size={20} />,         path: "/company/trips",    desc: "Edit or remove your listed trips" },
            { label: "View Bookings",   icon: <CalendarCheck size={20} />, path: "/company/bookings", desc: "See who booked your trips" },
          ].map((action) => (
            <div
              key={action.label}
              className="card"
              style={{ padding: 24, cursor: "pointer", display: "flex", gap: 16, alignItems: "center" }}
              onClick={() => navigate(action.path)}
            >
              <div
                style={{
                  width: 48, height: 48, borderRadius: "var(--radius-md)",
                  background: "rgba(139,92,246,.1)", color: "var(--violet-500)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {action.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: "var(--slate-900)" }}>{action.label}</p>
                <p style={{ fontSize: 13, color: "var(--slate-500)", marginTop: 2 }}>{action.desc}</p>
              </div>
              <ArrowRight size={18} color="var(--slate-400)" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;
