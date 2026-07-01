import { NextResponse } from "next/server";
import { getClearCookieValue } from "@/lib/auth";

export async function POST(request: Request) {
  const isHttps = request.url.startsWith("https://");
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", getClearCookieValue(isHttps));
  return response;
}
