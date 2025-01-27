"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const BackHomeButton = () => {
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
    <div>
      <Link href="/">
        {pathname !== "/" && <p className="text-slate-600">Back Home</p>}
      </Link>
    </div>
  );
};

export default BackHomeButton;
