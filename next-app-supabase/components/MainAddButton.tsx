import Link from "next/link";
import React from "react";
import { Plus } from "lucide-react";
interface MainAddButtonProps {
  href: string;
}

export const MainAddButton = ({ href }: MainAddButtonProps) => {
  return (
    <Link
      href={href}
      className="bg-yellow-600 border-black border-2 hover:bg-yellow-400 active:bg-yellow-600  px-6 py-2 rounded-full"
    >
      <Plus />
    </Link>
  );
};
