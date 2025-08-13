import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = crypto.randomBytes(24).toString("base64url");
  const res = NextResponse.json({ csrf: token });
  // cookie แบบอ่านได้จาก client เพื่อใช้เทียบ (double-submit)
  res.cookies.set("csrf", token, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 นาที
  });
  return res;
}
