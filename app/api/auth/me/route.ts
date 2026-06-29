import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!cookie) {
    return NextResponse.json({ authed: false });
  }

  const payload = await verifyToken(cookie);
  return NextResponse.json({ authed: !!payload });
}
