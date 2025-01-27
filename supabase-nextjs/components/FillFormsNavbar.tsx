import React from "react";
import { ClipboardPenLine } from "lucide-react";
import { fillFormsLinks } from "@/lib/links";
import Link from "next/link";

import UserAvatar from "./UserAvatar";

const FillFormsNavbar = () => {
  return (
    <nav className="flex items-center w-full justify-between border-2 p-2 rounded-2xl">
      <Link href={"/fill_forms"}>
        <div className="flex space-x-2 items-center">
          <ClipboardPenLine size={32}></ClipboardPenLine>
        </div>
      </Link>
      <div className="space-x-11">
        {fillFormsLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            {link.name}
          </Link>
        ))}
      </div>

      <UserAvatar />
    </nav>
  );
};

export default FillFormsNavbar;
