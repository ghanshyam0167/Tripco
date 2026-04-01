import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import StatsCard from "../../components/ui/StatsCard";
import PageLoader from "../../components/ui/PageLoader";
import { useTripStore } from "../../store/tripStore";
import { useBookingStore } from "../../store/bookingStore";
import { List, CalendarCheck, PlusCircle, TrendingUp, ArrowRight, DollarSign } from "lucide-react";

const CompanyDashboard = () => {
  const { trips, fetchTrips, loading } = useTripStore();
  const { companyBookings, fetchCompanyBookings } = useBookingStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
    fetchCompanyBookings();
  }, []);

  if (loading && trips.length === 0) return <PageLoader />;

  const totalRevenue = companyBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const activeTrips = trips.filter((t) => t.status === "active").length;

  return (
    <Layout>
      <div className="page">
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
              style={{ marginTop: 20 }}
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
