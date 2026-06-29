import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { validateRequest, createAdapter } from "@/lib/ai/providers/registry";

const MAX_BODY_BYTES = 100_000;
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 8000;
const VALID_ROLES = new Set(["user", "assistant", "system"]);

async function getAuthCookie(request: Request): Promise<string | null> {
  const cookie = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];
  return cookie ?? null;
}

export async function POST(request: Request) {
  // --- size check ---
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "请求体过大" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效的 JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "请求体不能为空" }, { status: 400 });
  }

  const { provider, model, messages } = body as Record<string, unknown>;

  if (typeof provider !== "string" || typeof model !== "string") {
    return NextResponse.json(
      { error: "provider 和 model 必须为字符串" },
      { status: 400 },
    );
  }

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "messages 必须为数组" }, { status: 400 });
  }

  // --- auth ---
  const token = await getAuthCookie(request);
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // --- provider + model whitelist ---
  const validation = validateRequest(provider, model);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // --- messages validation ---
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `消息不能超过 ${MAX_MESSAGES} 条` },
      { status: 400 },
    );
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== "object") {
      return NextResponse.json({ error: "消息格式无效" }, { status: 400 });
    }
    if (!VALID_ROLES.has(msg.role)) {
      return NextResponse.json({ error: `无效的 role: ${msg.role}` }, { status: 400 });
    }
    if (typeof msg.content !== "string") {
      return NextResponse.json({ error: "消息内容必须为字符串" }, { status: 400 });
    }
    if (msg.content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `单条消息不能超过 ${MAX_CONTENT_LENGTH} 字` },
        { status: 400 },
      );
    }
  }

  // --- call adapter ---
  try {
    const adapter = createAdapter(provider);
    const content = await adapter.chat(
      messages.map((m) => ({ role: m.role, content: m.content })),
      model,
    );
    return NextResponse.json({ content });
  } catch (e) {
    console.error("AI chat error:", e);
    return NextResponse.json(
      { error: "AI 服务暂时不可用，请稍后重试" },
      { status: 502 },
    );
  }
}
