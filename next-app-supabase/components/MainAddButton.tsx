"use client";

import Link from "next/link";
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
interface MainAddButtonProps {
  href: string;
}

export const MainAddButton = ({ href }: MainAddButtonProps) => {
  const router = useRouter();
  return (
    <Button onClick={() => router.push(href)}>
      <Plus size={20} /> Create
    </Button>
  );
};
