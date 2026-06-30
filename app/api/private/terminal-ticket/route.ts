import { NextResponse } from "next/server";
import { signTerminalTicket } from "@/lib/auth";

export async function POST() {
  try {
    const ticket = await signTerminalTicket();
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "failed to issue ticket" }, { status: 500 });
  }
}
