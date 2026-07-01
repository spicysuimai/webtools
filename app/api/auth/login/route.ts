import { NextResponse } from "next/server";
import { signToken, verifyPassword, getAuthCookieValue } from "@/lib/auth";

export async function POST(request: Request) {
  let password: string;
  try {
    const body = await request.json();
    password = body.password;
  } catch {
    return NextResponse.json({ error: "无效的请求" }, { status: 400 });
  }

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "密码不能为空" }, { status: 400 });
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const token = await signToken();
  const isHttps = request.url.startsWith("https://");
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", getAuthCookieValue(token, isHttps));
  return response;
}
