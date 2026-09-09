import os from "node:os";
import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import {
  CSP_REPORT_ONLY,
  HEADER_NOSNIFF,
  HEADER_REFERRER,
} from "./src/lib/security-headers";

/** LAN IPv4 hosts so a phone on the same Wi-Fi can load `pnpm dev` (Next 15). */
function lanDevOrigins(): string[] {
  const hosts: string[] = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4" && !addr.internal) {
        hosts.push(addr.address);
      }
    }
  }
  return hosts;
}

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sharp"],
  allowedDevOrigins: lanDevOrigins(),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: HEADER_NOSNIFF },
          { key: "Referrer-Policy", value: HEADER_REFERRER },
          {
            key: "Content-Security-Policy-Report-Only",
            value: CSP_REPORT_ONLY,
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
})(nextConfig);
