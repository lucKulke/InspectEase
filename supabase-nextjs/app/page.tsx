import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import StudioNavbar from "@/components/StudioNavbar";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Library, ClipboardPenLine } from "lucide-react";

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

      <div className="flex justify-center mt-52 items-center ">
        <div className="space-y-5">
          <div>
            <Link href={"/studio"}>
              <div className="border-2 hover:bg-slate-300 hover:border-black hover:shadow-2xl rounded-xl shadow-sm p-6">
                <div className="flex space-x-4 items-center">
                  <Library size={32}></Library>
                  <h1 className="font-bold">Studio</h1>
                </div>
              </div>
            </Link>
          </div>
          <div>
            <Link href={"/fill_forms"}>
              <div className="border-2 hover:bg-slate-300 hover:border-black hover:shadow-2xl rounded-xl shadow-sm p-6">
                <div className="flex space-x-4 items-center">
                  <ClipboardPenLine size={32}></ClipboardPenLine>
                  <h1 className="font-bold">Fill Forms</h1>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
