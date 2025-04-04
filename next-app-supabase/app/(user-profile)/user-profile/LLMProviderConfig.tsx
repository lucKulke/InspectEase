"use client";

import type React from "react";

import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Brain, Cpu, Key, Save } from "lucide-react";
import { IUserProfile } from "@/lib/globalInterfaces";
import { User } from "@supabase/supabase-js";
import { updateUserProfileOpenAiToken } from "./actions";
import { UUID } from "crypto";
import { useNotification } from "@/app/context/NotificationContext";

interface LLMConfigPageProps {
  profileData: IUserProfile;
  setProfileData: React.Dispatch<SetStateAction<IUserProfile>>;
  user: User;
}

export const LLMConfigPage = ({
  profileData,
  user,
  setProfileData,
}: LLMConfigPageProps) => {
  const { showNotification } = useNotification();
  const { toast } = useToast();

  const [credentials, setCredentials] = useState({
    openai: profileData.openai_token ?? "",
    anthropic: "",
    cohere: "",
    mistral: "",
  });

  const handleChange = (provider: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [provider]: value,
    }));
  };

  const saveCredentials = async () => {
    // In a real app, you would securely store these credentials
    // This is just a demo implementation
    localStorage.setItem("llm-credentials", JSON.stringify(credentials));
    const { updatedProfile, updatedProfileError } =
      await updateUserProfileOpenAiToken(credentials.openai, user.id as UUID);
    if (updatedProfileError) {
      showNotification(
        "Update user profile",
        `Error: ${updatedProfileError.message} (${updatedProfileError.code})`,
        "error"
      );
    } else if (updatedProfile) {
      showNotification(
        "Update user profile",
        `Successfully updated user profile`,
        "info"
      );
      setCredentials((prev) => {
        prev.openai = updatedProfile.openai_token;
        return prev;
      });

      setProfileData((prev) => {
        prev.openai_token = updatedProfile.openai_token;
        return prev;
      });
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LLM Provider Configuration</h1>
        <p className="text-muted-foreground">
          Manage your API keys for different language model providers.
        </p>
      </div>

      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
          <TabsTrigger value="cohere">Cohere</TabsTrigger>
          <TabsTrigger value="mistral">Mistral</TabsTrigger>
        </TabsList>

        <TabsContent value="openai">
          <ProviderCard
            title="OpenAI"
            description="Configure your OpenAI API credentials"
            icon={Brain}
            value={credentials.openai}
            onChange={(value) => handleChange("openai", value)}
            onSave={saveCredentials}
          />
        </TabsContent>

        <TabsContent value="anthropic">
          <ProviderCard
            title="Anthropic"
            description="Configure your Anthropic API credentials"
            icon={Brain}
            value={credentials.anthropic}
            onChange={(value) => handleChange("anthropic", value)}
            onSave={saveCredentials}
          />
        </TabsContent>

        <TabsContent value="cohere">
          <ProviderCard
            title="Cohere"
            description="Configure your Cohere API credentials"
            icon={Cpu}
            value={credentials.cohere}
            onChange={(value) => handleChange("cohere", value)}
            onSave={saveCredentials}
          />
        </TabsContent>

        <TabsContent value="mistral">
          <ProviderCard
            title="Mistral AI"
            description="Configure your Mistral AI API credentials"
            icon={Cpu}
            value={credentials.mistral}
            onChange={(value) => handleChange("mistral", value)}
            onSave={saveCredentials}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ProviderCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

function ProviderCard({
  title,
  description,
  icon: Icon,
  value,
  onChange,
  onSave,
}: ProviderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor={`${title.toLowerCase()}-api-key`}>API Key</Label>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <Input
                id={`${title.toLowerCase()}-api-key`}
                type="password"
                placeholder="Enter your API key"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your API key is stored securely and never shared with third
              parties.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save {title} Credentials
        </Button>
      </CardFooter>
    </Card>
  );
}
