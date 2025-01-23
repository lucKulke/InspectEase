import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="flex justify-end mt-28">
        {user ? <h1>{user.email}</h1> : <Link href="/login">Login</Link>}
      </div>
      <div className="flex justify-center mt-14">
        <ul className="space-y-11">
          <li>
            <Link href="/studio">Studio</Link>
          </li>
          <li>
            <Link href="/workbench">Workbench</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
