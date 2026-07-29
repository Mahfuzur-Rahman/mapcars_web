import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit `.next/standalone` — a self-contained server bundle with only the
  // node_modules it actually traced. This is what the Docker runtime stage
  // copies, so the image doesn't ship the full dependency tree or the SDK.
  // Note: `public/` and `.next/static` are NOT copied into standalone
  // automatically; the Dockerfile copies them in explicitly.
  output: "standalone",
};

export default nextConfig;
