import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import EmptyState from "../../components/ui/EmptyState";
import PageLoader from "../../components/ui/PageLoader";
import { useBookingStore } from "../../store/bookingStore";
import type { Trip } from "../../types";
import { Calendar, MapPin, X, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

const statusConfig = {
  confirmed: { label: "Confirmed", badgeClass: "badge-green", icon: <CheckCircle size={12} /> },
  pending:   { label: "Pending",   badgeClass: "badge-amber", icon: <Clock size={12} /> },
  cancelled: { label: "Cancelled", badgeClass: "badge-red",   icon: <X size={12} /> },
};

const MyBookings = () => {
  const { myBookings, fetchMyBookings, cancelBooking, loading } = useBookingStore();
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => { fetchMyBookings(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <Layout title="My Bookings">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">{myBookings.length} total booking{myBookings.length !== 1 ? "s" : ""}</p>
        </div>

        {myBookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Start exploring trips and make your first booking!"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {myBookings.map((booking) => {
              const trip = booking.tripId as Trip;
              const status = statusConfig[booking.status] || statusConfig.pending;
              return (
                <div
                  key={booking._id}
                  className="card"
                  style={{
                    padding: 24,
                    display: "grid",
                    gridTemplateColumns: "100px 1fr auto",
                    gap: 20,
                    alignItems: "center",
                  }}
                >
                  {/* Trip thumbnail */}
                  <div
                    style={{
                      width: 100, height: 80,
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden", flexShrink: 0,
                      background: "var(--slate-200)",
                    }}
                  >
                    {trip?.images?.[0] ? (
                      <img
                        src={trip.images[0]}
                        alt={trip.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%", height: "100%",
                          background: "linear-gradient(135deg, var(--violet-600), #4f46e5)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 24,
                        }}
                      >
                        ✈️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--slate-900)" }}>
                        {typeof trip === "object" ? trip.title : "Trip"}
                      </h3>
                      <span className={`badge ${status.badgeClass}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--slate-500)" }}>
                      {typeof trip === "object" && trip.destination?.city && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin size={13} /> {trip.destination.city}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={13} />
                        {new Date(booking.createdAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 16, fontSize: 13 }}>
                      <span style={{ color: "var(--slate-600)" }}>
                        Seats: <strong>{booking.seatsBooked}</strong>
                      </span>
                      <span style={{ color: "var(--violet-600)", fontWeight: 700 }}>
                        ₹{booking.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div>
                    {booking.status === "confirmed" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancelling === booking._id}
                      >
                        {cancelling === booking._id ? (
                          <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        ) : (
                          <><X size={14} /> Cancel</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyBookings;
