import { MainNavBar } from "@/components/MainNavBar";
import Link from "next/link";
import { Mic, Wrench } from "lucide-react";
import { formFillerLinks } from "@/lib/links/formFillerLinks";

const FormFillerNavbarIcon = () => {
  return (
    <Link
      href={formFillerLinks.home.href}
      className="flex 
   space-x-3 items-center"
    >
      <Mic size={36}></Mic>
      <p className="font-bold text-xl">Form Filler</p>
    </Link>
  );
};

export default function FormFillerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="m-auto max-w-[1400px] p-4">
      <MainNavBar
        icon={FormFillerNavbarIcon()}
        links={formFillerLinks}
      ></MainNavBar>
      <div className="border-2 rounded-xl min-h-screen mt-4 dark:border-slate-500 border-black p-4">
        {children}
      </div>
    </div>
  );
}
