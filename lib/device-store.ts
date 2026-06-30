interface DeviceEntry {
  name: string;
  host: string;
  port: number;
  lastSeen: number;
}

const devices = new Map<string, DeviceEntry>();
const STALE_MS = 90_000;

export function listDevices() {
  const now = Date.now();
  return Array.from(devices.values()).map((d) => ({
    name: d.name,
    host: d.host,
    port: d.port,
    online: now - d.lastSeen < STALE_MS,
    lastSeen: d.lastSeen,
  }));
}

export function registerDevice(name: string, host: string, port: number) {
  devices.set(name, { name, host, port, lastSeen: Date.now() });
}

export function removeDevice(name: string): boolean {
  return devices.delete(name);
}
