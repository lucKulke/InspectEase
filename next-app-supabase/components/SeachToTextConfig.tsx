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
import { Brain, Cpu, Key, Lock, Save } from "lucide-react";
import { IUserProfile } from "@/lib/globalInterfaces";

import { UUID } from "crypto";
import { useNotification } from "@/app/context/NotificationContext";
import { AzureOpenAI } from "openai";
import { User } from "@supabase/supabase-js";

interface SpeachToTextConfigProps {
  type?: "team" | "user";
  currentCredentials: {
    deepgram_token: string | null;
    azure: string | null;
    google: string | null;
  };

  updateAiTokens: (aiTokens: Record<string, string>) => Promise<void>;
}

export const SpeachToTextConfig = ({
  type = "user",
  currentCredentials,
  updateAiTokens,
}: SpeachToTextConfigProps) => {
  const { showNotification } = useNotification();
  const { toast } = useToast();

  const [credentials, setCredentials] = useState({
    deepgram: currentCredentials.deepgram_token ?? "",
    azure: "",
    google: "",
  });

  const handleChange = (provider: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [provider]: value,
    }));
  };

  const saveCredentials = async (id: string) => {
    const newToken: Record<string, string> = {};
    switch (id) {
      case "deepgram":
        newToken["deepgram_token"] = credentials.deepgram;
        break;
    }
    // In a real app, you would securely store these credentials
    // This is just a demo implementation
    await updateAiTokens(newToken);
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Speach to Text Provider Configuration
        </h1>
        <p className="text-muted-foreground">
          Manage {type} API keys for different speach to text model providers.
        </p>
      </div>

      <Tabs defaultValue="deepgram" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="deepgram">Deepgram</TabsTrigger>
        </TabsList>

        <TabsContent value="deepgram">
          <ProviderCard
            id="deepgram"
            title="Deepgram"
            description={`Configure ${type} Deepgram credentials`}
            icon={Brain}
            value={credentials.deepgram}
            onChange={(value) => handleChange("deepgram", value)}
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
