"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export const BackHomeButton = () => {
  const pathname = usePathname();
  const supabase = createClient();

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <div className="flex justify-between">
      <Link href="/">
        {pathname !== "/" && <p className="text-slate-600">Back Home</p>}
      </Link>
    </div>
  );
};
