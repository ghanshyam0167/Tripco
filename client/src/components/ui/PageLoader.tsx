const PageLoader = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--slate-100)",
      gap: "16px",
    }}
  >
    <div className="spinner" style={{ width: 48, height: 48 }} />
    <p style={{ color: "var(--slate-400)", fontSize: 14 }}>Loading…</p>
  </div>
);

export default PageLoader;
