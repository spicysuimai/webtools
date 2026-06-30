interface DeviceEntry {
  name: string;
  host: string;
  port: number;
  publicUrl: string;
  lastSeen: number;
}

const devices = new Map<string, DeviceEntry>();
const STALE_MS = 90_000;

export interface DeviceInfo {
  name: string;
  host: string;
  port: number;
  publicUrl: string;
  online: boolean;
  lastSeen: number;
}

export function listDevices(): DeviceInfo[] {
  const now = Date.now();
  return Array.from(devices.values()).map((d) => ({
    name: d.name,
    host: d.host,
    port: d.port,
    publicUrl: d.publicUrl,
    online: now - d.lastSeen < STALE_MS,
    lastSeen: d.lastSeen,
  }));
}

export function registerDevice(name: string, host: string, port: number, publicUrl?: string) {
  devices.set(name, { name, host, port, publicUrl: publicUrl || "", lastSeen: Date.now() });
}

export function removeDevice(name: string): boolean {
  return devices.delete(name);
}
