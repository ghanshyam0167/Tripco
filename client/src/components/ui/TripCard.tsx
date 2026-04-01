import { MapPin, Clock, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Trip } from "../../types";

interface TripCardProps {
  trip: Trip;
  actionLabel?: string;
  onAction?: (trip: Trip) => void;
  showActions?: boolean;
  onEdit?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
];

const styleTag: Record<string, { bg: string; text: string }> = {
  budget:      { bg: "rgba(34,197,94,.12)",  text: "#15803d" },
  luxury:      { bg: "rgba(245,158,11,.12)", text: "#b45309" },
  backpacking: { bg: "rgba(59,130,246,.12)", text: "#1d4ed8" },
  family:      { bg: "rgba(236,72,153,.12)", text: "#be185d" },
};

const TripCard = ({
  trip,
  actionLabel = "View Details",
  onAction,
  showActions = false,
  onEdit,
  onDelete,
}: TripCardProps) => {
  const navigate = useNavigate();
  const imgSrc =
    trip.images?.[0] ||
    PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

  const style = trip.travelStyle ? styleTag[trip.travelStyle] : undefined;

  const handleClick = () => {
    if (onAction) onAction(trip);
    else navigate(`/traveler/trips/${trip._id}`);
  };

  return (
    <div
      className="card"
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img
          src={imgSrc}
          alt={trip.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
        />
        {/* Price badge */}
        <div
          style={{
            position: "absolute", top: 12, right: 12,
            background: "var(--navy-900)", color: "#fff",
            padding: "6px 12px", borderRadius: "var(--radius-full)",
            fontSize: 13, fontWeight: 700,
          }}
        >
          {trip.discountPrice ? (
            <>
              <span style={{ textDecoration: "line-through", opacity: .6, marginRight: 4 }}>
                ₹{trip.price.toLocaleString()}
              </span>
              ₹{trip.discountPrice.toLocaleString()}
            </>
          ) : (
            `₹${trip.price.toLocaleString()}`
          )}
        </div>
        {/* Status indicator */}
        {trip.availableSeats === 0 && (
          <div
            style={{
              position: "absolute", bottom: 12, left: 12,
              background: "var(--red-500)", color: "#fff",
              padding: "4px 10px", borderRadius: "var(--radius-full)",
              fontSize: 11, fontWeight: 700,
            }}
          >
            SOLD OUT
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Title + style tag */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--slate-900)", lineHeight: 1.3, flex: 1 }}>
            {trip.title}
          </h3>
          {style && (
            <span
              style={{
                padding: "3px 10px", borderRadius: "var(--radius-full)",
                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                background: style.bg, color: style.text, letterSpacing: ".06em",
                flexShrink: 0,
              }}
            >
              {trip.travelStyle}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {trip.destination?.city && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--slate-500)" }}>
              <MapPin size={14} strokeWidth={2} />
              {[trip.destination.city, trip.destination.country].filter(Boolean).join(", ")}
            </div>
          )}
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--slate-500)" }}>
              <Clock size={14} strokeWidth={2} />
              {trip.duration.days}D {trip.duration.nights ? `/ ${trip.duration.nights}N` : ""}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--slate-500)" }}>
              <Users size={14} strokeWidth={2} />
              {trip.availableSeats} seats left
            </span>
            {(trip.rating || 0) > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--amber-500)" }}>
                <Star size={14} fill="currentColor" strokeWidth={0} />
                {trip.rating?.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Description snippet */}
        {trip.description && (
          <p style={{ fontSize: 13, color: "var(--slate-400)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {trip.description}
          </p>
        )}

        {/* CTA */}
        <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleClick}
            disabled={!onAction && trip.availableSeats === 0}
            style={{ flex: 1 }}
          >
            {actionLabel}
          </button>
          {showActions && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit?.(trip)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete?.(trip)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
