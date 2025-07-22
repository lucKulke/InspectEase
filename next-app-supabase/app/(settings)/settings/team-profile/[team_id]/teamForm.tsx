"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Key,
  Save,
  Settings,
  Shield,
  Trash2,
  Plus,
  Group,
  UserPlus,
  Mail,
  MoreVertical,
  Crown,
  User,
  Wrench,
  Blocks,
  PenLine,
  CircleCheck,
  CircleX,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LLMConfigPage } from "@/components/LLMProviderConfig";
import { SpeachToTextConfig } from "@/components/SeachToTextConfig";
import {
  IMemberRequestResponse,
  ITeamAndTeamMembers,
  ITeamMembershipsResponse,
  ITeamResponse,
  IUserProfileResponse,
} from "@/lib/database/public/publicInterface";
import { useNotification } from "@/app/context/NotificationContext";
import {
  addToTeam,
  deleteTeam,
  refetchTeamMembers,
  removeTeamMember,
  sendTeamInviteMail,
  updateMemberRoles,
  updateTeamAiTokens,
  updateTeamSettings,
  uploadTeamAvatar,
} from "./actions";
import { UUID } from "crypto";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { RoleType } from "@/lib/globalInterfaces";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { passwordCheck } from "@/lib/globalActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { v4 as uuidv4 } from "uuid";

export interface TeamSettings {
  name: string;
  description: string;
  require_two_factor: boolean;
}

interface TeamFormProps {
  currentMemberRequests: IMemberRequestResponse[] | null;
  teamAndMembers: ITeamAndTeamMembers;
  profilePictures: Record<UUID, string | undefined>;
  pictureUrl: string | undefined;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: RoleType[];
  avatar?: string;
  joinedAt: string;
  status: "disabled" | "active";
}

const roleIcons = {
  owner: Crown,
  builder: Blocks,
  filler: PenLine,
};

const roleColors = {
  owner: "bg-yellow-100 text-yellow-800 border-yellow-200",
  builder: "bg-blue-100 text-blue-800 border-blue-200",
  filler: "bg-green-100 text-green-800 border-green-200",
};

export const TeamForm = ({
  currentMemberRequests,
  teamAndMembers,
  profilePictures,
  pictureUrl,
}: TeamFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();

  const initialTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [userPassword, setUserPassword] = useState<string>("");

  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    name: teamAndMembers.name ?? "",
    description: teamAndMembers.description ?? "",
    require_two_factor: teamAndMembers.require_two_factor ?? false,
  });

  const [LLMCredentials, setLLMCredentials] = useState<{
    openai_token: string | null;
    anthropic_token: string | null;
    cohere_token: string | null;
    mistral_token: string | null;
  }>({
    openai_token: teamAndMembers.openai_token ?? null,
    anthropic_token: null,
    cohere_token: null,
    mistral_token: null,
  });

  const [speachToTextCredentials, setSpeachToTextCredentials] = useState<{
    deepgram_token: string | null;
    azure: string | null;
    google: string | null;
  }>({
    deepgram_token: teamAndMembers.deepgram_token ?? null,
    azure: null,
    google: null,
  });

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    const current = new URLSearchParams(Array.from(searchParams.entries())); // clone current params
    current.set("tab", tabValue); // update tab param
    const query = current.toString();
    router.push(`?${query}`); // update URL without full page reload
  };

  function checkIfSomeGeneralSettingsChanged() {
    return (
      teamAndMembers.name !== teamSettings.name ||
      teamAndMembers.description !== teamSettings.description
    );
  }
  function checkIfSomeSecuritySettingsChanged() {
    return (
      teamAndMembers.require_two_factor !== teamSettings.require_two_factor
    );
  }
  const handleSaveTeamSettings = async () => {
    const { updatedTeam, updatedTeamError } = await updateTeamSettings(
      teamSettings,
      teamAndMembers.id as UUID
    );
    if (updatedTeamError) {
      showNotification(
        "Update teams settings",
        `Error: ${updatedTeamError.message} (${updatedTeamError.code})`,
        "error"
      );
    } else if (updatedTeam) {
      showNotification(
        "Update teams settings",
        `Successfully updated teams settings`,
        "info"
      );
    }
    router.refresh();
  };

  const handleUpdateLLMAPICredentials = async (
    apiKeys: Record<string, string>
  ) => {
    const { updatedTeam, updatedTeamError } = await updateTeamAiTokens(
      apiKeys,
      teamAndMembers.id as UUID
    );
    if (updatedTeamError) {
      showNotification(
        "Update teams llm api keys",
        `Error: ${updatedTeamError.message} (${updatedTeamError.code})`,
        "error"
      );
    } else if (updatedTeam) {
      showNotification(
        "Update teams llm api keys",
        `Successfully updated teams api keys`,
        "info"
      );

      setLLMCredentials((prev) => ({ ...prev, ...apiKeys }));
    }
  };

  const handleUpdateSpeachToTextAPICredentials = async (
    apiKeys: Record<string, string>
  ) => {
    const { updatedTeam, updatedTeamError } = await updateTeamAiTokens(
      apiKeys,
      teamAndMembers.id as UUID
    );
    if (updatedTeamError) {
      showNotification(
        "Update teams speach to text api keys",
        `Error: ${updatedTeamError.message} (${updatedTeamError.code})`,
        "error"
      );
    } else if (updatedTeam) {
      showNotification(
        "Update teams speach to text api keys",
        `Successfully updated speach to text teams api keys`,
        "info"
      );

      setSpeachToTextCredentials((prev) => ({ ...prev, ...apiKeys }));
    }
  };

  const currentTeamMembers: TeamMember[] = [];
  if (teamAndMembers.team_memberships) {
    teamAndMembers.team_memberships.forEach((membership) => {
      if (membership.user_profile) {
        const teamMember: TeamMember = {
          id: membership.user_profile.user_id,
          name: membership.user_profile.first_name
            ? membership.user_profile.first_name +
              " " +
              membership.user_profile.last_name
            : membership.user_profile.email.split("@")[0],
          email: membership.user_profile.email,
          role: membership.role as RoleType[],
          joinedAt: membership.created_at as string,
          status: membership.disabled ? "disabled" : "active",
          avatar: profilePictures[membership.user_profile.user_id],
        };
        currentTeamMembers.push(teamMember);
      }
    });
  }

  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>(currentTeamMembers);
  const [memberRequests, setMemberRequests] = useState<
    IMemberRequestResponse[]
  >(currentMemberRequests ?? []); //memberRequests

  const [inviteForm, setInviteForm] = useState({
    email: "",
  });

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const handleInviteMember = async () => {
    const statusCode = await sendTeamInviteMail(
      teamAndMembers.name,
      inviteForm.email,
      teamAndMembers.id
    );

    if (statusCode === 200) {
      setIsInviteDialogOpen(false);
      showNotification("Invite member", "Successfully send invite", "info");
    } else {
      showNotification("Invite member", `Error: ${statusCode}`, "error");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const { deletedTeamMembership, deletedTeamMembershipError } =
      await removeTeamMember(memberId, teamAndMembers.id as UUID);

    console.log("deletedTeamMembership", deletedTeamMembership);

    if (deletedTeamMembershipError) {
      showNotification(
        "Remove member",
        `Error: ${deletedTeamMembershipError.message} (${deletedTeamMembershipError.code})`,
        "error"
      );
    } else if (deletedTeamMembership) {
      showNotification("Remove member", `Successfully removed member`, "info");
      setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    }
  };

  const handleRoleChange = async (memberId: string, roleToToggle: RoleType) => {
    console.log("handleRoleChange", memberId, roleToToggle);
    let newRoles: RoleType[] = [];
    const newMembers = teamMembers.map((member) => {
      if (member.id !== memberId) return member;

      const hasRole = member.role.includes(roleToToggle);
      const updatedRoles = hasRole
        ? member.role.filter((r) => r !== roleToToggle)
        : [...member.role, roleToToggle];
      newRoles = updatedRoles;
      return { ...member, role: updatedRoles };
    });

    const { updatedMembership, updatedMembershipError } =
      await updateMemberRoles(memberId, newRoles);
    if (updatedMembershipError) {
      showNotification(
        "Update member roles",
        `Error: ${updatedMembershipError.message} (${updatedMembershipError.code})`,
        "error"
      );
    } else if (updatedMembership) {
      showNotification(
        "Update member roles",
        `Successfully updated member roles`,
        "info"
      );
      setTeamMembers(newMembers);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAddToTeam = async (userId: string) => {
    const { teamMembership, teamMembershipError } = await addToTeam(
      teamAndMembers.id,
      userId
    );
    if (teamMembershipError) {
      showNotification(
        "Add member to team",
        `Error: ${teamMembershipError.message} (${teamMembershipError.code})`,
        "error"
      );
    } else if (teamMembership) {
      showNotification(
        "Add member to team",
        `Successfully added member to team`,
        "info"
      );
      console.log("teamMembership", teamMembership);
      const teamMember: TeamMember = {
        id: teamMembership.user_profile.user_id,
        name: teamMembership.user_profile.first_name
          ? teamMembership.user_profile.first_name +
            " " +
            teamMembership.user_profile.last_name
          : teamMembership.user_profile.email.split("@")[0],
        email: teamMembership.user_profile.email,
        role: teamMembership.role as RoleType[],
        joinedAt: teamMembership.created_at as string,
        status: teamMembership.disabled ? "disabled" : "active",
      };

      setTeamMembers([...teamMembers, teamMember]);

      setMemberRequests(
        memberRequests.filter(
          (memberRequest) => memberRequest.user_id !== userId
        )
      );
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [openAlertDialg, setOpenAlertDialg] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);

  const handleDeleteTeam = async () => {
    setIsDeleting(true);

    const passwordOk = await passwordCheck(userPassword);
    if (!passwordOk) {
      setIsDeleting(false);
      setInvalidPassword(true);
      return;
    }
    const { deletedTeam, deletedTeamError } = await deleteTeam(
      teamAndMembers.id
    );
    if (deletedTeamError) {
      showNotification(
        "Delete team",
        `Error: ${deletedTeamError.message} (${deletedTeamError.code})`,
        "error"
      );
    } else if (deletedTeam) {
      showNotification("Delete team", `Successfully deleted team`, "info");
      redirect("/user-profile/");
    }
  };

  const sortTeamMembers = (a: TeamMember, b: TeamMember) => {
    if (a.joinedAt < b.joinedAt) {
      return -1;
    }
    if (a.joinedAt > b.joinedAt) {
      return 1;
    }
    return 0;
  };

  const [avatarUrl, setAvatarUrl] = useState<string | null>(pictureUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("File too large (max 3MB).");
      return;
    }
    const fileExt = file.name.split(".").pop();
    const newFileName = uuidv4() + "." + fileExt;
    const { imageUrl, path } = await uploadTeamAvatar(
      file,
      newFileName,
      teamAndMembers.id as UUID
    );
    setAvatarUrl(imageUrl?.signedUrl ?? null);
    setUploading(false);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="space-y-6"
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          General
        </TabsTrigger>
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Group className="h-4 w-4" />
          Members
        </TabsTrigger>
        <TabsTrigger value="api-keys" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          API Keys
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={avatarUrl || "/placeholder.svg?height=80&width=80"}
              alt="Profile"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" disabled={uploading}>
              <label className="cursor-pointer">
                {uploading ? "Uploading..." : "Change avatar"}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              JPG, GIF or PNG. Max size of 3MB.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
            <CardDescription>Basic information about your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={teamSettings.name}
                  onChange={(e) =>
                    setTeamSettings({ ...teamSettings, name: e.target.value })
                  }
                  placeholder="Enter team name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={teamSettings.description}
                onChange={(e) =>
                  setTeamSettings({
                    ...teamSettings,
                    description: e.target.value,
                  })
                }
                placeholder="Describe your team's purpose"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSaveTeamSettings}
              disabled={!checkIfSomeGeneralSettingsChanged()}
              className="w-full mt-3 md:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Permanently delete this team and all of its data. This action
              cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={openAlertDialg} onOpenChange={setOpenAlertDialg}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                    This action cannot be undone. This will permanently delete
                    your team and remove all associated data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <Label htmlFor="password">Password (required)</Label>

                {invalidPassword && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Invalid credentails</AlertDescription>
                  </Alert>
                )}
                <Input
                  id="password"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpenAlertDialg(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteTeam}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? <p>Deleting...</p> : <p>Delete Team</p>}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="members" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription className="mt-2">
                  Manage your team members and their roles
                </CardDescription>
              </div>
              <Dialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your team
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm({
                          ...inviteForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsInviteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleInviteMember}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.sort(sortTeamMembers).map((member) => {
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{member.name}</h4>
                          {member.status === "disabled" && (
                            <Badge variant="outline" className="text-xs">
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined{" "}
                          {
                            new Date(member.joinedAt)
                              .toISOString()
                              .split("T")[0]
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-wrap gap-1">
                        {member.id === teamAndMembers.owner_id && (
                          <Badge
                            className={`${
                              roleColors["owner"] ?? ""
                            } border flex items-center gap-1`}
                          >
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                        {member.role?.map((role) => {
                          const Icon = roleIcons[role] || User;
                          return (
                            <Badge
                              key={role}
                              className={`${
                                roleColors[role] ?? ""
                              } border flex items-center gap-1`}
                            >
                              <Icon className="h-3 w-3" />
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                          );
                        })}
                      </div>
                      {
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(["builder", "filler"] as RoleType[]).map(
                              (roleOption) => (
                                <DropdownMenuItem
                                  key={roleOption}
                                  onClick={() =>
                                    handleRoleChange(member.id, roleOption)
                                  }
                                >
                                  {member.role?.includes(roleOption)
                                    ? "Remove"
                                    : "Add"}{" "}
                                  {roleOption.charAt(0).toUpperCase() +
                                    roleOption.slice(1)}
                                </DropdownMenuItem>
                              )
                            )}
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Member Requests</CardTitle>
            <CardDescription>
              member requests that can be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog></Dialog>
            <div className="space-y-4">
              {memberRequests?.map((request) => {
                return (
                  <div
                    key={request.team_id + request.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(request.email.split("@")[0])}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {request.email.split("@")[0]}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {request.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <div className="transform transition-transform duration-200 hover:scale-110 active:scale-95">
                            <CircleCheck className="text-green-500" />
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Do you realy want to add {request.email} to your
                              Team?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleAddToTeam(request.user_id)}
                            >
                              Add
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <div className="transform transition-transform duration-200 hover:scale-110 active:scale-95">
                            <CircleX className="text-red-500" />
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Do you realy want to decline the request from{" "}
                              {request.email} ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Reject</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="api-keys" className="space-y-6">
        <LLMConfigPage
          type="team"
          currentCredentials={LLMCredentials}
          updateAiTokens={handleUpdateLLMAPICredentials}
        ></LLMConfigPage>
        <SpeachToTextConfig
          type="team"
          currentCredentials={speachToTextCredentials}
          updateAiTokens={handleUpdateSpeachToTextAPICredentials}
        ></SpeachToTextConfig>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Configure security and access controls for your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  All team members must enable 2FA to access the team
                </p>
              </div>
              <Switch
                checked={teamSettings.require_two_factor}
                onCheckedChange={(checked) =>
                  setTeamSettings({
                    ...teamSettings,
                    require_two_factor: checked,
                  })
                }
              />
            </div>

            <Separator />

            <Button
              onClick={handleSaveTeamSettings}
              className="w-full md:w-auto"
              disabled={!checkIfSomeSecuritySettingsChanged()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
