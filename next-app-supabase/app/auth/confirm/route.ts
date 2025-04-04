import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Default redirect path (after successful confirmation)
  let nextPath = "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // If user was invited, send them to reset their password
      if (type === "invite") {
        nextPath = "/auth/reset-password";
      }

      const redirectTo = request.nextUrl.clone();
      redirectTo.pathname = nextPath;
      redirectTo.searchParams.delete("token_hash");
      redirectTo.searchParams.delete("type");

      return NextResponse.redirect(redirectTo);
    }
  }

  // Redirect to an error page if token verification fails
  const errorRedirect = request.nextUrl.clone();
  errorRedirect.pathname = "/error";
  return NextResponse.redirect(errorRedirect);
}
