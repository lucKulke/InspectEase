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

import { UUID } from "crypto";
import { useNotification } from "@/app/context/NotificationContext";
import Image from "next/image";

interface LLMConfigPageProps {
  type?: "team" | "user";
  currentCredentials: {
    openai_token: string | null;
    anthropic_token: string | null;
    cohere_token: string | null;
    mistral_token: string | null;
  };

  updateAiTokens: (apiKeys: Record<string, string>) => Promise<void>;
}

export const LLMConfigPage = ({
  type = "user",
  currentCredentials,
  updateAiTokens,
}: LLMConfigPageProps) => {
  const { showNotification } = useNotification();
  const { toast } = useToast();

  const [credentials, setCredentials] = useState({
    openai: currentCredentials.openai_token ?? "",
    anthropic: currentCredentials.anthropic_token ?? "",
    cohere: currentCredentials.cohere_token ?? "",
    mistral: currentCredentials.mistral_token ?? "",
  });

  const handleChange = (provider: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [provider]: value,
    }));
  };

  function checkIfCredentialsHaveChanged() {
    return (
      credentials.openai !== currentCredentials.openai_token ||
      credentials.anthropic !== currentCredentials.anthropic_token ||
      credentials.cohere !== currentCredentials.cohere_token ||
      credentials.mistral !== currentCredentials.mistral_token
    );
  }

  const saveCredentials = async (id: string) => {
    const newApiKeys: Record<string, string> = {};
    switch (id) {
      case "openai":
        newApiKeys["openai_token"] = credentials.openai;
        break;
    }
    // In a real app, you would securely store these credentials
    // This is just a demo implementation

    await updateAiTokens(newApiKeys);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Provider Configuration</CardTitle>
        <CardDescription>
          Manage {type} API keys for different language model providers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
            <TabsTrigger value="cohere">Cohere</TabsTrigger>
            <TabsTrigger value="mistral">Mistral</TabsTrigger>
          </TabsList>

          <TabsContent value="openai">
            <ProviderCard
              id="openai"
              title="OpenAI"
              description={`Configure ${type} OpenAI API credentials`}
              disabled={credentials.openai === currentCredentials.openai_token}
              iconPath={"/openai.svg"}
              value={credentials.openai}
              onChange={(value) => handleChange("openai", value)}
              onSave={saveCredentials}
            />
          </TabsContent>

          <TabsContent value="anthropic">
            <ProviderCard
              id="anthropic"
              disabled={true}
              unsupported={true}
              title="Anthropic"
              description={`Configure ${type} Anthropic API credentials`}
              iconPath={"/anthropic.svg"}
              value={credentials.anthropic}
              onChange={(value) => handleChange("anthropic", value)}
              onSave={saveCredentials}
            />
          </TabsContent>

          <TabsContent value="cohere">
            <ProviderCard
              id="cohere"
              disabled={true}
              unsupported={true}
              title="Cohere"
              description={`Configure ${type} Cohere API credentials`}
              iconPath={"/cohere.png"}
              value={credentials.cohere}
              onChange={(value) => handleChange("cohere", value)}
              onSave={saveCredentials}
            />
          </TabsContent>

          <TabsContent value="mistral">
            <ProviderCard
              id="mistral"
              disabled={true}
              unsupported={true}
              title="Mistral AI"
              description={`Configure ${type} Mistral AI API credentials`}
              iconPath={"/mistral.png"}
              value={credentials.mistral}
              onChange={(value) => handleChange("mistral", value)}
              onSave={saveCredentials}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ProviderCardProps {
  title: string;
  id: string;
  disabled?: boolean;
  unsupported?: boolean;
  description: string;
  iconPath: string;
  value: string;
  onChange: (value: string) => void;
  onSave: (value: string) => void;
}

function ProviderCard({
  id,
  title,
  description,
  iconPath,
  value,
  onChange,
  onSave,
  disabled = false,
  unsupported = false,
}: ProviderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Image src={iconPath} alt="logo" width={24} height={24} />
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
        <Button
          onClick={() => onSave(id)}
          disabled={disabled}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {unsupported ? (
            <p>Not supported yet...</p>
          ) : (
            <p>Save {title} Credentials</p>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
