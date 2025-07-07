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
import { useNotification } from "@/app/context/NotificationContext";
import { updateTeamAiTokens, updateTeamSettings } from "./actions";
import { UUID } from "crypto";
import { useRouter } from "next/navigation";

export interface TeamSettings {
  name: string;
  description: string;
  require_two_factor: boolean;
}

interface TeamFormProps {
  team: ITeamResponse;
}

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
