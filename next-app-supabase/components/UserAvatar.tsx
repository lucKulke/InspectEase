"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";

import Link from "next/link";

interface UserAvatarProps {
  user: User;
}

export const UserAvatar = ({ user }: UserAvatarProps) => {
  return (
    <div className="flex items-center space-x-3">
      <h1 className="text-sm">{user.email}</h1>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Avatar>
            {user && (
              <>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />

                <AvatarFallback>
                  {user.email && <p>{user?.email[0].toLocaleUpperCase()}</p>}
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={"/user-profile/" + user.id}>Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
