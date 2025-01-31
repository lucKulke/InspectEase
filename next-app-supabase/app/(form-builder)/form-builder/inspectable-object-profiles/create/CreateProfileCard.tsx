"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useNotification } from "@/app/context/NotificationContext";
import { IconSelector } from "../../../../../components/IconSelector";
import { IconType } from "@/lib/availableIcons";
import { createInspectableObjectProfile } from "./actions";
import { redirect } from "next/navigation";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

type MetadataFormValues = z.infer<typeof profileSchema>;

export const CreateProfileCard = () => {
  const { showNotification } = useNotification();

  const [iconKey, setIconKey] = useState<IconType>("default");

  const onIconSelect = (key: IconType) => {
    setIconKey(key);
  };

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(formData: MetadataFormValues) {
    const { inspectableObjectProfile, inspectableObjectProfileError } =
      await createInspectableObjectProfile({
        name: formData.name,
        description: formData.description,
        icon_key: iconKey,
      });

    if (inspectableObjectProfileError) {
      showNotification(
        "Create Profile",
        `Error: ${inspectableObjectProfileError.message} (${inspectableObjectProfileError.code})`,
        "error"
      );
      return;
    }

    const profileId = inspectableObjectProfile.id;

    showNotification(
      "Create Profile",
      `Successfully created profile with id '${profileId}'`,
      "info"
    );
    redirect(
      formBuilderLinks["inspectableObjectProfiles"].href + "/" + profileId
    );
  }

  return (
    <Card className="w-1/2">
      <div className="flex justify-between items-center">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Enter the profiles name and description.
          </CardDescription>
        </CardHeader>
        <IconSelector onSelect={onIconSelect} currentIcon={iconKey} />
      </div>
      <CardContent className="space-y-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Car" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the Profile (e.g. Vehicle)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. This profile includes all cars"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The description of the profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center mt-5">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
