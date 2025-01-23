"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";

const UserAvatar = () => {
  const [userEmail, setUserEmail] = useState<string>();
  const getUsersEmail = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserEmail(user?.email);
  };

  useEffect(() => {
    getUsersEmail();
  }, []);

  return (
    <div className="flex items-center space-x-3">
      <h1 className="text-sm">{userEmail}</h1>
      <Avatar>
        {userEmail && (
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        )}

        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserAvatar;
