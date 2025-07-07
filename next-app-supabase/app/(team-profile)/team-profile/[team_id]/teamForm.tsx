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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LLMConfigPage } from "@/components/LLMProviderConfig";
import { SpeachToTextConfig } from "@/components/SeachToTextConfig";
import { ITeamResponse } from "@/lib/database/public/publicInterface";
import { useNotification } from "@/app/context/NotificationContext";
import { updateTeamAiTokens, updateTeamSettings } from "./actions";
import { UUID } from "crypto";
import { useRouter } from "next/navigation";
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

export interface TeamSettings {
  name: string;
  description: string;
  require_two_factor: boolean;
}

interface TeamFormProps {
  team: ITeamResponse;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "builder" | "filler";
  avatar?: string;
  joinedAt: string;
  status: "active" | "pending";
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

export const TeamForm = ({ team }: TeamFormProps) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    name: team.name ?? "",
    description: team.description ?? "",
    require_two_factor: team.require_two_factor ?? false,
  });

  const [LLMCredentials, setLLMCredentials] = useState<{
    openai_token: string | null;
    anthropic_token: string | null;
    cohere_token: string | null;
    mistral_token: string | null;
  }>({
    openai_token: team.openai_token ?? null,
    anthropic_token: null,
    cohere_token: null,
    mistral_token: null,
  });

  const [speachToTextCredentials, setSpeachToTextCredentials] = useState<{
    deepgram_token: string | null;
    azure: string | null;
    google: string | null;
  }>({
    deepgram_token: team.deepgram_token ?? null,
    azure: null,
    google: null,
  });

  function checkIfSomeGeneralSettingsChanged() {
    return (
      team.name !== teamSettings.name ||
      team.description !== teamSettings.description
    );
  }
  function checkIfSomeSecuritySettingsChanged() {
    return team.require_two_factor !== teamSettings.require_two_factor;
  }
  const handleSaveTeamSettings = async () => {
    const { updatedTeam, updatedTeamError } = await updateTeamSettings(
      teamSettings,
      team.id as UUID
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
      team.id as UUID
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
      team.id as UUID
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

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedAt: "2024-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "builder",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedAt: "2024-02-01",
      status: "active",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "filler",
      joinedAt: "2024-02-15",
      status: "pending",
    },
  ]);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member" as TeamMember["role"],
  });

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const handleInviteMember = () => {
    if (!inviteForm.email) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    // Check if member already exists
    const existingMember = teamMembers.find(
      (member) => member.email === inviteForm.email
    );
    if (existingMember) {
      toast({
        title: "Error",
        description: "This user is already a team member.",
        variant: "destructive",
      });
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteForm.email.split("@")[0],
      email: inviteForm.email,
      role: inviteForm.role,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteForm({ email: "", role: "filler" });
    setIsInviteDialogOpen(false);

    toast({
      title: "Invitation sent",
      description: `Invitation sent to ${inviteForm.email}`,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    toast({
      title: "Member removed",
      description: "Team member has been removed successfully.",
    });
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember["role"]) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
    toast({
      title: "Role updated",
      description: "Member role has been updated successfully.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          General
        </TabsTrigger>
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Group className="h-4 w-4"></Group>
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
      </TabsContent>
      <TabsContent value="members" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
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
                  <div className="space-y-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select
                        value={inviteForm.role}
                        onValueChange={(value: TeamMember["role"]) =>
                          setInviteForm({ ...inviteForm, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="builder">Builder</SelectItem>
                          <SelectItem value="filler">Filler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
              {teamMembers.map((member) => {
                const RoleIcon = roleIcons[member.role];
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
                          {member.status === "pending" && (
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined{" "}
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${roleColors[member.role]} border`}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </Badge>
                      {member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.id, "builder")
                              }
                              disabled={member.role === "builder"}
                            >
                              Make Builder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.id, "filler")
                              }
                              disabled={member.role === "filler"}
                            >
                              Make Filler
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
