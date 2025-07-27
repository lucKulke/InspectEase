"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { uploadAvatar } from "./actions";
import { v4 as uuidv4 } from "uuid";
import { useNotification } from "@/app/context/NotificationContext";
import { IUserProfileResponse } from "@/lib/database/public/publicInterface";
import { UUID } from "crypto";
import { updateUserProfile } from "./actions";

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
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileCompProps {
  profileData: IUserProfileResponse;
  pictureUrl: string | undefined;
}

export const PersonalComp = ({ profileData, pictureUrl }: ProfileCompProps) => {
  const { showNotification } = useNotification();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(pictureUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<IUserProfileResponse>(profileData);

  const [values, setValues] = useState<ProfileFormValues>({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    email: profile.email ?? "",
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values,
    mode: "onChange",
  });
  async function onProfileSubmit(data: ProfileFormValues) {
    // Check if any changes were made
    const hasChanges =
      data.first_name !== profile.first_name ||
      data.last_name !== profile.last_name ||
      data.email !== profile.email;

    if (!hasChanges) {
      alert("No changes detected.");
      return;
    }

    // Update the user's profile in Supabase
    // Ensure this matches your database structure
    const { updatedProfile, updatedProfileError } = await updateUserProfile(
      data,
      profile.user_id as UUID
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      alert("File too large (max 1MB).");
      return;
    }
    const fileExt = file.name.split(".").pop();
    const newFileName = uuidv4() + "." + fileExt;
    const { imageUrl, path } = await uploadAvatar(
      file,
      newFileName,
      profile.user_id as UUID
    );
    setAvatarUrl(imageUrl?.signedUrl ?? null);
    setUploading(false);
  };

  return (
    <div>
      <div className="flex items-center mb-4 gap-4">
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
            JPG, GIF or PNG. Max size of 1MB.
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
    </div>
  );
};
