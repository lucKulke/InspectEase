import { MainNavBar } from "@/components/MainNavBar";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

const FormBuilderNavbarIcon = () => {
  return (
    <Link
      href={formBuilderLinks.home}
      className="flex 
   space-x-3 items-center"
    >
      <Wrench size={36}></Wrench>
      <p className="font-bold text-xl">Form Builder</p>
    </Link>
  );
};

export default function FormBuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="m-auto max-w-[1400px] p-4">
      <MainNavBar
        icon={FormBuilderNavbarIcon()}
        links={formBuilderLinks}
      ></MainNavBar>
      <div className="border-2 rounded-xl min-h-screen mt-4 dark:border-slate-500 border-black p-4">
        {children}
      </div>
    </div>
  );
}
