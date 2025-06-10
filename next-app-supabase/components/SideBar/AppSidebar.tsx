"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Wrench,
  Frame,
  GalleryVerticalEnd,
  Microscope,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  NotepadText,
  CircleGauge,
  ListOrdered,
  NotepadTextDashed,
  Pi,
  Cpu,
} from "lucide-react";

import { NavUser } from "@/components/SideBar/NavUser";
import { AppSwitcher } from "@/components/SideBar/AppSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { NavSections } from "./NavSections";
import {
  ITeamResponse,
  IUserProfileResponse,
} from "@/lib/database/public/interface";

// This is sample data.
const dataBuilder = {
  user: {
    name: "Unknown",
    email: "m@unknown.com",
    avatar: "/avatars/shadcn.jpg",
  },
  apps: [
    {
      name: "Builder",
      logo: Wrench,
      path: "/builder",
    },
    {
      name: "Runner",
      logo: Microscope,
      path: "/runner",
    },
  ],

  sections: [
    {
      name: "Dashboard",
      url: "/builder",
      icon: CircleGauge,
    },
    {
      name: "Test Plans",
      url: "/builder/test-plans",
      icon: NotepadTextDashed,
    },
    {
      name: "Analyse",
      url: "/builder/analysis",
      icon: Microscope,
    },
    {
      name: "Formulas",
      url: "/builder/formulas",
      icon: Pi,
    },
    {
      name: "Instruments",
      url: "/builder/instruments",
      icon: Cpu,
    },
  ],
};

const dataRunner = {
  user: {
    name: "Unknown",
    email: "m@unknown.com",
    avatar: "/avatars/shadcn.jpg",
  },
  apps: [
    {
      name: "Builder",
      logo: Wrench,
      path: "/builder",
    },
    {
      name: "Runner",
      logo: Microscope,
      path: "/runner",
    },
  ],

  sections: [
    {
      name: "Order",
      url: "#",
      icon: ListOrdered,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
  profile: IUserProfileResponse | null;
  teams: ITeamResponse[] | null;
}

export function AppSidebar({
  user,
  profile,
  teams,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  let data = null;

  if (pathname.startsWith("/runner")) {
    dataRunner.apps = [
      {
        name: "Runner",
        logo: Microscope,
        path: "/runner",
      },
      {
        name: "Builder",
        logo: Wrench,
        path: "/builder",
      },
    ];
    data = dataRunner;
  } else {
    dataBuilder.apps = [
      {
        name: "Builder",
        logo: Wrench,
        path: "/builder",
      },
      {
        name: "Runner",
        logo: Microscope,
        path: "/runner",
      },
    ];

    data = dataBuilder;
  }

  if (user) {
    data.user.email = user.email ?? "";
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSwitcher apps={data.apps} />
      </SidebarHeader>
      <SidebarContent>
        <NavSections sections={data.sections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} profile={profile} teams={teams} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
