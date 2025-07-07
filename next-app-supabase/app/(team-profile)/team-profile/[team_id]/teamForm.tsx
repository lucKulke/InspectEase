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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LLMConfigPage } from "@/components/LLMProviderConfig";
import { SpeachToTextConfig } from "@/components/SeachToTextConfig";
import { ITeamResponse } from "@/lib/database/public/publicInterface";

interface TeamSettings {
  name: string;
  description: string;
  slug: string;
  emailDomain: string;
  allowPublicProjects: boolean;
  requireTwoFactor: boolean;
}

interface TeamFormProps {
  team: ITeamResponse;
}

export const TeamForm = ({ team }: TeamFormProps) => {
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    name: team.name ?? "",
    description: team.description ?? "",
    slug: "acme-corp",
    emailDomain: "acme.com",
    allowPublicProjects: true,
    requireTwoFactor: false,
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
    deepgram_token: profile.deepgram_token ?? null,
    azure: null,
    google: null,
  });

  const handleSaveTeamSettings = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Settings saved",
      description: "Team settings have been updated successfully.",
    });
  };

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          General
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
              <div className="space-y-2">
                <Label htmlFor="team-slug">Team Slug</Label>
                <Input
                  id="team-slug"
                  value={teamSettings.slug}
                  onChange={(e) =>
                    setTeamSettings({ ...teamSettings, slug: e.target.value })
                  }
                  placeholder="team-slug"
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

            <div className="space-y-2">
              <Label htmlFor="email-domain">Email Domain</Label>
              <Input
                id="email-domain"
                value={teamSettings.emailDomain}
                onChange={(e) =>
                  setTeamSettings({
                    ...teamSettings,
                    emailDomain: e.target.value,
                  })
                }
                placeholder="company.com"
              />
              <p className="text-sm text-muted-foreground">
                Users with this email domain can join the team automatically
              </p>
            </div>

            <Button
              onClick={handleSaveTeamSettings}
              className="w-full md:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="api-keys" className="space-y-6">
        <LLMConfigPage
          currentCredentials={LLMCredentials}
          updateAiTokens={handleUpdateLLMAPICredentials}
        ></LLMConfigPage>
        <SpeachToTextConfig
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
                <Label>Allow Public Projects</Label>
                <p className="text-sm text-muted-foreground">
                  Team members can create public projects visible to everyone
                </p>
              </div>
              <Switch
                checked={teamSettings.allowPublicProjects}
                onCheckedChange={(checked) =>
                  setTeamSettings({
                    ...teamSettings,
                    allowPublicProjects: checked,
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  All team members must enable 2FA to access the team
                </p>
              </div>
              <Switch
                checked={teamSettings.requireTwoFactor}
                onCheckedChange={(checked) =>
                  setTeamSettings({
                    ...teamSettings,
                    requireTwoFactor: checked,
                  })
                }
              />
            </div>

            <Separator />

            <Button
              onClick={handleSaveTeamSettings}
              className="w-full md:w-auto"
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
