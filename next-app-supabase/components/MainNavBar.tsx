"use server";
import React from "react";
import { UserAvatar } from "./UserAvatar";
import Link from "next/link";
import { Library } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

interface MainNavBarProps {
  icon: React.ReactNode;
  links: Record<string, { label: string; href: string }>; // Array of link objects with labels and href
}

export const MainNavBar = async ({ icon, links }: MainNavBarProps) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <nav className="flex dark:border-slate-500 items-center w-full justify-between border-2 p-2 border-black rounded-2xl">
      <div className="space-x-8 flex items-center">
        {icon}
        <div className="space-x-4 mt-1 font-mo">
          {Object.entries(links).map(([key, { label, href }]) => (
            <Link key={key} href={href}>
              {label}
            </Link>
          ))}
        </div>
      </div>
      {user && <UserAvatar user={user} />}
      {/* <UserAvatar /> */}
    </nav>
  );
};
