import { createClient } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — require login
  const protectedRoutes = ["/dashboard", "/book"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Auth routes — redirect if already logged in
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.headers.getSetCookie().forEach((cookie) => {
      redirectResponse.headers.append("Set-Cookie", cookie);
    });
    return redirectResponse;
  }

  if (isAuthRoute && user) {
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
    response.headers.getSetCookie().forEach((cookie) => {
      redirectResponse.headers.append("Set-Cookie", cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/book/:path*",
    "/login",
    "/register",
  ],
};
