import { useAuthStore } from "../../store/authStore";
import { Bell, Search } from "lucide-react";

const roleLabel: Record<string, { text: string; bg: string; color: string }> = {
  TRAVELER: { text: "Traveler",  bg: "rgba(139,92,246,.12)", color: "var(--violet-600)" },
  COMPANY:  { text: "Company",   bg: "rgba(245,158,11,.12)", color: "#b45309" },
  ADMIN:    { text: "Admin",     bg: "rgba(239,68,68,.12)",  color: "var(--red-500)" },
};

interface NavbarProps {
  title?: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const { user } = useAuthStore();
  const role = roleLabel[user?.role ?? "TRAVELER"] ?? roleLabel["TRAVELER"];

  return (
    <header
      style={{
        height: 64,
        background: "#fff",
        borderBottom: "1px solid var(--slate-200)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: Page title / search */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {title ? (
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--slate-900)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
        ) : (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--slate-100)", borderRadius: "var(--radius-md)",
              padding: "8px 14px", width: 220,
            }}
          >
            <Search size={15} strokeWidth={2} color="var(--slate-400)" />
            <span style={{ fontSize: 13, color: "var(--slate-400)" }}>Search…</span>
          </div>
        )}
      </div>

      {/* Right: Role badge + bell + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            padding: "4px 12px", borderRadius: "var(--radius-full)",
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: ".06em",
            background: role.bg, color: role.color,
          }}
        >
          {role.text}
        </span>

        <button
          style={{
            width: 36, height: 36, borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--slate-200)",
            background: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
            position: "relative",
            transition: "all var(--transition)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "var(--slate-100)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#fff")
          }
        >
          <Bell size={16} color="var(--slate-500)" />
        </button>

        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--violet-600), var(--amber-500))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(124,58,237,.3)",
          }}
          title={user?.email}
        >
          {user?.email?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
};

export default Navbar;