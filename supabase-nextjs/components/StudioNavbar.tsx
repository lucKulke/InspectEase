import React from "react";
import { Library } from "lucide-react";
import { studioLinks } from "@/lib/links";
import Link from "next/link";

import UserAvatar from "./UserAvatar";

const StudioNavbar = () => {
  return (
    <nav className="flex items-center w-full justify-between border-2 p-2 rounded-2xl">
      <Link href={"/studio"}>
        <div className="flex space-x-2">
          <Library size={32}></Library>
        </div>
      </Link>
      <div className="space-x-11">
        {studioLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            {link.name}
          </Link>
        ))}
      </div>

      <UserAvatar />
    </nav>
  );
};

export default StudioNavbar;
