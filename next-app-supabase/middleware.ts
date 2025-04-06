import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // update user's auth session
  const { pathname } = request.nextUrl;

  // Allow public access to login, auth confirmation, and password reset pages
  if (
    pathname === "/auth/signup" ||
    pathname === "/auth/login" ||
    pathname === "/auth/confirm" ||
    pathname === "/auth/set-password" ||
    pathname === "/auth/forgot-password"
  ) {
    return NextResponse.next();
  }

  // Update user's auth session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (st ´4atic files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
