import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { NextURL } from "next/dist/server/web/next-url";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Default redirect path (after successful confirmation)
  let nextPath = "/auth/login";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      console.log("no error in confirm");
      // If user was invited, send them to reset their password
      if (type === "invite" || type === "recovery") {
        nextPath = "/auth/set-password";
      }
      if (type === "email") {
        nextPath = "/auth/login";
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const passwordAlreadySet = user?.user_metadata?.password_set;
      console.log("password set", passwordAlreadySet);
      if (!passwordAlreadySet) {
        nextPath = "/auth/set-password";
      }
    }

    const redirectTo = new NextURL(
      `${process.env.NEXT_PUBLIC_WEBAPP_BASE_URL}`
    );
    redirectTo.pathname = nextPath;
    redirectTo.searchParams.delete("token_hash");
    redirectTo.searchParams.delete("type");
    return NextResponse.redirect(redirectTo);
  }

  // Redirect to an error page if token verification fails
  const errorRedirect = new NextURL(
    `${process.env.NEXT_PUBLIC_WEBAPP_BASE_URL}`
  );
  errorRedirect.pathname = "/error";
  return NextResponse.redirect(errorRedirect);
}
