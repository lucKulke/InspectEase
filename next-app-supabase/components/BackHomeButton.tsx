"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
//import { createClient } from "@/utils/supabase/client";

export const BackHomeButton = () => {
  const pathname = usePathname();

  return (
    <div className="flex justify-between">
      <Link href="/">
        {pathname !== "/" && (
          <div className="mt-4 ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors duration-200">
            <Wrench className="w-5 h-5"></Wrench>
          </div>
        )}
      </Link>
    </div>
  );
};
