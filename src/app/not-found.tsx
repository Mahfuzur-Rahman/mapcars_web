import Link from "next/link";
import type { CSSProperties } from "react";

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  textAlign: "center",
  backgroundColor: "#ffffff",
  color: "#0f172a",
  fontFamily: "var(--font-inter), sans-serif",
};

const titleStyle: CSSProperties = {
  fontSize: "clamp(3rem, 8vw, 5rem)",
  fontWeight: 800,
  lineHeight: 1,
  marginBottom: "16px",
  background: "linear-gradient(135deg, #00B9D9 0%, #0B7DC0 50%, #22C55E 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const primaryBtnStyle: CSSProperties = {
  padding: "12px 28px",
  background: "linear-gradient(135deg, #00B9D9 0%, #0B7DC0 100%)",
  color: "#ffffff",
  borderRadius: "9999px",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  boxShadow: "0 4px 20px rgba(0, 185, 217, 0.3)",
};

const secondaryBtnStyle: CSSProperties = {
  padding: "12px 28px",
  background: "rgba(0, 185, 217, 0.08)",
  border: "1px solid rgba(0, 185, 217, 0.2)",
  color: "#085E94",
  borderRadius: "9999px",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
};

export default function NotFound() {
  return (
    <main style={mainStyle}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <h1 style={titleStyle}>404</h1>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>
          Page Not Found
        </h2>
        <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.6, marginBottom: "32px" }}>
          The page or resource you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={primaryBtnStyle}>
            Go to Home
          </Link>
          <Link href="/auth/login" style={secondaryBtnStyle}>
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
