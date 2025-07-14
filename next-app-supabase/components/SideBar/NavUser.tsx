"use client";

import { ChevronsUpDown, LogOut, PenIcon as UserPen } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import type {
  ITeamResponse,
  IUserProfileResponse,
} from "@/lib/database/public/publicInterface";
import { TeamSwitcher } from "./TeamSwitcher";
import { switchActiveTeam } from "@/lib/globalActions";
import { UUID } from "crypto";
import { usePathname } from "next/navigation";

export function NavUser({
  user,
  profile,
  teams,
  profilePicture,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  profilePicture: string | undefined;
  profile: IUserProfileResponse | null;
  teams: ITeamResponse[] | null;
}) {
  const { isMobile } = useSidebar();

  const pathname = usePathname();

  const handleTeamChange = async (team: ITeamResponse | null) => {
    console.log("Selected team:", team);
    if (!profile) return;

    const { updatedProfile, updatedProfileError } = await switchActiveTeam(
      profile?.user_id,
      team ? (team.id as UUID) : null
    );

    if (updatedProfile) {
      // Trigger a full page reload
      if (pathname.includes("/form-filler")) {
        window.location.href = "/form-filler"; // full reload
      } else {
        window.location.href = "/form-builder"; // full reload
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Team Switcher */}
      <TeamSwitcher
        userId={user.id}
        teams={teams}
        onTeamChange={handleTeamChange}
        activeTeam={
          teams?.find((team) => team?.id === profile?.active_team_id) ?? null
        }
      />

      {/* User Menu */}
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={profilePicture} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {(user.email[0] + user.email[2]).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {(user.email[0] + user.email[2]).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href={"/user-profile"}>
                  <DropdownMenuItem>
                    <UserPen />
                    Profile
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <form action="/auth/signout" method="POST">
                <button type="submit" className="w-full">
                  <DropdownMenuItem className="w-full">
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
