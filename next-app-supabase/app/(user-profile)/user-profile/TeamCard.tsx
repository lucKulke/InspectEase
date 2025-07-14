"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, LogOut, Plus, Settings2, Users } from "lucide-react";
import {
  ITeamAndTeamMembers,
  ITeamResponse,
  IUserProfileResponse,
} from "@/lib/database/public/publicInterface";
import { useRouter } from "next/navigation";
import { createNewTeam, leaveTeam } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  role: "owner" | "member";
  avatar?: string;
}

interface TeamCardProps {
  profileData: IUserProfileResponse;
  teamsWithMembers: ITeamAndTeamMembers[] | null;
  teamPictureUrls: Map<string, string | undefined>;
}

export default function TeamCard({
  profileData,
  teamsWithMembers,
  teamPictureUrls,
}: TeamCardProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [teams, setTeams] = useState<ITeamAndTeamMembers[]>(
    teamsWithMembers || []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");

  const handleCreateTeam = async () => {
    const { newTeam, newTeamError } = await createNewTeam({
      name: newTeamName,
      description: newTeamDescription,
      owner_id: profileData.user_id,
    });
    if (newTeamError) {
      showNotification(
        "Creating new team",
        `Error: ${newTeamError.message}`,
        "error"
      );
    } else if (newTeam) {
      showNotification(
        "Creating new team",
        `Successfully created team ${newTeam.name}`,
        "info"
      );

      setTeams([...teams, newTeam]);
      setIsDialogOpen(false);
    }
  };

  const ownedTeams = teams.filter(
    (team) => team.owner_id === profileData.user_id
  );
  const memberTeams = teams.filter(
    (team) => team.owner_id !== profileData.user_id
  );

  const handleLeaveTeam = async (teamId: string) => {
    const { deletedTeamMembership, deletedTeamMembershipError } =
      await leaveTeam(teamId);
    if (deletedTeamMembershipError) {
      showNotification(
        "Leaving team",
        `Error: ${deletedTeamMembershipError.message}`,
        "error"
      );
    } else {
      showNotification("Leaving team", "Successfully left team", "info");
      setTeams(teams.filter((team) => team.id !== teamId));
    }
  };

  return (
    <Card className="w-full ">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Teams
            </CardTitle>
            <CardDescription>Teams you own and are a member of</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a new team and invite members to collaborate.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team-description">
                    Description (Optional)
                  </Label>
                  <Input
                    id="team-description"
                    placeholder="Brief description of the team"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim()}
                >
                  Create Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Owned Teams */}
        {ownedTeams.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              Teams You Own ({ownedTeams.length})
            </h3>
            <div className="space-y-3">
              {ownedTeams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => router.push(`/team-profile/${team.id}`)}
                  className="flex items-center cursor-pointer justify-between p-3 rounded-lg border-2 border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={teamPictureUrls.get(team.id) || "/placeholder.svg"}
                        alt={team.name}
                      />
                      <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{team.name}</h4>
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 border-amber-300"
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {team.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {team.team_memberships.length}
                    </p>
                    <p className="text-xs text-muted-foreground">members</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member Teams */}
        {memberTeams.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams You're In ({memberTeams.length})
            </h3>
            <div className="space-y-3">
              {memberTeams.map((team) => (
                <ContextMenu key={team.id}>
                  <ContextMenuTrigger>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              teamPictureUrls.get(team.id) || "/placeholder.svg"
                            }
                            alt={team.name}
                          />
                          <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{team.name}</h4>
                            <Badge variant="outline">Member</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {team.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {team.team_memberships.length}
                        </p>
                        <p className="text-xs text-muted-foreground">members</p>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      className="flex justify-between"
                      onClick={() => handleLeaveTeam(team.id)}
                    >
                      <p>Leave</p>
                      <LogOut className="text-red-500" size={20} />
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          </div>
        )}

        {teams.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No teams yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first team to start collaborating with others.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Team
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
