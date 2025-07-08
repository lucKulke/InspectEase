"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Bell, Brain, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LLMConfigPage } from "@/components/LLMProviderConfig";
import { User as SupbaseUser } from "@supabase/supabase-js";
import { IUserProfile } from "@/lib/globalInterfaces";
import { updateUserProfile, updateUserProfileAiTokens } from "./actions";
import { UUID } from "crypto";
import { useNotification } from "@/app/context/NotificationContext";
import { SpeachToTextConfig } from "@/components/SeachToTextConfig";
import { set } from "date-fns";
import {
  IUserApiKeysResponse,
  IUserProfileResponse,
} from "@/lib/database/public/publicInterface";

const profileFormSchema = z.object({
  first_name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  last_name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  email: z
    .string()
    .min(1, { message: "This field is required." })
    .email("This is not a valid email."),
});

const securityFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;

// This can come from your database or API.

interface ProfileFormProps {
  profileData: IUserProfileResponse;
  user: SupbaseUser;
  userApiKeys: IUserApiKeysResponse;
}

export const ProfileForm = ({
  profileData,
  user,
  userApiKeys,
}: ProfileFormProps) => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState<IUserProfileResponse>(profileData);

  const [values, setValues] = useState<ProfileFormValues>({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    email: user.email ?? "",
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values,
    mode: "onChange",
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const [LLMCredentials, setLLMCredentials] = useState<{
    openai_token: string | null;
    anthropic_token: string | null;
    cohere_token: string | null;
    mistral_token: string | null;
  }>({
    openai_token: userApiKeys.openai_token ?? null,
    anthropic_token: null,
    cohere_token: null,
    mistral_token: null,
  });

  const [speachToTextCredentials, setSpeachToTextCredentials] = useState<{
    deepgram_token: string | null;
    azure: string | null;
    google: string | null;
  }>({
    deepgram_token: userApiKeys.deepgram_token ?? null,
    azure: null,
    google: null,
  });

  async function onProfileSubmit(data: ProfileFormValues) {
    // Check if any changes were made
    const hasChanges =
      data.first_name !== profile.first_name ||
      data.last_name !== profile.last_name ||
      data.email !== user.email;

    if (!hasChanges) {
      alert("No changes detected.");
      return;
    }

    // Update the user's profile in Supabase
    // Ensure this matches your database structure
    const { updatedProfile, updatedProfileError } = await updateUserProfile(
      data,
      user.id as UUID
    );

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

      setValues((prev) => {
        prev.first_name = updatedProfile.first_name;
        prev.last_name = updatedProfile.last_name;
        return prev;
      });
    }
  }

  function onSecuritySubmit(data: SecurityFormValues) {
    // In a real app, you would send this data to your backend
    console.log(data);
    // Show success message
    alert("Password updated successfully!");
    // Reset form
    securityForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  const handleUpdateLLMAPICredentials = async (
    apiKeys: Record<string, string>
  ) => {
    const { updatedProfile, updatedProfileError } =
      await updateUserProfileAiTokens(apiKeys, user.id as UUID);
    if (updatedProfileError) {
      showNotification(
        "Update users llm api keys",
        `Error: ${updatedProfileError.message} (${updatedProfileError.code})`,
        "error"
      );
    } else if (updatedProfile) {
      showNotification(
        "Update users llm api keys",
        `Successfully updated users api keys`,
        "info"
      );

      setLLMCredentials((prev) => ({ ...prev, ...apiKeys }));
    }
  };

  const handleUpdateSpeachToTextAPICredentials = async (
    apiKeys: Record<string, string>
  ) => {
    const { updatedProfile, updatedProfileError } =
      await updateUserProfileAiTokens(apiKeys, user.id as UUID);
    if (updatedProfileError) {
      showNotification(
        "Update users speach to text api keys",
        `Error: ${updatedProfileError.message} (${updatedProfileError.code})`,
        "error"
      );
    } else if (updatedProfile) {
      showNotification(
        "Update users speach to text api keys",
        `Successfully updated speach to text users api keys`,
        "info"
      );

      setSpeachToTextCredentials((prev) => ({ ...prev, ...apiKeys }));
    }
  };

  return (
    <Tabs
      defaultValue="personal"
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-6"
    >
      <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
        <TabsTrigger value="personal" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Personal</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="aiApi" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">AI API</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src="/placeholder.svg?height=80&width=80"
              alt="Profile"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              Change avatar
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              JPG, GIF or PNG. Max size of 3MB.
            </p>
          </div>
        </div>

        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the
                  site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={true}
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">Save changes</Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <Form {...securityForm}>
          <form
            onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you'll be logged out.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={securityForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={securityForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={securityForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">Update password</Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        <Card>
          <CardHeader>
            <CardTitle>Two-factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account by enabling
              two-factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-medium">Authenticator app</h3>
                <p className="text-sm text-muted-foreground">
                  Use an authenticator app to get two-factor authentication
                  codes when prompted.
                </p>
              </div>
              <Button variant="outline">Set up</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-medium">Text message</h3>
                <p className="text-sm text-muted-foreground">
                  We'll send a code to your phone when you sign in.
                </p>
              </div>
              <Button variant="outline">Set up</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-base">Comments</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive emails when someone comments on your posts.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-base">Mentions</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive emails when someone mentions you.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-base">Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive emails for product updates and announcements.
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Push Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-base">Comments</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications when someone comments on your
                      posts.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-base">Mentions</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications when someone mentions you.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-base">Direct messages</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications when you receive a direct
                      message.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Save preferences</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="aiApi" className="space-y-6">
        <LLMConfigPage
          currentCredentials={LLMCredentials}
          updateAiTokens={handleUpdateLLMAPICredentials}
        ></LLMConfigPage>
        <SpeachToTextConfig
          currentCredentials={speachToTextCredentials}
          updateAiTokens={handleUpdateSpeachToTextAPICredentials}
        ></SpeachToTextConfig>
      </TabsContent>
    </Tabs>
  );
};
