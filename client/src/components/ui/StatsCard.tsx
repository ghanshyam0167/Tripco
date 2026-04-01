import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
  trend?: { value: number; positive?: boolean };
}

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "var(--violet-500)",
  trend,
}: StatsCardProps) => (
  <div className="card" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "var(--radius-md)",
        background: `${color}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, color: "var(--slate-500)", fontWeight: 600, marginBottom: 4 }}>
        {title}
      </p>
      <p style={{ fontSize: 28, fontWeight: 800, color: "var(--slate-900)", lineHeight: 1.1 }}>
        {value}
      </p>
      {(subtitle || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          {trend && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: trend.positive ? "var(--green-500)" : "var(--red-500)",
              }}
            >
              {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: 12, color: "var(--slate-400)" }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  </div>
);

export default StatsCard;
