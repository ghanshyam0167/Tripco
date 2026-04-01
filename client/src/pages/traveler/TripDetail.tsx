import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import PageLoader from "../../components/ui/PageLoader";
import { getTripById } from "../../api/trip.api";
import { createBooking } from "../../api/booking.api";
import type { Trip } from "../../types";
import {
  MapPin, Clock, Users, Star, Calendar, Tag,
  CheckCircle, ArrowLeft, Minus, Plus,
} from "lucide-react";
import toast from "react-hot-toast";

const PLACEHOLDER = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80";

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip]         = useState<Trip | null>(null);
  const [loading, setLoading]   = useState(true);
  const [seats, setSeats]       = useState(1);
  const [booking, setBooking]   = useState(false);

  useEffect(() => {
    if (!id) return;
    getTripById(id)
      .then(setTrip)
      .catch(() => navigate("/traveler/trips"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!trip) return;
    setBooking(true);
    try {
      await createBooking({ tripId: trip._id, seatsBooked: seats });
      toast.success("Booking confirmed! 🎉");
      navigate("/traveler/bookings");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!trip)   return null;

  const price = trip.discountPrice || trip.price;
  const total = price * seats;
  const imgSrc = trip.images?.[0] || PLACEHOLDER;

  return (
    <Layout>
      <div className="page">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20, display: "inline-flex" }}
        >
          <ArrowLeft size={16} /> Back to trips
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }}>
          {/* Left: Trip Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Hero image */}
            <div
              style={{
                borderRadius: "var(--radius-xl)", overflow: "hidden",
                height: 380, position: "relative",
              }}
            >
              <img src={imgSrc} alt={trip.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {trip.travelStyle && (
                <span
                  style={{
                    position: "absolute", top: 16, left: 16,
                    background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)",
                    color: "#fff", padding: "6px 14px", borderRadius: "var(--radius-full)",
                    fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em",
                  }}
                >
                  {trip.travelStyle}
                </span>
              )}
            </div>

            {/* Title & meta */}
            <div className="card" style={{ padding: 28 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.03em", marginBottom: 12 }}>
                {trip.title}
              </h1>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                {trip.destination?.city && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--slate-600)" }}>
                    <MapPin size={15} color="var(--violet-500)" />
                    {[trip.destination.city, trip.destination.country].filter(Boolean).join(", ")}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--slate-600)" }}>
                  <Clock size={15} color="var(--violet-500)" />
                  {trip.duration.days} Days {trip.duration.nights ? `/ ${trip.duration.nights} Nights` : ""}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--slate-600)" }}>
                  <Users size={15} color="var(--violet-500)" />
                  {trip.availableSeats} seats available
                </span>
                {(trip.rating || 0) > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--amber-500)" }}>
                    <Star size={15} fill="currentColor" strokeWidth={0} />
                    {trip.rating?.toFixed(1)} ({trip.totalReviews} reviews)
                  </span>
                )}
              </div>

              {trip.description && (
                <p style={{ fontSize: 15, color: "var(--slate-500)", lineHeight: 1.8 }}>
                  {trip.description}
                </p>
              )}
            </div>

            {/* Tags */}
            {trip.tags && trip.tags.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag size={15} color="var(--violet-500)" /> Tags
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {trip.tags.map((tag) => (
                    <span key={tag} className="badge badge-violet">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            {(trip.startDate || trip.endDate) && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={15} color="var(--violet-500)" /> Travel dates
                </h3>
                <div style={{ display: "flex", gap: 24 }}>
                  {trip.startDate && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--slate-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>DEPARTURE</p>
                      <p style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{new Date(trip.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                  )}
                  {trip.endDate && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--slate-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>RETURN</p>
                      <p style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{new Date(trip.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {trip.itinerary && trip.itinerary.length > 0 && (
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Itinerary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {trip.itinerary.map((day) => (
                    <div key={day.day} style={{ display: "flex", gap: 16 }}>
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                          background: "rgba(139,92,246,.1)", color: "var(--violet-600)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: 13,
                        }}
                      >
                        {day.day}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, marginBottom: 4 }}>{day.title}</p>
                        <p style={{ fontSize: 14, color: "var(--slate-500)", marginBottom: 8 }}>{day.description}</p>
                        {day.activities?.map((a, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--slate-600)", marginBottom: 4 }}>
                            <CheckCircle size={13} color="var(--green-500)" /> {a}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking card */}
          <div
            className="card"
            style={{ padding: 28, position: "sticky", top: 80 }}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                {trip.discountPrice ? (
                  <>
                    <span style={{ fontSize: 32, fontWeight: 900, color: "var(--slate-900)" }}>
                      ₹{trip.discountPrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 16, color: "var(--slate-400)", textDecoration: "line-through" }}>
                      ₹{trip.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 32, fontWeight: 900, color: "var(--slate-900)" }}>
                    ₹{trip.price.toLocaleString()}
                  </span>
                )}
                <span style={{ fontSize: 14, color: "var(--slate-400)" }}>/person</span>
              </div>
              {trip.availableSeats > 0 ? (
                <span className="badge badge-green" style={{ marginTop: 8 }}>
                  {trip.availableSeats} seats left
                </span>
              ) : (
                <span className="badge badge-red" style={{ marginTop: 8 }}>Sold out</span>
              )}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--slate-100)", margin: "20px 0" }} />

            {/* Seat selector */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label">Number of seats</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                  disabled={seats <= 1}
                  style={{ width: 36, height: 36, padding: 0 }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontSize: 20, fontWeight: 800, minWidth: 28, textAlign: "center" }}>
                  {seats}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSeats((s) => Math.min(trip.availableSeats, s + 1))}
                  disabled={seats >= trip.availableSeats}
                  style={{ width: 36, height: 36, padding: 0 }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div
              style={{
                background: "var(--slate-50)", borderRadius: "var(--radius-md)",
                padding: "14px 16px", display: "flex",
                justifyContent: "space-between", marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 14, color: "var(--slate-600)" }}>
                ₹{price.toLocaleString()} × {seats}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800 }}>
                ₹{total.toLocaleString()}
              </span>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              disabled={booking || trip.availableSeats === 0}
              onClick={handleBook}
            >
              {booking ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Booking…
                </span>
              ) : "Book Now"}
            </button>

            <p style={{ fontSize: 12, color: "var(--slate-400)", textAlign: "center", marginTop: 12 }}>
              Free cancellation up to 24hrs before departure
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetail;
