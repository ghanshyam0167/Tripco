import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import TripCard from "../../components/ui/TripCard";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import { useTripStore } from "../../store/tripStore";
import { Search, SlidersHorizontal, X } from "lucide-react";

const STYLE_OPTIONS = ["", "budget", "luxury", "backpacking", "family"] as const;

const ExploreTrips = () => {
  const { trips, fetchTrips, searchTrips, loading } = useTripStore();

  const [search, setSearch]         = useState("");
  const [travelStyle, setStyle]     = useState("");
  const [minPrice, setMin]          = useState("");
  const [maxPrice, setMax]          = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchTrips(); }, []);

  const handleSearch = () => {
    searchTrips({
      city: search || undefined,
      travelStyle: travelStyle || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const handleClear = () => {
    setSearch(""); setStyle(""); setMin(""); setMax("");
    fetchTrips();
  };

  const hasFilters = search || travelStyle || minPrice || maxPrice;

  return (
    <Layout title="Explore Trips">
      <div className="page">
        {/* Search bar */}
        <div
          className="card"
          style={{ padding: "20px 24px", marginBottom: 28, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={16}
                style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", color: "var(--slate-400)",
                }}
              />
              <input
                className="input"
                placeholder="Search by city or destination…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 40 }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasFilters && (
                <span
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--violet-500)",
                  }}
                />
              )}
            </button>
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={handleClear} title="Clear">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div
              className="anim-fade"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, paddingTop: 12, borderTop: "1px solid var(--slate-100)" }}
            >
              <div className="form-group">
                <label className="label">Travel style</label>
                <select
                  className="input"
                  value={travelStyle}
                  onChange={(e) => setStyle(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  {STYLE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : "All styles"}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Min price (₹)</label>
                <input className="input" type="number" placeholder="0" value={minPrice} onChange={(e) => setMin(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Max price (₹)</label>
                <input className="input" type="number" placeholder="∞" value={maxPrice} onChange={(e) => setMax(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: "var(--slate-500)" }}>
            {loading ? "Searching…" : `${trips.length} trip${trips.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {loading ? (
          <PageLoader />
        ) : trips.length === 0 ? (
          <EmptyState title="No trips found" description="Try adjusting your search or filters." />
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExploreTrips;
