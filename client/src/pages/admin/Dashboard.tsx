import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import StatsCard from "../../components/ui/StatsCard";
import PageLoader from "../../components/ui/PageLoader";
import { getAdminStats, type AdminStats } from "../../api/admin.api";
import { Users, List, CalendarCheck, DollarSign, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((s) => setStats(s))
      .catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <Layout title="Dashboard">
      <div className="page">
        {/* Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0a0a1a 0%, #12003a 50%, #0d1f40 100%)",
            borderRadius: "var(--radius-xl)", padding: "32px 36px", marginBottom: 32,
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, background: "radial-gradient(circle, rgba(239,68,68,.2), transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -60, left: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(139,92,246,.2), transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <ShieldCheck size={20} color="var(--red-400)" />
              <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, fontWeight: 600 }}>Admin Control Center</p>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
              Platform Overview
            </h1>
            <p style={{ color: "rgba(255,255,255,.4)", marginTop: 8 }}>
              Live stats · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* KPI Stats */}
        {stats && (
          <div className="stats-grid" style={{ marginBottom: 36 }}>
            <StatsCard title="Total Users"       value={stats.totalUsers}       icon={<Users size={22} />}        color="var(--violet-500)" subtitle="registered accounts" />
            <StatsCard title="Total Trips"       value={stats.totalTrips}       icon={<List size={22} />}          color="var(--amber-500)"  subtitle="active listings" />
            <StatsCard title="Total Bookings"    value={stats.totalBookings}    icon={<CalendarCheck size={22} />} color="var(--green-500)"  subtitle="all time" />
            <StatsCard title="Platform Revenue"  value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign size={22} />} color="var(--violet-500)" subtitle="from confirmed bookings" />
            <StatsCard title="Total Companies"   value={stats.totalCompanies}   icon={<TrendingUp size={22} />}    color="var(--amber-500)"  subtitle={`${stats.verifiedCompanies} verified`} />
            <StatsCard title="Pending Approval"  value={stats.pendingCompanies} icon={<AlertTriangle size={22} />} color="var(--red-500)"    subtitle="companies awaiting review" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
