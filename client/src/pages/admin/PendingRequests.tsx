import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import { getPendingCompanies, approveCompany, rejectCompany } from "../../api/admin.api";
import { Search, ShieldCheck, ShieldOff, X } from "lucide-react";
import toast from "react-hot-toast";
import type { CompanyProfile } from "../../types";

const AdminPendingRequests = () => {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState<string | null>(null);

  const [reviewCompany, setReviewCompany] = useState<CompanyProfile | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await getPendingCompanies();
      setCompanies(p || []);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, msg: string) => {
    setActing(id);
    try {
      await approveCompany(id, msg);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      toast.success("Company approved");
      setReviewCompany(null);
      setReviewMessage("");
    } catch { toast.error("Failed to approve"); }
    finally { setActing(null); }
  };

  const handleReject = async (id: string, msg: string) => {
    setActing(id);
    try {
      await rejectCompany(id, msg);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      toast.success("Company rejected");
      setReviewCompany(null);
      setReviewMessage("");
    } catch { toast.error("Failed to reject"); }
    finally { setActing(null); }
  };

  if (loading) return <PageLoader />;

  return (
    <Layout title="Pending Requests">
      <div className="page">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Pending Verifications</h1>
          <p className="page-subtitle">{companies.length} companies awaiting admin approval</p>
        </div>

        {companies.length === 0 ? (
          <EmptyState title="All clear!" description="There are no companies pending verification right now." icon={<ShieldCheck size={40} strokeWidth={1.5} />} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Owner Email</th>
                  <th>Location</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--amber-500), #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {c.companyName?.[0]?.toUpperCase() || "C"}
                        </div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{c.companyName || "—"}</p>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--slate-600)" }}>
                      {(typeof c.userId === "object" ? c.userId.email : "") || c.contactEmail || "—"}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--slate-500)" }}>
                      {c.location?.city ? `${c.location.city}${c.location.country ? ", " + c.location.country : ""}` : "—"}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--slate-400)" }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => { setReviewCompany(c); setReviewMessage(""); }} style={{ background: "rgba(139,92,246,.1)", color: "var(--violet-600)", border: "none", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <Search size={12} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {reviewCompany && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card anim-fade-up" style={{ width: "100%", maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 24, position: "relative", textAlign: "left" }}>
            <button onClick={() => setReviewCompany(null)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", zIndex: 2 }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--slate-900)", marginBottom: 24, flexShrink: 0 }}>Review Company Verification</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, flex: 1, minHeight: 0 }}>
              {/* Left Side: Details */}
              <div style={{ background: "var(--slate-50)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--slate-200)", overflowY: "auto" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--slate-700)", marginBottom: 12 }}>Company Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--slate-600)" }}>
                  <p><strong>Name:</strong> {reviewCompany.companyName || "—"}</p>
                  <p><strong>Email:</strong> {reviewCompany.contactEmail || (typeof reviewCompany.userId === "object" ? reviewCompany.userId.email : "") || "—"}</p>
                  <p><strong>Phone:</strong> {reviewCompany.contactPhone || "—"}</p>
                  <p><strong>Website:</strong> {reviewCompany.website ? <a href={reviewCompany.website} target="_blank" rel="noreferrer" style={{ color: "var(--violet-600)" }}>{reviewCompany.website}</a> : "—"}</p>
                  <p><strong>Location:</strong> {reviewCompany.location?.city ? `${reviewCompany.location.city}, ${reviewCompany.location.country}` : "—"}</p>
                  <p><strong>Reg Number:</strong> {reviewCompany.registrationNumber || "—"}</p>
                  <p><strong>Est. Year:</strong> {reviewCompany.establishedYear || "—"}</p>
                  <div>
                    <strong style={{ display: "block", marginBottom: 4 }}>Description:</strong>
                    <p style={{ background: "#fff", padding: 10, borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", fontSize: 12, lineHeight: 1.5, minHeight: 60 }}>
                      {reviewCompany.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: History */}
              <div style={{ background: "var(--slate-50)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--slate-200)", overflowY: "auto" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--slate-700)", marginBottom: 12 }}>Verification History</h3>
                {reviewCompany.verificationHistory?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[...reviewCompany.verificationHistory].reverse().map((h, i) => (
                      <div key={i} style={{ borderLeft: "2px solid var(--violet-200)", paddingLeft: 12, marginLeft: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: h.status === "approved" ? "#15803d" : h.status === "rejected" ? "#dc2626" : "#b45309" }}>{h.status}</span>
                          <span style={{ fontSize: 10, color: "var(--slate-400)" }}>{new Date(h.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {h.reason && <p style={{ fontSize: 12, color: "var(--slate-600)", background: "#fff", padding: "6px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)" }}>{h.reason}</p>}
                        {h.updatedBy?.email && <p style={{ fontSize: 10, color: "var(--slate-400)", marginTop: 4 }}>By: {h.updatedBy.email}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--slate-500)" }}>No history available.</p>
                )}
              </div>
            </div>

            {/* Action Area */}
            <div style={{ borderTop: "1px solid var(--slate-200)", paddingTop: 20, flexShrink: 0 }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="label">Add Note / Rejection Reason</label>
                <textarea 
                  className="input" 
                  rows={2} 
                  placeholder="Required if rejecting..." 
                  value={reviewMessage} 
                  onChange={(e) => setReviewMessage(e.target.value)} 
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button 
                  className="btn btn-sm" 
                  onClick={() => setReviewCompany(null)} 
                  style={{ background: "#fff", border: "1px solid var(--slate-200)", color: "var(--slate-600)" }}
                  disabled={acting === reviewCompany._id}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-sm" 
                  onClick={() => {
                    if (!reviewMessage.trim()) { toast.error("Rejection reason required"); return; }
                    handleReject(reviewCompany._id, reviewMessage);
                  }}
                  disabled={acting === reviewCompany._id}
                  style={{ background: "rgba(239,68,68,.1)", color: "#dc2626", border: "none", fontWeight: 700 }}
                >
                  {acting === reviewCompany._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : <><ShieldOff size={14} /> Reject Application</>}
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => handleApprove(reviewCompany._id, reviewMessage)}
                  disabled={acting === reviewCompany._id}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  {acting === reviewCompany._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : <><ShieldCheck size={14} /> Approve Verified</>}
                </button>
              </div>
             </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default AdminPendingRequests;
