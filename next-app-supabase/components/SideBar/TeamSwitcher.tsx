"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Plus, Settings, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ITeamResponse } from "@/lib/database/public/publicInterface";
import { getTeamsSvgUrl } from "./actions";
import { Button } from "../ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { redirect } from "next/navigation";

export function TeamSwitcher({
  userId,
  teams,
  activeTeam,
  onTeamChange,
}: {
  userId: string;
  teams: ITeamResponse[] | null;
  activeTeam: ITeamResponse | null;
  onTeamChange: (team: ITeamResponse | null) => void;
}) {
  const { isMobile } = useSidebar();
  const [selectedTeam, setSelectedTeam] = useState<ITeamResponse | null>(
    activeTeam
  );
  const [svgUrl, setSvgUrl] = useState<string | null>(null);

  const handleTeamSelect = (team: ITeamResponse | null) => {
    setSelectedTeam(team);
    onTeamChange(team);
  };

  if (!teams || teams.length === 0) {
    return null;
  }

  const fetchTeamSvg = async () => {
    if (!selectedTeam?.picture_id) {
      setSvgUrl(null);
      return;
    }
    const { publicUrl } = await getTeamsSvgUrl(selectedTeam.picture_id);

    setSvgUrl(publicUrl);
  };

  useEffect(() => {
    fetchTeamSvg();
  }, []);

  useEffect(() => {
    fetchTeamSvg();
  }, [selectedTeam]);

  const visitTeamSettings = (team: ITeamResponse) => {
    redirect(`/team-profile/${team.id}`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                <Avatar className="h-6 w-6">
                  {svgUrl ? (
                    <AvatarImage
                      src={svgUrl}
                      alt={selectedTeam?.name || "Team"}
                    />
                  ) : (
                    <AvatarImage
                      src={"/team.svg"}
                      alt={selectedTeam?.name || "Team"}
                    />
                  )}

                  <AvatarFallback className="text-xs">
                    {selectedTeam?.name?.charAt(0).toUpperCase() || "T"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selectedTeam?.name || "Select Team"}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {teams.length} team{teams.length !== 1 ? "s" : ""}
                </span>
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
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
              <p>Teams</p>
              <Button variant="ghost" onClick={() => handleTeamSelect(null)}>
                <X></X>
              </Button>
            </DropdownMenuLabel>
            {teams.map((team) => (
              <ContextMenu key={team.id}>
                <ContextMenuTrigger>
                  <DropdownMenuItem
                    onClick={() => handleTeamSelect(team)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Avatar className="h-4 w-4">
                        <AvatarImage
                          src={team.picture_id || undefined}
                          alt={team.name}
                        />
                        <AvatarFallback className="text-xs">
                          {team.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{team.name}</div>
                      {team.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {team.description}
                        </div>
                      )}
                    </div>
                    {selectedTeam?.id === team.id && (
                      <Check className="size-4" />
                    )}
                  </DropdownMenuItem>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    disabled={team.owner_id !== userId}
                    className="flex justify-between"
                    onClick={() =>
                      team.owner_id === userId && visitTeamSettings(team)
                    }
                  >
                    Settings <Settings size={18}></Settings>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
