import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import StatsCard from "../../components/ui/StatsCard";
import TripCard from "../../components/ui/TripCard";
import PageLoader from "../../components/ui/PageLoader";
import { useTripStore } from "../../store/tripStore";
import { useBookingStore } from "../../store/bookingStore";
import { useAuthStore } from "../../store/authStore";
import {
  Compass, CalendarCheck, Heart, TrendingUp, ArrowRight,
} from "lucide-react";

const TravelerDashboard = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips, loading: tripsLoading } = useTripStore();
  const { myBookings, fetchMyBookings } = useBookingStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
    fetchMyBookings();
  }, []);

  if (tripsLoading && trips.length === 0) return <PageLoader />;

  const activeBookings   = myBookings.filter((b) => b.status === "confirmed").length;
  const cancelledBookings = myBookings.filter((b) => b.status === "cancelled").length;
  const featured = trips.slice(0, 3);

  return (
    <Layout>
      <div className="page">
        {/* Welcome header */}
        <div
          className="page-header"
          style={{
            background: "linear-gradient(135deg, var(--navy-900) 0%, #1a1145 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "32px 36px",
            marginBottom: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(139,92,246,.3), transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Good morning 👋
            </p>
            <h1 className="page-title" style={{ color: "#fff", marginBottom: 8, fontSize: 32 }}>
              {user?.email?.split("@")[0]}
            </h1>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15 }}>
              Explore new adventures — {trips.length} trips waiting for you
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/traveler/trips")}
              style={{ marginTop: 20 }}
            >
              Explore Now <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 36 }}>
          <StatsCard
            title="Available Trips"
            value={trips.length}
            subtitle="across all destinations"
            icon={<Compass size={22} />}
            color="var(--violet-500)"
          />
          <StatsCard
            title="My Bookings"
            value={myBookings.length}
            subtitle={`${activeBookings} active`}
            icon={<CalendarCheck size={22} />}
            color="var(--amber-500)"
          />
          <StatsCard
            title="Saved Trips"
            value="0"
            subtitle="in your wishlist"
            icon={<Heart size={22} />}
            color="var(--red-500)"
          />
          <StatsCard
            title="Trips Taken"
            value={cancelledBookings > 0 ? myBookings.length - cancelledBookings : 0}
            subtitle="completed"
            icon={<TrendingUp size={22} />}
            color="var(--green-500)"
          />
        </div>

        {/* Featured trips */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.02em" }}>
                Featured Trips
              </h2>
              <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 2 }}>
                Handpicked experiences just for you
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/traveler/trips")}
            >
              View all →
            </button>
          </div>

          {featured.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--slate-400)" }}>
              No trips available yet. Check back soon!
            </div>
          ) : (
            <div className="trips-grid">
              {featured.map((trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onAction={(t) => navigate(`/traveler/trips/${t._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TravelerDashboard;
