import os from "node:os";
import type { NextConfig } from "next";

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
};

export default nextConfig;
