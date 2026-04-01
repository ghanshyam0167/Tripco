import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "var(--slate-100)", textAlign: "center", padding: 24,
      }}
    >
      <div
        style={{
          width: 80, height: 80, borderRadius: "var(--radius-xl)",
          background: "rgba(239,68,68,.1)", border: "2px solid rgba(239,68,68,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <ShieldOff size={36} color="var(--red-500)" />
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--slate-900)", marginBottom: 8 }}>
        Access Denied
      </h1>
      <p style={{ fontSize: 15, color: "var(--slate-500)", maxWidth: 340, marginBottom: 28 }}>
        You don't have permission to access this page. Please use an account with the correct role.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go back</button>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>Sign in with another account</button>
      </div>
    </div>
  );
};

export default Unauthorized;
