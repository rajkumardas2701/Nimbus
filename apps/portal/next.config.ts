import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build for Azure App Service (no server-side build needed).
  output: "standalone",
};

export default nextConfig;
