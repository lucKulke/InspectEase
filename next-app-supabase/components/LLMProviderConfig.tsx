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

interface LLMConfigPageProps {
  currentCredentials: {
    openai_token: string | null;
    anthropic_token: string | null;
    cohere_token: string | null;
    mistral_token: string | null;
  };

  updateAiTokens: (apiKeys: Record<string, string>) => Promise<void>;
}

export const LLMConfigPage = ({
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

  const saveCredentials = async (id: string) => {
    const newApiKeys: Record<string, string> = {};
    switch (id) {
      case "deepgram":
        newApiKeys["openai_token"] = credentials.openai;
        break;
    }
    // In a real app, you would securely store these credentials
    // This is just a demo implementation

    await updateAiTokens(newApiKeys);
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
            id="openai"
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
            id="anthropic"
            disabled={true}
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
            id="cohere"
            disabled={true}
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
            id="mistral"
            disabled={true}
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
  id: string;
  disabled?: boolean;
  description: string;
  icon: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  onSave: (value: string) => void;
}

function ProviderCard({
  id,
  title,
  description,
  icon: Icon,
  value,
  onChange,
  onSave,
  disabled = false,
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
        <Button
          onClick={() => onSave(id)}
          disabled={disabled}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {disabled ? (
            <p>Not supported yet...</p>
          ) : (
            <p>Save {title} Credentials</p>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
