import { NextResponse } from "next/server";
import { removeDevice } from "@/lib/device-store";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  removeDevice(name);
  return NextResponse.json({ ok: true });
}
