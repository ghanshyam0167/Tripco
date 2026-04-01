import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { createTrip } from "../../api/trip.api";
import { useTripStore } from "../../store/tripStore";
import { Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

type Step = 1 | 2 | 3;

const STYLE_OPTIONS = ["budget", "luxury", "backpacking", "family"] as const;

interface ItineraryDay { day: number; title: string; description: string; activities: string }

const CreateTrip = () => {
  const navigate = useNavigate();
  const { addTrip } = useTripStore();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [basic, setBasic] = useState({
    title: "", description: "", travelStyle: "budget" as typeof STYLE_OPTIONS[number],
    price: "", discountPrice: "", totalSeats: "",
  });
  const [dest, setDest]     = useState({ city: "", state: "", country: "", startDate: "", endDate: "" });
  const [dur, setDur]       = useState({ days: "", nights: "" });
  const [itinerary, setItin] = useState<ItineraryDay[]>([
    { day: 1, title: "", description: "", activities: "" },
  ]);
  const [tags, setTags]     = useState("");
  const [images, setImages] = useState("");

  const addDay = () =>
    setItin((prev) => [
      ...prev,
      { day: prev.length + 1, title: "", description: "", activities: "" },
    ]);

  const removeDay = (i: number) =>
    setItin((prev) => prev.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title: basic.title,
        description: basic.description,
        travelStyle: basic.travelStyle,
        price: Number(basic.price),
        discountPrice: basic.discountPrice ? Number(basic.discountPrice) : undefined,
        totalSeats: Number(basic.totalSeats),
        availableSeats: Number(basic.totalSeats),
        destination: { city: dest.city, state: dest.state, country: dest.country },
        duration: { days: Number(dur.days), nights: dur.nights ? Number(dur.nights) : undefined },
        startDate: dest.startDate || undefined,
        endDate: dest.endDate || undefined,
        itinerary: itinerary.map((d) => ({
          day: d.day,
          title: d.title,
          description: d.description,
          activities: d.activities.split(",").map((a) => a.trim()).filter(Boolean),
        })),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: images.split(",").map((u) => u.trim()).filter(Boolean),
      };
      const trip = await createTrip(payload);
      addTrip(trip);
      toast.success("Trip created! 🎉");
      navigate("/company/trips");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Basic Info", "Destination & Dates", "Itinerary & Extras"];

  return (
    <Layout title="Create Trip">
      <div className="page" style={{ maxWidth: 780 }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 36 }}>
          {stepLabels.map((label, i) => {
            const n = (i + 1) as Step;
            const done  = step > n;
            const active = step === n;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: done ? "var(--green-500)" : active ? "var(--violet-600)" : "var(--slate-200)",
                      color: done || active ? "#fff" : "var(--slate-400)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13, marginBottom: 6,
                      transition: "all var(--transition)",
                    }}
                  >
                    {done ? "✓" : n}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? "var(--violet-600)" : "var(--slate-400)", textAlign: "center" }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{ flex: 1, height: 2, background: done ? "var(--green-500)" : "var(--slate-200)", margin: "0 -18px 22px", transition: "background var(--transition)" }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Basic Information</h2>

              <div className="form-group">
                <label className="label">Trip title *</label>
                <input className="input" placeholder="e.g. Magical Rajasthan Heritage Tour" value={basic.title} onChange={(e) => setBasic({ ...basic, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="input" rows={4} placeholder="Describe the trip experience…" value={basic.description} onChange={(e) => setBasic({ ...basic, description: e.target.value })} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="label">Price per person (₹) *</label>
                  <input className="input" type="number" placeholder="12000" value={basic.price} onChange={(e) => setBasic({ ...basic, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Discount price (₹)</label>
                  <input className="input" type="number" placeholder="Optional" value={basic.discountPrice} onChange={(e) => setBasic({ ...basic, discountPrice: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Total seats *</label>
                  <input className="input" type="number" placeholder="20" value={basic.totalSeats} onChange={(e) => setBasic({ ...basic, totalSeats: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Travel style</label>
                  <select className="input" value={basic.travelStyle} onChange={(e) => setBasic({ ...basic, travelStyle: e.target.value as typeof STYLE_OPTIONS[number] })}>
                    {STYLE_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Destination & Dates</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="label">City</label>
                  <input className="input" placeholder="Jaipur" value={dest.city} onChange={(e) => setDest({ ...dest, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">State</label>
                  <input className="input" placeholder="Rajasthan" value={dest.state} onChange={(e) => setDest({ ...dest, state: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Country</label>
                  <input className="input" placeholder="India" value={dest.country} onChange={(e) => setDest({ ...dest, country: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Duration (days) *</label>
                  <input className="input" type="number" placeholder="5" value={dur.days} onChange={(e) => setDur({ ...dur, days: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Nights</label>
                  <input className="input" type="number" placeholder="4" value={dur.nights} onChange={(e) => setDur({ ...dur, nights: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="label">Start date</label>
                  <input className="input" type="date" value={dest.startDate} onChange={(e) => setDest({ ...dest, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">End date</label>
                  <input className="input" type="date" value={dest.endDate} onChange={(e) => setDest({ ...dest, endDate: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Itinerary & Extras</h2>

              {/* Itinerary */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <label className="label" style={{ margin: 0 }}>Day-by-day itinerary</label>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={addDay}>
                    <Plus size={14} /> Add day
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {itinerary.map((day, i) => (
                    <div key={i} style={{ background: "var(--slate-50)", borderRadius: "var(--radius-md)", padding: 16, border: "1px solid var(--slate-200)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--violet-600)" }}>Day {day.day}</span>
                        {itinerary.length > 1 && (
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => removeDay(i)} style={{ color: "var(--red-500)", padding: "4px 8px" }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input className="input" placeholder="Day title" value={day.title} onChange={(e) => { const a = [...itinerary]; a[i].title = e.target.value; setItin(a); }} />
                        <input className="input" placeholder="Description" value={day.description} onChange={(e) => { const a = [...itinerary]; a[i].description = e.target.value; setItin(a); }} />
                        <input className="input" placeholder="Activities (comma separated)" value={day.activities} onChange={(e) => { const a = [...itinerary]; a[i].activities = e.target.value; setItin(a); }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags & Images */}
              <div className="form-group">
                <label className="label">Tags (comma separated)</label>
                <input className="input" placeholder="adventure, heritage, culture" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Image URLs (comma separated)</label>
                <input className="input" placeholder="https://... , https://..." value={images} onChange={(e) => setImages(e.target.value)} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--slate-100)" }}>
            <button
              className="btn btn-secondary"
              onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : navigate("/company/trips")}
            >
              <ArrowLeft size={16} /> {step === 1 ? "Cancel" : "Back"}
            </button>
            {step < 3 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={step === 1 && (!basic.title || !basic.price || !basic.totalSeats)}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || !dur.days}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…
                  </span>
                ) : "Create Trip 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTrip;
