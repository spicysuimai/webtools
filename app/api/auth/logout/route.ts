import { NextResponse } from "next/server";
import { getClearCookieValue } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", getClearCookieValue());
  return response;
}
