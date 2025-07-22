"use client";

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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

export const NotificationComp = () => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};
