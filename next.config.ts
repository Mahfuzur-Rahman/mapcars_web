import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit `.next/standalone` — a self-contained server bundle with only the
  // node_modules it actually traced. This is what the Docker runtime stage
  // copies, so the image doesn't ship the full dependency tree or the SDK.
  // Note: `public/` and `.next/static` are NOT copied into standalone
  // automatically; the Dockerfile copies them in explicitly.
  output: "standalone",

  // Baseline security headers on every route. The CSP is deliberately limited
  // to directives that cannot break the site: a full `script-src` would have to
  // allow Next's inline scripts plus Google Identity Services and Google Maps,
  // and is deferred until it can be rolled out in Report-Only first.
  // Nginx (the public edge) sets none of these, so there is no duplication.
  // Framing is limited to our own origin rather than DENY / 'none': the driver
  // and admin document previews iframe same-origin /api/bff/**/content PDFs,
  // which DENY would blank. Other sites still cannot frame us (clickjacking).
  // `geolocation=(self)` stays enabled; camera and microphone are never used.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Content-Security-Policy",
            value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
          },
        ],
      },
      // Document/photo streams (admin + driver documents, appeal photos, and the
      // customer route if it is added) are embedded same-origin in an <iframe>.
      // Chrome's PDF viewer refuses to render a PDF whose own response carries
      // `object-src 'none'`, so these drop that one directive. Per the Next docs
      // the LAST matching rule wins for a repeated header key; frame-ancestors
      // and X-Frame-Options still come from the rule above/here.
      {
        source: "/api/bff/:path*/content",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "base-uri 'self'; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
