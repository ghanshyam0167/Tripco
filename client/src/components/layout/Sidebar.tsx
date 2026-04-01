import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  PlusCircle,
  List,
  Users,
  BarChart3,
  LogOut,
  Plane,
} from "lucide-react";

interface NavLink {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const travelerLinks: NavLink[] = [
    { name: "Dashboard",      path: "/traveler",          icon: <LayoutDashboard size={18} /> },
    { name: "Explore Trips",  path: "/traveler/trips",     icon: <Compass size={18} /> },
    { name: "My Bookings",    path: "/traveler/bookings",  icon: <CalendarCheck size={18} /> },
  ];

  const companyLinks: NavLink[] = [
    { name: "Dashboard",      path: "/company",            icon: <LayoutDashboard size={18} /> },
    { name: "Create Trip",    path: "/company/create",     icon: <PlusCircle size={18} /> },
    { name: "Manage Trips",   path: "/company/trips",      icon: <List size={18} /> },
    { name: "Bookings",       path: "/company/bookings",   icon: <CalendarCheck size={18} /> },
  ];

  const adminLinks: NavLink[] = [
    { name: "Dashboard",      path: "/admin",              icon: <LayoutDashboard size={18} /> },
    { name: "Users",          path: "/admin/users",        icon: <Users size={18} /> },
    { name: "Reports",        path: "/admin/reports",      icon: <BarChart3 size={18} /> },
  ];

  const links =
    user?.role === "COMPANY" ? companyLinks :
    user?.role === "ADMIN"   ? adminLinks   :
    travelerLinks;

  const isActive = (path: string) =>
    path === "/traveler" || path === "/company" || path === "/admin"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const roleColors: Record<string, string> = {
    TRAVELER: "var(--violet-500)",
    COMPANY:  "var(--amber-500)",
    ADMIN:    "var(--red-500)",
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--violet-600), #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <Plane size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              TripCo
            </h1>
            <span
              style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".1em", color: roleColors[user?.role || "TRAVELER"],
              }}
            >
              {user?.role || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <p
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
            color: "rgba(255,255,255,.3)", textTransform: "uppercase",
            padding: "8px 12px 4px",
          }}
        >
          Navigation
        </p>
        {links.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: "var(--radius-md)",
                textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "rgba(255,255,255,.55)",
                background: active
                  ? "linear-gradient(135deg, rgba(139,92,246,.35), rgba(79,70,229,.2))"
                  : "transparent",
                borderLeft: active ? "3px solid var(--violet-400)" : "3px solid transparent",
                transition: "all var(--transition)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.06)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.85)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.55)";
                }
              }}
            >
              <span style={{ opacity: active ? 1 : .7 }}>{link.icon}</span>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            background: "rgba(255,255,255,.05)",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--violet-600), var(--amber-500))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}
          >
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email?.split("@")[0] ?? "User"}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", width: "100%", border: "none",
            borderRadius: "var(--radius-md)", cursor: "pointer",
            background: "transparent",
            color: "rgba(255,255,255,.4)", fontSize: 14,
            transition: "all var(--transition)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.12)";
            (e.currentTarget as HTMLElement).style.color = "var(--red-400)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.4)";
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;