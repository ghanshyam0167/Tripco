import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState = ({
  title = "Nothing here yet",
  description = "There's no data to display at the moment.",
  icon,
}: EmptyStateProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      padding: "64px 24px",
      color: "var(--slate-400)",
      textAlign: "center",
    }}
  >
    <div style={{ color: "var(--slate-300)", marginBottom: 4 }}>
      {icon ?? <Inbox size={48} strokeWidth={1.5} />}
    </div>
    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--slate-600)" }}>
      {title}
    </h3>
    <p style={{ fontSize: 14, maxWidth: 320 }}>{description}</p>
  </div>
);

export default EmptyState;
