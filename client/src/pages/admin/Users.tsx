import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import { getAllUsers, toggleUserActive, deleteUser, getAllCompanies, approveCompany, rejectCompany } from "../../api/admin.api";
import { Search, ShieldCheck, ShieldOff, UserX, UserCheck, CheckCircle, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { CompanyProfile } from "../../types";

type TabId = "users" | "companies";

interface AdminUser {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
}


const roleBadge: Record<string, { bg: string; color: string }> = {
  TRAVELER: { bg: "rgba(139,92,246,.1)", color: "var(--violet-600)" },
  COMPANY:  { bg: "rgba(245,158,11,.1)", color: "#b45309" },
  ADMIN:    { bg: "rgba(239,68,68,.1)",  color: "#dc2626" },
};

const AdminUsers = () => {
  const [tab, setTab]           = useState<TabId>("users");
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState<string | null>(null);

  const [reviewCompany, setReviewCompany] = useState<CompanyProfile | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([getAllUsers({ page: 1 }), getAllCompanies()]);
      setUsers(u.users || []);
      setCompanies(c || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (id: string) => {
    setActing(id);
    try {
      const result = await toggleUserActive(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: result.user.isActive } : u));
      toast.success(result.message);
    } catch { toast.error("Action failed"); }
    finally { setActing(null); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this user? This action is irreversible.")) return;
    setActing(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User completely deleted");
    } catch { toast.error("Failed to delete user"); }
    finally { setActing(null); }
  };

  const handleApprove = async (id: string, msg: string) => {
    setActing(id);
    try {
      const res = await approveCompany(id, msg);
      setCompanies((prev) => prev.map((c) => c._id === id ? res.company : c));
      toast.success("Company approved");
      setReviewCompany(null);
      setReviewMessage("");
    } catch { toast.error("Failed to approve"); }
    finally { setActing(null); }
  };

  const handleReject = async (id: string, msg: string) => {
    setActing(id);
    try {
      const res = await rejectCompany(id, msg);
      setCompanies((prev) => prev.map((c) => c._id === id ? res.company : c));
      toast.success("Company rejected");
      setReviewCompany(null);
      setReviewMessage("");
    } catch { toast.error("Failed to reject"); }
    finally { setActing(null); }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCompanies = companies.filter((c) =>
    c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <Layout title="User Management">
      <div className="page">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} users · {companies.length} companies registered</p>
        </div>

        {/* Tab + Search bar */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {([
              { id: "users" as TabId, label: `Users (${users.length})` },
              { id: "companies" as TabId, label: `Companies (${companies.length})` },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSearch(""); }}
                className="btn btn-sm"
                style={{
                  background: tab === t.id ? "var(--violet-600)" : "transparent",
                  color: tab === t.id ? "#fff" : "var(--slate-600)",
                  border: tab === t.id ? "none" : "1.5px solid var(--slate-200)",
                  fontWeight: 600,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ position: "relative", width: 260 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
            <input
              className="input"
              placeholder={tab === "users" ? "Search by email…" : "Search companies…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, fontSize: 13 }}
            />
          </div>
        </div>

        {/* Users Table */}
        {tab === "users" && (
          filteredUsers.length === 0 ? (
            <EmptyState title="No users found" description="Try a different search." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Email Verified</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const rb = roleBadge[u.role] || roleBadge.TRAVELER;
                    return (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                                background: "linear-gradient(135deg, var(--violet-600), #4f46e5)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: 700, color: "#fff",
                              }}
                            >
                              {u.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--slate-900)" }}>{u.email.split("@")[0]}</p>
                              <p style={{ fontSize: 11, color: "var(--slate-400)" }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700, background: rb.bg, color: rb.color }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.isEmailVerified
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#15803d" }}><CheckCircle size={12} /> Verified</span>
                            : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#b45309" }}><X size={12} /> Not verified</span>}
                        </td>
                        <td>
                          <p style={{ fontSize: 12, color: "var(--slate-500)" }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                          </p>
                        </td>
                        <td>
                          <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700, background: u.isActive ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.1)", color: u.isActive ? "#15803d" : "#dc2626" }}>
                            {u.isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleToggleUser(u._id)}
                              disabled={acting === u._id}
                              style={{
                                background: u.isActive ? "rgba(239,68,68,.1)" : "rgba(34,197,94,.1)",
                                color: u.isActive ? "#dc2626" : "#15803d",
                                border: "none", fontSize: 12, fontWeight: 700,
                                display: "flex", alignItems: "center", gap: 5,
                              }}
                            >
                              {acting === u._id
                                ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                : u.isActive ? <><UserX size={12} /> Suspend</> : <><UserCheck size={12} /> Activate</>}
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={acting === u._id}
                              style={{
                                background: "rgba(239,68,68,.1)", color: "#dc2626",
                                border: "none", fontSize: 12, fontWeight: 700,
                                display: "flex", alignItems: "center", gap: 5,
                              }}
                              title="Delete completely"
                            >
                              {acting === u._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : <><Trash2 size={12} /> Delete</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Companies Table */}
        {tab === "companies" && (
          filteredCompanies.length === 0 ? (
            <EmptyState title="No companies found" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Owner Email</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((c) => {
                    const st = c.verificationStatus || "pending";
                    const stBg = st === "approved" ? "rgba(34,197,94,.12)" : st === "rejected" ? "rgba(239,68,68,.1)" : "rgba(245,158,11,.1)";
                    const stColor = st === "approved" ? "#15803d" : st === "rejected" ? "#dc2626" : "#b45309";
                    return (
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
                        <td>
                          <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700, textTransform: "capitalize", background: stBg, color: stColor }}>
                            {st}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--slate-400)" }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {st === "approved" && <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>✓ Verified</span>}
                            <button className="btn btn-sm" onClick={() => { setReviewCompany(c); setReviewMessage(""); }} style={{ background: "rgba(139,92,246,.1)", color: "var(--violet-600)", border: "none", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                              <Search size={12} /> {st === "approved" ? "View Log" : "Review"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

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
              {reviewCompany.verificationStatus === "approved" ? (
                <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#15803d", background: "rgba(34,197,94,.06)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid rgba(34,197,94,.2)" }}>
                    <ShieldCheck size={16} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Application is fully verified and approved.</span>
                  </div>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => setReviewCompany(null)} 
                    style={{ background: "#fff", border: "1px solid var(--slate-200)", color: "var(--slate-600)" }}
                  >
                    Close
                  </button>
                </div>
              ) : reviewCompany.verificationStatus === "rejected" ? (
                <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", background: "rgba(239,68,68,.06)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,.2)" }}>
                    <ShieldOff size={16} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Application rejected. Waiting for resubmission.</span>
                  </div>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => setReviewCompany(null)} 
                    style={{ background: "#fff", border: "1px solid var(--slate-200)", color: "var(--slate-600)" }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AdminUsers;
