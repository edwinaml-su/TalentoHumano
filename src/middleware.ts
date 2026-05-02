import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth-utils";

// 1. Specify protected and public routes
const protectedRoutes = ["/", "/admin", "/employees", "/payroll", "/attendance", "/portal", "/config", "/organizations", "/positions"];
const publicRoutes = ["/api/auth/login", "/api/health"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get("session")?.value;
  let session = null;
  
  if (cookie) {
    try {
      session = await decrypt(cookie);
    } catch (e) {
      // Invalid session
    }
  }

  // 4. Redirect to /login if the user is not authenticated
  // We exclude API routes from automatic redirect if they are not specifically handled
  if (isProtectedRoute && !session && !path.startsWith('/api')) {
    // For page requests, redirect to login
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isProtectedRoute && !session && path.startsWith('/api')) {
    // For API requests, return 401
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 5. Redirect to / if the user is authenticated and trying to access /login (or root if we add it)
  // Currently login page is not defined, but we prepare for it
  /*
  if (isPublicRoute && session && path.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  */

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
