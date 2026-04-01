import Layout from "../../components/layout/Layout";
import StatsCard from "../../components/ui/StatsCard";
import { Users, List, CalendarCheck, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="page">
        <div
          style={{
            background: "linear-gradient(135deg, #0a0a1a 0%, #1a0530 50%, #0d1f40 100%)",
            borderRadius: "var(--radius-xl)", padding: "32px 36px", marginBottom: 32,
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: "radial-gradient(circle, rgba(239,68,68,.25), transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Admin Control Center</p>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
              System Overview
            </h1>
            <p style={{ color: "rgba(255,255,255,.45)", marginTop: 8 }}>
              Monitor platform-wide activity and manage system health
            </p>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 36 }}>
          <StatsCard title="Total Users"    value="—"  icon={<Users size={22} />}       color="var(--violet-500)" subtitle="registered accounts" />
          <StatsCard title="Total Trips"    value="—"  icon={<List size={22} />}         color="var(--amber-500)"  subtitle="active listings" />
          <StatsCard title="Total Bookings" value="—"  icon={<CalendarCheck size={22} />} color="var(--green-500)"  subtitle="all time" />
          <StatsCard title="Verified Co."   value="—"  icon={<ShieldCheck size={22} />}  color="var(--red-500)"    subtitle="verified companies" />
        </div>

        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>
          <ShieldCheck size={48} strokeWidth={1.5} style={{ margin: "0 auto 16px", color: "var(--slate-300)" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--slate-600)", marginBottom: 8 }}>
            Admin endpoints coming soon
          </h3>
          <p style={{ fontSize: 14 }}>
            Full admin APIs for user management, analytics, and verification are in the roadmap.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
