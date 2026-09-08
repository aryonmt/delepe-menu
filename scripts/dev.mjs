/**
 * `pnpm dev` wrapper: bind all interfaces, then print the real Wi-Fi URL.
 * Next prints `Network: http://0.0.0.0:3000` which phones cannot open.
 */
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const port = process.env.PORT ?? "3000";

function lanIpv4s() {
  const wifi = [];
  const other = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    const skip =
      /vmware|vethernet|windscribe|virtualbox|hyper-v|tailscale|loopback|bluetooth/i.test(
        name,
      );
    for (const addr of addrs ?? []) {
      if (addr.family !== "IPv4" || addr.internal) continue;
      if (addr.address.startsWith("169.254.")) continue;
      if (skip) continue;
      if (/wi-?fi|wlan|wireless/i.test(name)) wifi.push(addr.address);
      else other.push(addr.address);
    }
  }
  return [...wifi, ...other];
}

const hosts = lanIpv4s();
if (hosts[0]) {
  console.log(`\n  Phone (same Wi-Fi):  http://${hosts[0]}:${port}\n`);
} else {
  console.log(
    "\n  No Wi-Fi IPv4 found. Phone preview needs the PC on Wi-Fi (VPN off).\n",
  );
}

const child = spawn(process.execPath, [nextBin, "dev", "--hostname", "0.0.0.0"], {
  cwd: path.resolve(import.meta.dirname, ".."),
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
