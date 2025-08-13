import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admintoken", "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  res.cookies.set("csrf", "", { path: "/", maxAge: 0 });
  return res;
}
