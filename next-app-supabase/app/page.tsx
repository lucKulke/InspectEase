import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowRight, Edit3, Mic } from "lucide-react";
import type React from "react";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { formFillerLinks } from "@/lib/links/formFillerLinks";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form
        action={`https://${process.env.WEB_APP_DOMAIN}/auth/signout`}
        method="post"
      >
        <button className="button block" type="submit">
          Sign out
        </button>
      </form>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
        Welcome to InspectEase
      </h1>
      <p className="text-xl text-center mb-12 text-gray-600 dark:text-gray-300">
        Choose a tool to get started
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <ToolCard
          title="Form Builder"
          description="Create and customize forms with our intuitive builder"
          icon={<Edit3 className="h-6 w-6" />}
          href={formBuilderLinks.home.href}
        />
        <ToolCard
          title="Form Filler"
          description="Fill out forms using your voice with our advanced speech recognition"
          icon={<Mic className="h-6 w-6" />}
          href={formFillerLinks.home.href}
        />
      </div>
    </div>
  );
}

function ToolCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </CardTitle>
            {icon}
          </div>
          <CardDescription className="mt-2 text-gray-600 dark:text-gray-300">
            {description}
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-4">
          <span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
            Get started
            <ArrowRight className="ml-1 h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
