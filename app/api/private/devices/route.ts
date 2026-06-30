import { NextRequest, NextResponse } from "next/server";
import { listDevices, registerDevice } from "@/lib/device-store";

export async function GET() {
  return NextResponse.json({ devices: listDevices() });
}

export async function POST(req: NextRequest) {
  const { name, host, port, publicUrl } = await req.json();
  if (!name || !host || !port) {
    return NextResponse.json({ error: "name, host, port required" }, { status: 400 });
  }
  registerDevice(name, host, port, publicUrl || undefined);
  return NextResponse.json({ ok: true });
}
