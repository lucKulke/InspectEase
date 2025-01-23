import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import StudioNavbar from "@/components/StudioNavbar";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div className="p-10">
      {user?.email ? (
        <h1>
          <form action="/auth/signout" method="post">
            <button className="button block" type="submit">
              Sign out {user.email}
            </button>
          </form>
        </h1>
      ) : (
        <h1>
          <Link href={"/login"}>Login</Link>
        </h1>
      )}
    </div>
  );
}
