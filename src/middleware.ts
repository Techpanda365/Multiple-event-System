import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return request.cookies.get("session-token")?.value || request.cookies.get("next-auth.session-token")?.value;
}

function decodeTokenPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = getToken(request);
  const payload = token ? decodeTokenPayload(token) : null;

  if (!token || !payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return NextResponse.redirect(new URL("/login?expired=1", request.url));
  }

  const isSuperAdmin = payload.role?.toUpperCase() === "SUPER_ADMIN";

  if (pathname.startsWith("/admin")) {
    if (isSuperAdmin) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (isSuperAdmin && (pathname === "/dashboard/users/list" || pathname === "/dashboard/users" || pathname === "/dashboard/users/roles")) {
      return NextResponse.redirect(new URL("/admin/users", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
