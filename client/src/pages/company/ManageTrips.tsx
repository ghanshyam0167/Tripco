import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import EmptyState from "../../components/ui/EmptyState";
import PageLoader from "../../components/ui/PageLoader";
import { useTripStore } from "../../store/tripStore";
import { deleteTrip } from "../../api/trip.api";
import type { Trip } from "../../types";
import { PlusCircle, MapPin, Users, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";

const statusColors = {
  active:    { bg: "rgba(34,197,94,.12)",  text: "#15803d" },
  inactive:  { bg: "rgba(100,116,139,.1)", text: "var(--slate-600)" },
  completed: { bg: "rgba(59,130,246,.1)",  text: "#1d4ed8" },
};

const ManageTrips = () => {
  const { trips, fetchTrips, removeTrip, loading } = useTripStore();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (trip: Trip) => {
    if (!confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
    setDeleting(trip._id);
    try {
      await deleteTrip(trip._id);
      removeTrip(trip._id);
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setDeleting(null);
    }
  };

  if (loading && trips.length === 0) return <PageLoader />;

  return (
    <Layout title="Manage Trips">
      <div className="page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 className="page-title">Manage Trips</h1>
            <p className="page-subtitle">{trips.length} trip{trips.length !== 1 ? "s" : ""} listed</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/company/create")}>
            <PlusCircle size={16} /> New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <EmptyState title="No trips yet" description="Create your first trip to start accepting bookings." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Destination</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => {
                  const sc = statusColors[trip.status || "active"];
                  return (
                    <tr key={trip._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 44, height: 44, borderRadius: "var(--radius-md)",
                              overflow: "hidden", flexShrink: 0, background: "var(--slate-200)",
                            }}
                          >
                            {trip.images?.[0] ? (
                              <img src={trip.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--violet-600), #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✈️</div>
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: "var(--slate-900)" }}>{trip.title}</p>
                            {trip.travelStyle && (
                              <p style={{ fontSize: 11, color: "var(--slate-400)", textTransform: "capitalize" }}>{trip.travelStyle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {trip.destination?.city && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--slate-600)" }}>
                            <MapPin size={13} color="var(--violet-500)" />
                            {[trip.destination.city, trip.destination.country].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <p style={{ fontWeight: 700 }}>₹{(trip.discountPrice || trip.price).toLocaleString()}</p>
                          {trip.discountPrice && (
                            <p style={{ fontSize: 12, color: "var(--slate-400)", textDecoration: "line-through" }}>₹{trip.price.toLocaleString()}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
                          <Users size={13} color="var(--slate-400)" />
                          {trip.availableSeats} / {trip.totalSeats}
                        </div>
                      </td>
                      <td>
                        <span style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700, textTransform: "capitalize", background: sc.bg, color: sc.text }}>
                          {trip.status || "active"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/company/trips/edit/${trip._id}`)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(trip)}
                            disabled={deleting === trip._id}
                          >
                            {deleting === trip._id
                              ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                              : <Trash2 size={13} />}
                          </button>
                        </div>
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

export default ManageTrips;
