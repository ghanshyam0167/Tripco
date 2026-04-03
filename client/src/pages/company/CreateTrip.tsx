import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import axiosApi from "../../api/axios";
import { getCompanyProfile } from "../../api/profile.api";
import { useTripStore } from "../../store/tripStore";
import { Plus, Trash2, ArrowLeft, ArrowRight, UploadCloud, X, Moon, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import type { StayDetails } from "../../types";

type Step = 1 | 2 | 3 | 4 | 5;

const STYLE_OPTIONS = ["budget", "luxury", "backpacking", "family"] as const;
const VEHICLE_OPTIONS = ["Bus", "Train", "Flight", "Car"] as const;
const ROOM_OPTIONS = ["Single", "Double", "Deluxe", "Suite"] as const;
const MEAL_OPTIONS = ["Room Only", "Breakfast", "Half Board", "Full Board"] as const;

interface SupervisorState {
  name: string;
  phone: string;
  email: string;
  role: string;
  experience: string;
}

interface VehicleDetails {
  from?: string;
  to?: string;
  vehicleType: string;
  busType?: string;
  busNumber?: string;
  trainNumber?: string;
  coachType?: string;
  flightNumber?: string;
  flightClass?: string;
  carType?: string;
  acNonAc?: string;
  details?: string;
}

interface MultiTransport extends VehicleDetails {
  day: number;
}

const defaultStay = { hotelName: "", location: "", roomType: "Double", mealPlan: "Breakfast", amenities: "", checkIn: "", checkOut: "" };

const CreateTrip = () => {
  const navigate = useNavigate();
  const { addTrip } = useTripStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Collapsible management
  const [openTransportIndex, setOpenTransportIndex] = useState<number | null>(0);
  const [openStayIndex, setOpenStayIndex] = useState<number | null>(0);

  // Step 1: Basic
  const [basic, setBasic] = useState({
    title: "", description: "", travelStyle: "budget" as typeof STYLE_OPTIONS[number],
    price: "", discountPrice: "", totalSeats: "",
  });

  // Step 2: Destination & Dates (Strict Geography)
  const [dest, setDest]     = useState({ originLocation: "", city: "", state: "", country: "", startDate: "", endDate: "" });
  const [dur, setDur]       = useState({ days: "", nights: "" });
  
  // Step 3: Travel & Stay
  const [transport, setTransport] = useState({ modeType: "same" as "same" | "multiple" });
  const [sameVehicle, setSameVehicle] = useState<VehicleDetails>({ vehicleType: "Bus", from: "", to: "" });
  const [multiTransport, setMultiTransport] = useState<MultiTransport[]>([]);

  const [stayMode, setStayMode] = useState<"same" | "perDay">("same");
  const [sameStay, setSameStay] = useState(defaultStay);
  const [perDayStay, setPerDayStay] = useState<any[]>([]);

  // Step 4: Itinerary & Extras
  const [itinerary, setItin] = useState<any[]>([
    { day: 1, title: "", description: "", activities: "", isNight: false, nightTitle: "", nightDesc: "" }
  ]);
  const [tags, setTags]     = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Step 5: Supervisors
  const [supervisors, setSupervisors] = useState<SupervisorState[]>([]);

  useEffect(() => {
    getCompanyProfile()
      .then((p) => {
        if (p && p.verificationStatus !== "approved") {
          toast.error("You must be verified by an admin to create trips.");
          navigate("/company");
        }
      })
      .catch(() => {});
  }, [navigate]);

  // Sync Arrays with Duration explicitly
  useEffect(() => {
    const d = parseInt(dur.days) || 1;
    
    // Itinerary sync
    if (d !== itinerary.length) {
      if (d > itinerary.length) {
        const newArr = [...itinerary];
        for (let i = itinerary.length; i < d; i++) {
          newArr.push({ day: i + 1, title: "", description: "", activities: "", isNight: false, nightTitle: "", nightDesc: "" });
        }
        setItin(newArr);
      } else if (d > 0) setItin(itinerary.slice(0, d));
    }

    // Per Day Stay sync
    if (stayMode === "perDay" && d !== perDayStay.length) {
      if (d > perDayStay.length) {
         const ns = [...perDayStay];
         for (let i = perDayStay.length; i < d; i++) {
            ns.push({ day: i + 1, ...defaultStay });
         }
         setPerDayStay(ns);
      } else if (d > 0) setPerDayStay(perDayStay.slice(0, d));
    }
  }, [dur.days, stayMode]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArr]);
      
      const newUrls = filesArr.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
    setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
  };


  // Validation Engine
  const validateStep = (s: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!basic.title.trim()) newErrors["basic.title"] = "Please provide a catchy trip title";
      if (!basic.description.trim()) newErrors["basic.description"] = "We need a description about this trip";
      if (!basic.price || Number(basic.price) <= 0) newErrors["basic.price"] = "Please set a valid price per person";
      if (!basic.totalSeats || Number(basic.totalSeats) <= 0) newErrors["basic.totalSeats"] = "How many people can join? Please set total seats";
      if (basic.discountPrice && Number(basic.discountPrice) > Number(basic.price)) {
        newErrors["basic.discountPrice"] = "Wait, the discount is higher than the original price!";
      }
    }

    if (s === 2) {
      if (!dest.originLocation.trim()) newErrors["dest.originLocation"] = "Where does the journey start from?";
      if (!dest.city.trim()) newErrors["dest.city"] = "Where is the main destination?";
      if (!dest.state.trim()) newErrors["dest.state"] = "Which state is this in?";
      if (!dest.country.trim()) newErrors["dest.country"] = "Which country?";
      
      if (!dur.days || Number(dur.days) <= 0) newErrors["dur.days"] = "How many days will you be traveling?";
      if (dur.nights && Number(dur.nights) < 0) newErrors["dur.nights"] = "Nights cannot be negative";
      
      if (!dest.startDate) newErrors["dest.startDate"] = "When does it start?";
      if (!dest.endDate) newErrors["dest.endDate"] = "When does it end?";
      if (dest.startDate && dest.endDate && new Date(dest.endDate) < new Date(dest.startDate)) {
        newErrors["dest.endDate"] = "The trip end date must be after it starts!";
      }
    }

    if (s === 3) {
      // Transport Validation
      if (transport.modeType === "same") {
         if (!sameVehicle.from?.trim()) newErrors["sameVehicle.from"] = "Please state physical starting location";
         if (!sameVehicle.to?.trim()) newErrors["sameVehicle.to"] = "Please state arrival location";
         if (sameVehicle.vehicleType === "Bus" && !sameVehicle.busNumber) newErrors["sameVehicle.busNumber"] = "Please enter the bus license/number";
         if (sameVehicle.vehicleType === "Train" && !sameVehicle.trainNumber) newErrors["sameVehicle.trainNumber"] = "Which train is this? Enter number";
         if (sameVehicle.vehicleType === "Flight" && !sameVehicle.flightNumber) newErrors["sameVehicle.flightNumber"] = "Please provide the flight number";
      } else {
         if (multiTransport.length === 0) newErrors["transport.global"] = "Add at least one travel transport segment!";
         multiTransport.forEach((mt, idx) => {
           if (!mt.from?.trim()) newErrors[`multiTransport.${idx}.from`] = "Departure location is needed";
           if (!mt.to?.trim()) newErrors[`multiTransport.${idx}.to`] = "Arrival location is needed";
           if (!mt.vehicleType) newErrors[`multiTransport.${idx}.vehicleType`] = "Type required";
           if (mt.vehicleType === "Bus" && !mt.busNumber) newErrors[`multiTransport.${idx}.busNumber`] = "What's the bus number?";
           if (mt.vehicleType === "Train" && !mt.trainNumber) newErrors[`multiTransport.${idx}.trainNumber`] = "What's the train number?";
           if (mt.vehicleType === "Flight" && !mt.flightNumber) newErrors[`multiTransport.${idx}.flightNumber`] = "What's the flight number?";
         });
      }

      // Stay Validation
      if (stayMode === "same") {
         if (!sameStay.hotelName.trim()) newErrors["sameStay.hotelName"] = "Hotel name is required";
         if (!sameStay.location.trim()) newErrors["sameStay.location"] = "Hotel location is required";
      } else {
         perDayStay.forEach((stay, idx) => {
           if (!stay.hotelName.trim()) newErrors[`perDayStay.${idx}.hotelName`] = "Hotel name is required";
           if (!stay.location.trim()) newErrors[`perDayStay.${idx}.location`] = "Location is required";
         });
      }
    }

    if (s === 4) {
      itinerary.forEach((day, idx) => {
        if (!day.title.trim()) newErrors[`itinerary.${idx}.title`] = "Give this day a catchy title";
        if (!day.description.trim()) newErrors[`itinerary.${idx}.description`] = "What are the main events for today?";
      });
    }

    if (s === 5) {
      if (supervisors.length === 0) {
         newErrors["supervisors.global"] = "Please allocate at least one company supervisor or guide so travelers feel secure.";
      }
      supervisors.forEach((sup, idx) => {
        if (!sup.name.trim()) newErrors[`supervisors.${idx}.name`] = "What is their full name?";
        if (!sup.phone.trim()) newErrors[`supervisors.${idx}.phone`] = "We need their contact number";
        if (!sup.email.trim()) newErrors[`supervisors.${idx}.email`] = "We need their email address";
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (containerRef.current) containerRef.current.scrollIntoView({ behavior: 'smooth' });
      return false;
    }
    return true;
  };


  const ErrorBox = ({ fieldId }: { fieldId: string }) => {
    if (!errors[fieldId]) return null;
    return <span style={{ color: "var(--red-500)", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 }}>{errors[fieldId]}</span>;
  };

  const getInputClass = (fieldId: string, base = "input") => errors[fieldId] ? `${base} border-red-500` : base;
  

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    try {
      const parsedStayDetails: StayDetails[] = stayMode === "same" 
         ? [{ hotelName: sameStay.hotelName, location: sameStay.location, roomType: sameStay.roomType, mealPlan: sameStay.mealPlan, amenities: sameStay.amenities.split(",").map(i => i.trim()).filter(Boolean), checkIn: sameStay.checkIn, checkOut: sameStay.checkOut }]
         : perDayStay.map(s => ({ day: s.day, hotelName: s.hotelName, location: s.location, roomType: s.roomType, mealPlan: s.mealPlan, amenities: s.amenities.split(",").map((i: string) => i.trim()).filter(Boolean), checkIn: s.checkIn, checkOut: s.checkOut }));

      const jsonPayload: Record<string, unknown> = {
        title: basic.title,
        description: basic.description,
        travelStyle: basic.travelStyle,
        price: Number(basic.price),
        discountPrice: basic.discountPrice ? Number(basic.discountPrice) : undefined,
        totalSeats: Number(basic.totalSeats),
        
        origin: { location: dest.originLocation },
        destination: { city: dest.city, state: dest.state, country: dest.country },
        duration: { days: Number(dur.days), nights: dur.nights ? Number(dur.nights) : undefined },
        startDate: dest.startDate || undefined,
        endDate: dest.endDate || undefined,
        
        transport: {
          modeType: transport.modeType,
          sameVehicle: transport.modeType === "same" ? sameVehicle : undefined,
          multipleVehicles: transport.modeType === "multiple" ? multiTransport : undefined,
        },

        stay: {
          type: stayMode,
          details: parsedStayDetails,
        },

        itinerary: itinerary.map((d) => ({
          day: d.day,
          title: d.title,
          description: d.description,
          activities: d.activities.split(",").map((a: string) => a.trim()).filter(Boolean),
          nightActivity: d.isNight ? { isIncluded: true, title: d.nightTitle, description: d.nightDesc } : undefined
        })),
        
        supervisors: supervisors.map(s => ({ ...s, experience: Number(s.experience) || 0 })),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: [] as string[],
      };

      // Step 1: Upload images to Cloudinary (if any)
      if (images.length > 0) {
        const imageFormData = new FormData();
        images.forEach((img) => imageFormData.append("images", img));

        const uploadRes = await axiosApi.post("/upload", imageFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        jsonPayload.images = uploadRes.data.urls || [];
      }

      // Step 2: Create the trip with Cloudinary URLs as plain JSON
      const res = await axiosApi.post("/trips", jsonPayload);
      
      addTrip(res.data.trip);
      toast.success("Trip created successfully! 🎉");
      navigate("/company/trips");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Basic Info", "Destinations", "Travel & Stay", "Itinerary", "Supervisors"];
  
  const priceCalc = Number(basic.price) || 0;
  const discountCalc = Number(basic.discountPrice) || 0;
  const finalPrice = Math.max(0, priceCalc - discountCalc);

  return (
    <Layout title="Create Trip">
      <div className="page" style={{ maxWidth: 840 }} ref={containerRef}>
        
        <div style={{ display: "flex", gap: 0, marginBottom: 36 }}>
          {stepLabels.map((label, i) => {
            const n = (i + 1) as Step;
            const done  = step > n;
            const active = step === n;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: done ? "var(--green-500)" : active ? "var(--violet-600)" : "var(--slate-200)",
                      color: done || active ? "#fff" : "var(--slate-400)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13, marginBottom: 6,
                      transition: "all var(--transition)",
                    }}
                  >
                    {done ? "✓" : n}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "var(--violet-600)" : "var(--slate-400)", textAlign: "center", position: "absolute", top: 38, width: 90 }}>
                    {label}
                  </span>
                </div>
                {i < 4 && (
                  <div style={{ flex: 1, height: 2, background: done ? "var(--green-500)" : "var(--slate-200)", margin: "0 -22px 22px", transition: "background var(--transition)" }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: 32, marginTop: 40 }}>
          {/* Step 1: Basic */}
          {step === 1 && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Basic Information</h2>

              <div className="form-group">
                <label className="label">Trip title *</label>
                <input className={getInputClass('basic.title')} placeholder="e.g. Magical Heritage Tour" value={basic.title} onChange={e => { setBasic({ ...basic, title: e.target.value }); setErrors({...errors, 'basic.title': ''}) }} />
                <ErrorBox fieldId="basic.title" />
              </div>
              
               <div className="form-group">
                <label className="label">Description *</label>
                <textarea className={getInputClass('basic.description')} rows={4} placeholder="Describe the trip..." value={basic.description} onChange={e => { setBasic({ ...basic, description: e.target.value }); setErrors({...errors, 'basic.description': ''}) }} style={{ resize: "vertical" }} />
                <ErrorBox fieldId="basic.description" />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div className="form-group">
                    <label className="label">Price per person (₹) *</label>
                    <input className={getInputClass('basic.price')} type="number" placeholder="12000" value={basic.price} onChange={e => { setBasic({ ...basic, price: e.target.value }); setErrors({...errors, 'basic.price': ''}) }} />
                    <ErrorBox fieldId="basic.price" />
                  </div>
                  <div className="form-group">
                    <label className="label">Discount price (₹)</label>
                    <input className={getInputClass('basic.discountPrice')} type="number" placeholder="Max discount" value={basic.discountPrice} onChange={e => { setBasic({ ...basic, discountPrice: e.target.value }); setErrors({...errors, 'basic.discountPrice': ''}) }} />
                    <ErrorBox fieldId="basic.discountPrice" />
                  </div>
                </div>
                
                <div style={{ background: "var(--violet-50)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--violet-100)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: 13, color: "var(--violet-600)", fontWeight: 600 }}>Final Price calculation</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: "var(--slate-900)" }}>₹{finalPrice.toLocaleString()}</p>
                </div>
              </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="label">Total seats *</label>
                  <input className={getInputClass('basic.totalSeats')} type="number" placeholder="20" value={basic.totalSeats} onChange={e => { setBasic({ ...basic, totalSeats: e.target.value }); setErrors({...errors, 'basic.totalSeats': ''}) }} />
                  <ErrorBox fieldId="basic.totalSeats" />
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

          {/* Step 2: Destination & Dates */}
          {step === 2 && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Locations & Dates</h2>
              <p style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 12 }}>Define the structural geographical endpoints and constraints</p>
              
              <div className="form-group">
                <label className="label">Origin Location (Departure City) *</label>
                <input className={getInputClass('dest.originLocation')} placeholder="New Delhi" value={dest.originLocation} onChange={e => { setDest({ ...dest, originLocation: e.target.value }); setErrors({...errors, 'dest.originLocation': ''}) }} />
                <ErrorBox fieldId="dest.originLocation" />
              </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="label">Destination City *</label>
                  <input className={getInputClass('dest.city')} placeholder="Jaipur" value={dest.city} onChange={e => { setDest({ ...dest, city: e.target.value }); setErrors({...errors, 'dest.city': ''}) }} />
                  <ErrorBox fieldId="dest.city" />
                </div>
                <div className="form-group">
                  <label className="label">State *</label>
                  <input className={getInputClass('dest.state')} placeholder="Rajasthan" value={dest.state} onChange={e => { setDest({ ...dest, state: e.target.value }); setErrors({...errors, 'dest.state': ''}) }} />
                  <ErrorBox fieldId="dest.state" />
                </div>
                <div className="form-group">
                  <label className="label">Country *</label>
                  <input className={getInputClass('dest.country')} placeholder="India" value={dest.country} onChange={e => { setDest({ ...dest, country: e.target.value }); setErrors({...errors, 'dest.country': ''}) }} />
                  <ErrorBox fieldId="dest.country" />
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="label">Total Duration (days) *</label>
                  <input className={getInputClass('dur.days')} type="number" min={1} placeholder="5" value={dur.days} onChange={e => { setDur({ ...dur, days: e.target.value }); setErrors({...errors, 'dur.days': ''}) }} />
                  <ErrorBox fieldId="dur.days" />
                </div>
                <div className="form-group">
                  <label className="label">Nights</label>
                  <input className={getInputClass('dur.nights')} type="number" placeholder="4" value={dur.nights} onChange={e => { setDur({ ...dur, nights: e.target.value }); setErrors({...errors, 'dur.nights': ''}) }} />
                  <ErrorBox fieldId="dur.nights" />
                </div>
              </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="label">Start date *</label>
                  <input className={getInputClass('dest.startDate')} type="date" value={dest.startDate} onChange={e => { setDest({ ...dest, startDate: e.target.value }); setErrors({...errors, 'dest.startDate': ''}) }} />
                  <ErrorBox fieldId="dest.startDate" />
                </div>
                <div className="form-group">
                  <label className="label">End date *</label>
                  <input className={getInputClass('dest.endDate')} type="date" value={dest.endDate} onChange={e => { setDest({ ...dest, endDate: e.target.value }); setErrors({...errors, 'dest.endDate': ''}) }} />
                  <ErrorBox fieldId="dest.endDate" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Travel & Stay */}
          {step === 3 && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              
              {/* SECTION A: TRAVEL */}
               <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                     <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Travel Configuration</h2>
                  </div>
                  
                  <div style={{ background: "var(--slate-50)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--slate-200)" }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="label">Vehicle Consistency Mode</label>
                      <select className="input" value={transport.modeType} onChange={e => setTransport({...transport, modeType: e.target.value as "same"|"multiple"})}>
                        <option value="same">Same vehicle for entire trip</option>
                        <option value="multiple">Different segments per transport mode</option>
                      </select>
                    </div>

                    {transport.modeType === "same" ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#fff", padding: 16, borderRadius: "var(--radius-md)", border: "1px dashed var(--slate-300)" }}>
                         <div className="form-group" style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
                           <div style={{flex: 1}}>
                             <input className={getInputClass('sameVehicle.from', 'input input-sm')} placeholder="From Location *" value={sameVehicle.from||""} onChange={e=>{setSameVehicle({...sameVehicle, from: e.target.value}); setErrors({...errors, 'sameVehicle.from':''}) }} />
                             <ErrorBox fieldId="sameVehicle.from" />
                           </div>
                           <ArrowRight size={14} style={{ color: "var(--slate-300)", marginTop: 10 }} />
                           <div style={{flex: 1}}>
                             <input className={getInputClass('sameVehicle.to', 'input input-sm')} placeholder="To Location *" value={sameVehicle.to||""} onChange={e=>{setSameVehicle({...sameVehicle, to: e.target.value}); setErrors({...errors, 'sameVehicle.to':''}) }} />
                             <ErrorBox fieldId="sameVehicle.to" />
                           </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                          <label className="label">Vehicle Type</label>
                          <select className="input" value={sameVehicle.vehicleType} onChange={e => setSameVehicle({...sameVehicle, vehicleType: e.target.value})}>
                            {VEHICLE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        {sameVehicle.vehicleType === "Bus" && (
                          <><div className="form-group"><label className="label">Bus Type</label><select className="input" value={sameVehicle.busType||"AC Sleeper"} onChange={e=>setSameVehicle({...sameVehicle, busType: e.target.value})}><option>AC Sleeper</option><option>Non-AC Sleeper</option><option>AC Semi-Sleeper</option></select></div><div className="form-group"><label className="label">Bus Number *</label><input className={getInputClass('sameVehicle.busNumber')} value={sameVehicle.busNumber||""} onChange={e=>setSameVehicle({...sameVehicle, busNumber: e.target.value})} /><ErrorBox fieldId="sameVehicle.busNumber" /></div></>
                        )}
                        {sameVehicle.vehicleType === "Train" && (
                          <><div className="form-group"><label className="label">Coach Type</label><select className="input" value={sameVehicle.coachType||"3A"} onChange={e=>setSameVehicle({...sameVehicle, coachType: e.target.value})}><option>1A</option><option>2A</option><option>3A</option><option>Sleeper</option><option>Chair Car</option><option>General</option></select></div><div className="form-group"><label className="label">Train Number *</label><input className={getInputClass('sameVehicle.trainNumber')} value={sameVehicle.trainNumber||""} onChange={e=>setSameVehicle({...sameVehicle, trainNumber: e.target.value})} /><ErrorBox fieldId="sameVehicle.trainNumber" /></div></>
                        )}
                        {sameVehicle.vehicleType === "Flight" && (
                          <><div className="form-group"><label className="label">Cabin Class</label><select className="input" value={sameVehicle.flightClass||"Economy"} onChange={e=>setSameVehicle({...sameVehicle, flightClass: e.target.value})}><option>Economy</option><option>Business</option></select></div><div className="form-group"><label className="label">Flight Number *</label><input className={getInputClass('sameVehicle.flightNumber')} value={sameVehicle.flightNumber||""} onChange={e=>setSameVehicle({...sameVehicle, flightNumber: e.target.value})} /><ErrorBox fieldId="sameVehicle.flightNumber" /></div></>
                        )}
                        {sameVehicle.vehicleType === "Car" && (
                          <><div className="form-group"><label className="label">Car Style</label><select className="input" value={sameVehicle.carType||"SUV"} onChange={e=>setSameVehicle({...sameVehicle, carType: e.target.value})}><option>Sedan</option><option>SUV</option><option>Hatchback</option></select></div><div className="form-group"><label className="label">AC Configuration</label><select className="input" value={sameVehicle.acNonAc||"AC"} onChange={e=>setSameVehicle({...sameVehicle, acNonAc: e.target.value})}><option>AC</option><option>Non-AC</option></select></div></>
                        )}
                      </div>
                    ) : (
                      <div>
                        {multiTransport.length === 0 && <ErrorBox fieldId="transport.global" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {multiTransport.map((mt, i) => {
                            const isOpen = openTransportIndex === i;
                            return (
                            <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", overflow: "hidden" }}>
                                <div style={{ padding: "12px 16px", background: "var(--slate-50)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: isOpen ? "1px solid var(--slate-200)" : "none" }} onClick={() => setOpenTransportIndex(isOpen ? null : i)}>
                                   <span style={{ fontWeight: 600, fontSize: 14 }}>Segment {i+1} : {mt.vehicleType}</span>
                                   <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setMultiTransport(multiTransport.filter((_, idx)=>idx!==i)); }} style={{ color: "var(--red-500)", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14}/></button>
                                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                   </div>
                                </div>
                                {isOpen && (
                                   <div style={{ padding: 16 }}>
                                      <div style={{ display: "flex", gap: 10, width: "100%", marginBottom: 12 }}>
                                        <div style={{flex: 1}}><input className={getInputClass(`multiTransport.${i}.from`, 'input input-sm')} placeholder="From Location" value={mt.from} onChange={e=>{ const a=[...multiTransport]; a[i].from=e.target.value; setMultiTransport(a); setErrors({...errors, [`multiTransport.${i}.from`]: ""}) }} /><ErrorBox fieldId={`multiTransport.${i}.from`} /></div>
                                        <ArrowRight size={14} style={{ color: "var(--slate-300)", marginTop: 10 }} />
                                        <div style={{flex: 1}}><input className={getInputClass(`multiTransport.${i}.to`, 'input input-sm')} placeholder="To Location" value={mt.to} onChange={e=>{ const a=[...multiTransport]; a[i].to=e.target.value; setMultiTransport(a); setErrors({...errors, [`multiTransport.${i}.to`]: ""}) }} /><ErrorBox fieldId={`multiTransport.${i}.to`} /></div>
                                      </div>
                                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <select className="input input-sm" value={mt.vehicleType} onChange={e => { const a=[...multiTransport]; a[i].vehicleType=e.target.value; setMultiTransport(a); }}>
                                          {VEHICLE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}<option value="Other">Other / Local Cab</option>
                                        </select>
                                        {mt.vehicleType === "Bus" && <><input className={getInputClass(`multiTransport.${i}.busNumber`, 'input input-sm')} placeholder="Bus Reg Num *" value={mt.busNumber||""} onChange={e=>{ const a=[...multiTransport]; a[i].busNumber=e.target.value; setMultiTransport(a) }} /> <ErrorBox fieldId={`multiTransport.${i}.busNumber`} /></>}
                                        {mt.vehicleType === "Train" && <><input className={getInputClass(`multiTransport.${i}.trainNumber`, 'input input-sm')} placeholder="Train Number *" value={mt.trainNumber||""} onChange={e=>{ const a=[...multiTransport]; a[i].trainNumber=e.target.value; setMultiTransport(a) }} /> <ErrorBox fieldId={`multiTransport.${i}.trainNumber`} /></>}
                                        {mt.vehicleType === "Flight" && <><input className={getInputClass(`multiTransport.${i}.flightNumber`, 'input input-sm')} placeholder="Flight Number *" value={mt.flightNumber||""} onChange={e=>{ const a=[...multiTransport]; a[i].flightNumber=e.target.value; setMultiTransport(a) }} /> <ErrorBox fieldId={`multiTransport.${i}.flightNumber`} /></>}
                                      </div>
                                   </div>
                                )}
                            </div>
                          )})}
                        </div>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => { setMultiTransport([...multiTransport, { day: 1, from: "", to: "", vehicleType: "Bus" }]); setOpenTransportIndex(multiTransport.length); setErrors({...errors, "transport.global":""}) }}>
                          <Plus size={14} /> Add Travel Segment
                        </button>
                      </div>
                    )}
                  </div>
               </div>

              {/* SECTION B: STAY */}
               <div style={{ borderTop: "1px dashed var(--slate-200)", paddingTop: 32 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Accommodation Configuration</h2>
                  
                  <div style={{ background: "var(--violet-50)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--violet-100)" }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="label">Stay Structure</label>
                      <select className="input" value={stayMode} onChange={e => setStayMode(e.target.value as "same"|"perDay")}>
                        <option value="same">Same hotel for entire trip</option>
                        <option value="perDay">Different stay per day</option>
                      </select>
                    </div>

                    {stayMode === "same" ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#fff", padding: 16, borderRadius: "var(--radius-md)", border: "1px dashed var(--slate-300)" }}>
                           <div className="form-group"><label className="label">Hotel / Resort Name *</label><input className={getInputClass("sameStay.hotelName")} value={sameStay.hotelName} onChange={e=>{ setSameStay({...sameStay, hotelName: e.target.value}); setErrors({...errors, "sameStay.hotelName":"" })}}/><ErrorBox fieldId="sameStay.hotelName" /></div>
                           <div className="form-group"><label className="label">Location *</label><input className={getInputClass("sameStay.location")} value={sameStay.location} onChange={e=>{ setSameStay({...sameStay, location: e.target.value}); setErrors({...errors, "sameStay.location":"" })}}/><ErrorBox fieldId="sameStay.location" /></div>
                           <div className="form-group"><label className="label">Room Type</label><select className="input" value={sameStay.roomType} onChange={e=>setSameStay({...sameStay, roomType: e.target.value})}>{ROOM_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                           <div className="form-group"><label className="label">Meal Plan</label><select className="input" value={sameStay.mealPlan} onChange={e=>setSameStay({...sameStay, mealPlan: e.target.value})}>{MEAL_OPTIONS.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                           <div className="form-group" style={{ gridColumn: "1 / -1" }}><label className="label">Amenities (Comma separated)</label><input className="input" placeholder="e.g. WiFi, Pool, Parking, Breakfast Included" value={sameStay.amenities} onChange={e=>setSameStay({...sameStay, amenities: e.target.value})}/></div>
                           <div className="form-group"><label className="label">Check-In Time</label><input className="input" type="time" value={sameStay.checkIn} onChange={e=>setSameStay({...sameStay, checkIn: e.target.value})}/></div>
                           <div className="form-group"><label className="label">Check-Out Time</label><input className="input" type="time" value={sameStay.checkOut} onChange={e=>setSameStay({...sameStay, checkOut: e.target.value})}/></div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 12 }}>Configure explicit stays mapping to your {dur.days} day duration automatically.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                           {perDayStay.map((stay, idx) => {
                             const isOpen = openStayIndex === idx;
                             return (
                             <div key={idx} style={{ background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", overflow: "hidden" }}>
                                <div style={{ padding: "12px 16px", background: "var(--slate-50)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: isOpen ? "1px solid var(--slate-200)" : "none" }} onClick={() => setOpenStayIndex(isOpen ? null : idx)}>
                                   <span style={{ fontWeight: 600, fontSize: 14 }}>Day {stay.day} Stay {stay.hotelName && `- ${stay.hotelName}`}</span>
                                   <div style={{ display: "flex", gap: 12, alignItems: "center" }}>{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                                </div>
                                {isOpen && (
                                   <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div className="form-group"><label className="label">Hotel Name *</label><input className={getInputClass(`perDayStay.${idx}.hotelName`, 'input input-sm')} value={stay.hotelName} onChange={e=>{ const a=[...perDayStay]; a[idx].hotelName=e.target.value; setPerDayStay(a); setErrors({...errors, [`perDayStay.${idx}.hotelName`]:"" })}}/><ErrorBox fieldId={`perDayStay.${idx}.hotelName`} /></div>
                                        <div className="form-group"><label className="label">Location *</label><input className={getInputClass(`perDayStay.${idx}.location`, 'input input-sm')} value={stay.location} onChange={e=>{ const a=[...perDayStay]; a[idx].location=e.target.value; setPerDayStay(a); setErrors({...errors, [`perDayStay.${idx}.location`]:"" })}}/><ErrorBox fieldId={`perDayStay.${idx}.location`} /></div>
                                        <div className="form-group"><label className="label">Room Type</label><select className="input input-sm" value={stay.roomType} onChange={e=>{ const a=[...perDayStay]; a[idx].roomType=e.target.value; setPerDayStay(a); }}>{ROOM_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                                        <div className="form-group"><label className="label">Meal Plan</label><select className="input input-sm" value={stay.mealPlan} onChange={e=>{ const a=[...perDayStay]; a[idx].mealPlan=e.target.value; setPerDayStay(a); }}>{MEAL_OPTIONS.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                                        <div className="form-group" style={{ gridColumn: "1 / -1" }}><label className="label">Amenities (Comma separated)</label><input className="input input-sm" value={stay.amenities} onChange={e=>{ const a=[...perDayStay]; a[idx].amenities=e.target.value; setPerDayStay(a); }}/></div>
                                   </div>
                                )}
                             </div>
                           )})}
                        </div>
                      </div>
                    )}
                  </div>
               </div>

            </div>
          )}

          {/* Step 4: Itinerary & Media */}
          {step === 4 && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Itinerary & Gallery</h2>

              <div>
                <p style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 14 }}>Day-by-day has been auto-generated based on your duration ({itinerary.length} days).</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {itinerary.map((day, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--slate-200)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: "var(--violet-600)" }}>Day {day.day} *</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                          <input className={getInputClass(`itinerary.${i}.title`)} placeholder="Day title (e.g. Arrival in Jaipur)" value={day.title} onChange={(e) => { const a = [...itinerary]; a[i].title = e.target.value; setItin(a); setErrors({...errors, [`itinerary.${i}.title`]: ""}) }} required />
                          <ErrorBox fieldId={`itinerary.${i}.title`} />
                        </div>
                        <div>
                          <textarea className={getInputClass(`itinerary.${i}.description`)} rows={2} placeholder="Description" value={day.description} onChange={(e) => { const a = [...itinerary]; a[i].description = e.target.value; setItin(a); setErrors({...errors, [`itinerary.${i}.description`]: ""}) }} style={{ resize: "vertical" }} />
                          <ErrorBox fieldId={`itinerary.${i}.description`} />
                        </div>
                        <input className="input" placeholder="Activities (comma separated. e.g. Sightseeing)" value={day.activities} onChange={(e) => { const a = [...itinerary]; a[i].activities = e.target.value; setItin(a); }} />
                        
                        <div style={{ marginTop: 8, padding: 16, background: "rgba(15,23,42,.03)", border: "1px dashed var(--slate-300)", borderRadius: "var(--radius-md)" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, color: "var(--slate-800)" }}>
                            <input type="checkbox" checked={day.isNight} onChange={e => { const a=[...itinerary]; a[i].isNight = e.target.checked; setItin(a); }} style={{ width: 16, height: 16 }} />
                            <Moon size={16} color="var(--amber-500)"/> Include Night Activity?
                          </label>

                          {day.isNight && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                               <input className="input input-sm" placeholder="Night Event Title" value={day.nightTitle} onChange={e => { const a=[...itinerary]; a[i].nightTitle=e.target.value; setItin(a); }} />
                               <input className="input input-sm" placeholder="Short description" value={day.nightDesc} onChange={e => { const a=[...itinerary]; a[i].nightDesc=e.target.value; setItin(a); }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Search Tags (comma separated)</label>
                <input className="input" placeholder="adventure, heritage, culture" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="label">Upload Trip Images</label>
                <div style={{ border: "2px dashed var(--slate-300)", borderRadius: "var(--radius-lg)", padding: 24, textAlign: "center", background: "var(--slate-50)", position: "relative", cursor: "pointer" }}>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ opacity: 0, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, cursor: "pointer", zIndex: 10 }} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "var(--slate-500)" }}>
                    <UploadCloud size={32} style={{ marginBottom: 8 }} />
                    <p style={{ fontWeight: 600, color: "var(--slate-700)" }}>Click or drag files to upload</p>
                    <p style={{ fontSize: 12 }}>Multi-select allowed.</p>
                  </div>
                </div>

                {previewUrls.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12, marginTop: 16 }}>
                    {previewUrls.map((url, i) => (
                      <div key={i} style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", height: 100, border: "1px solid var(--slate-200)" }}>
                        <img src={url} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.6)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Supervisors */}
          {step === 5 && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div>
                   <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Trip Supervisors *</h2>
                   <p style={{ fontSize: 13, color: "var(--slate-500)" }}>At least 1 company representative is strictly required.</p>
                 </div>
                 <button className="btn btn-secondary btn-sm" type="button" onClick={() => { setSupervisors([...supervisors, { name: "", phone: "", email: "", role: "Coordinator", experience: "" }]); setErrors({...errors, "supervisors.global": ""}) }}>
                    <Plus size={14} /> Add Supervisor
                 </button>
              </div>
              <ErrorBox fieldId="supervisors.global" />

              {supervisors.length === 0 ? (
                <div className={getInputClass('supervisors.global', '')} style={{ padding: 40, textAlign: "center", background: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px dashed var(--slate-300)" }}>
                  <p style={{ fontSize: 14, color: "var(--slate-500)", fontWeight: 500 }}>No supervisors added. Click above to assign.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                   {supervisors.map((s, i) => (
                     <div key={i} style={{ padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--slate-200)", position: "relative" }}>
                        <button type="button" onClick={() => setSupervisors(supervisors.filter((_, idx) => idx !== i))} style={{ position: "absolute", right: 16, top: 16, color: "var(--red-500)", background: "none", border: "none", cursor: "pointer" }}>
                           <Trash2 size={16} />
                        </button>
                        <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--violet-600)" }}>Representative #{i+1}</h4>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <input className={getInputClass(`supervisors.${i}.name`)} placeholder="Full Name *" value={s.name} onChange={e => { const a = [...supervisors]; a[i].name = e.target.value; setSupervisors(a); setErrors({...errors, [`supervisors.${i}.name`]: ""}) }} />
                            <ErrorBox fieldId={`supervisors.${i}.name`} />
                          </div>
                          <div>
                            <select className="input" value={s.role} onChange={e => { const a = [...supervisors]; a[i].role = e.target.value; setSupervisors(a); }}>
                              <option>Coordinator</option>
                              <option>Guide</option>
                              <option>Manager</option>
                              <option>Medic</option>
                            </select>
                          </div>
                          <div>
                            <input className={getInputClass(`supervisors.${i}.phone`)} placeholder="Phone Number *" value={s.phone} onChange={e => { const a = [...supervisors]; a[i].phone = e.target.value; setSupervisors(a); setErrors({...errors, [`supervisors.${i}.phone`]: ""}) }} />
                            <ErrorBox fieldId={`supervisors.${i}.phone`} />
                          </div>
                          <div>
                            <input className={getInputClass(`supervisors.${i}.email`)} placeholder="Email Address *" value={s.email} onChange={e => { const a = [...supervisors]; a[i].email = e.target.value; setSupervisors(a); setErrors({...errors, [`supervisors.${i}.email`]: ""}) }} />
                            <ErrorBox fieldId={`supervisors.${i}.email`} />
                          </div>
                          <div>
                            <input className="input" type="number" placeholder="Experience (Years)" value={s.experience} onChange={e => { const a = [...supervisors]; a[i].experience = e.target.value; setSupervisors(a); }} />
                          </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--slate-100)" }}>
            <button
              className="btn btn-secondary"
              onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : navigate("/company/trips")}
            >
              <ArrowLeft size={16} /> {step === 1 ? "Exit" : "Back"}
            </button>
            {step < 5 ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                   if (validateStep(step)) setStep((s) => (s + 1) as Step);
                }}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing...
                  </span>
                ) : "Publish Trip 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTrip;
