import { useEffect } from "react";
import Layout from "../../components/layout/Layout";
import EmptyState from "../../components/ui/EmptyState";
import PageLoader from "../../components/ui/PageLoader";
import { useBookingStore } from "../../store/bookingStore";
import type { Trip } from "../../types";
import { MapPin, Calendar, CheckCircle, X, Clock } from "lucide-react";

const statusConfig = {
  confirmed: { label: "Confirmed", bg: "rgba(34,197,94,.12)",  color: "#15803d", icon: <CheckCircle size={12} /> },
  pending:   { label: "Pending",   bg: "rgba(245,158,11,.12)", color: "#b45309", icon: <Clock size={12} /> },
  cancelled: { label: "Cancelled", bg: "rgba(239,68,68,.12)",  color: "#dc2626", icon: <X size={12} /> },
};

const CompanyBookings = () => {
  const { companyBookings, fetchCompanyBookings, loading } = useBookingStore();

  useEffect(() => { fetchCompanyBookings(); }, []);

  const totalRevenue = companyBookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading) return <PageLoader />;

  return (
    <Layout title="Bookings">
      <div className="page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 className="page-title">Bookings</h1>
            <p className="page-subtitle">
              {companyBookings.length} booking{companyBookings.length !== 1 ? "s" : ""} ·{" "}
              <strong style={{ color: "var(--green-500)" }}>₹{totalRevenue.toLocaleString()}</strong> revenue
            </p>
          </div>
        </div>

        {companyBookings.length === 0 ? (
          <EmptyState title="No bookings yet" description="Bookings for your trips will appear here." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Customer</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {companyBookings.map((booking) => {
                  const trip = booking.tripId as Trip;
                  const user = booking.userId as { email: string };
                  const sc = statusConfig[booking.status] || statusConfig.pending;
                  return (
                    <tr key={booking._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--violet-600), #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✈️</div>
                          <div>
                            <p style={{ fontWeight: 600 }}>{typeof trip === "object" ? trip.title : "—"}</p>
                            {typeof trip === "object" && trip.destination?.city && (
                              <p style={{ fontSize: 12, color: "var(--slate-400)", display: "flex", alignItems: "center", gap: 4 }}>
                                <MapPin size={11} /> {trip.destination.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: "var(--slate-600)" }}>
                          {typeof user === "object" ? user.email : "—"}
                        </span>
                      </td>
                      <td><span style={{ fontWeight: 600 }}>{booking.seatsBooked}</span></td>
                      <td><span style={{ fontWeight: 700, color: "var(--violet-600)" }}>₹{booking.totalPrice.toLocaleString()}</span></td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--slate-400)" }}>
                          <Calendar size={12} />
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN") : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompanyBookings;
