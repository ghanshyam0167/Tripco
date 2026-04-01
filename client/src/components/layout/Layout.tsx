import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar title={title} />
        <main
          style={{
            flex: 1,
            background: "var(--slate-100)",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;