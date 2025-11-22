import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/patients"];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If no token and accessing protected route, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists and on login page, redirect to patients
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/patients", request.url));
  }

  // If no token and on root, redirect to login
  if (!token && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists and on root, redirect to patients
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/patients", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
