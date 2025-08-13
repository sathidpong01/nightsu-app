import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const token = req.cookies.get("admintoken")?.value || "";
  const session = await verifyTokenEdge(token);
  const isAdmin = !!session;

  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && isAdmin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
