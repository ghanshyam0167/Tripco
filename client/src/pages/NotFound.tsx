import { useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";

const NotFound = () => {
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
          background: "linear-gradient(135deg, var(--violet-600), #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", boxShadow: "var(--shadow-glow)",
        }}
      >
        <Plane size={36} color="#fff" />
      </div>
      <h1 style={{ fontSize: 80, fontWeight: 900, color: "var(--slate-200)", lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--slate-900)", marginBottom: 8 }}>
        Page not found
      </h2>
      <p style={{ fontSize: 15, color: "var(--slate-500)", maxWidth: 340, marginBottom: 28 }}>
        Looks like this destination doesn't exist on our map. Let's get you back on track.
      </p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate(-1)}>
        Go back
      </button>
    </div>
  );
};

export default NotFound;
