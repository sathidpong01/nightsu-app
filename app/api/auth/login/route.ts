import { NextRequest, NextResponse } from "next/server";
import { signToken, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// in-memory rate limit (เหมาะ dev/โฮสต์เดี่ยว)
const WINDOW_MS = 10 * 60 * 1000; // 10 นาที
const LIMIT = 10; // ความพยายาม/หน้าต่าง
const attempts = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest) {
  return (
    req.ip ||
    req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  // --- CSRF double-submit cookie
  const csrfCookie = req.cookies.get("csrf")?.value || "";
  const csrfHeader = req.headers.get("x-csrf") || "";
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return new NextResponse("CSRF token invalid", { status: 400 });
  }

  // --- Brute-force rate limit
  const ip = getIP(req);
  const now = Date.now();
  const rec = attempts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (rec.resetAt < now) { rec.count = 0; rec.resetAt = now + WINDOW_MS; }
  if (rec.count >= LIMIT) {
    return new NextResponse("Too many attempts. Try later.", { status: 429 });
  }

  const form = await req.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");

  const U = process.env.ADMIN_USER || "admin";

  const okUser = username === U;
  const okPass = await verifyPassword(password);

  if (!okUser || !okPass) {
    rec.count += 1;
    attempts.set(ip, rec);
    return new NextResponse("Invalid username or password", { status: 401 });
  }

  // ออก token (อายุ 7 วัน)
  const token = signToken({ sub: "admin" }, 60 * 60 * 24 * 7);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admintoken", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  // ล้าง csrf cookie หลังใช้
  res.cookies.set("csrf", "", { path: "/", maxAge: 0 });
  return res;
}
