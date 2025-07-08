"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const redirectUrl = searchParams.get("redirect") || "/";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_WEBAPP_BASE_URL}${redirectUrl}`,
    { status: 302 }
  );
}
