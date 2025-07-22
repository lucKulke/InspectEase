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
  Group,
  Car,
  Blocks,
  Mic,
  User as UserIcon,
  GroupIcon,
  Key,
  Bell,
  Shield,
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
} from "@/lib/database/public/publicInterface";
import { NavMain } from "./NavMain";

// This is sample data.
const dataBuilder = {
  user: {
    id: "1",
    name: "Unknown",
    email: "m@unknown.com",
    avatar: "/avatars/shadcn.jpg",
  },
  apps: [
    {
      name: "Filler",
      logo: Mic,
      path: "/form-filler",
    },
    {
      name: "Builder",
      logo: Blocks,
      path: "/form-builder",
    },
    {
      name: "Settings",
      logo: Settings2,
      path: "/settings",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/form-builder",
      icon: CircleGauge,
      isActive: false,
      items: [],
    },
    {
      title: "Profiles",
      url: "/form-builder/inspectable-object-profiles",
      icon: Group,
      isActive: false,
      items: [
        {
          title: "create",
          url: "/form-builder/inspectable-object-profiles/create",
        },
      ],
    },
    {
      title: "Objects",
      url: "/form-builder/inspectable-objects",
      icon: Car,
      isActive: false,
      items: [
        {
          title: "create",
          url: "/form-builder/inspectable-objects/create",
        },
      ],
    },
  ],

  // sections: [
  //   {
  //     name: "Dashboard",
  //     url: "/form-builder",
  //     icon: CircleGauge,
  //   },
  //   {
  //     name: "Groups",
  //     url: "/form-builder/inspectable-object-profiles",
  //     icon: Group,
  //   },
  //   {
  //     name: "Objects",
  //     url: "/form-builder/inspectable-objects",
  //     icon: Car,
  //   },
  // ],
};

const dataFiller = {
  user: {
    id: "1",
    name: "Unknown",
    email: "m@unknown.com",
    avatar: "/avatars/shadcn.jpg",
  },
  apps: [
    {
      name: "Builder",
      logo: Blocks,
      path: "/form-builder",
    },
    {
      name: "Filler",
      logo: Mic,
      path: "/form-filler",
    },
    {
      name: "Settings",
      logo: Settings2,
      path: "/settings",
    },
  ],
  navMain: [
    {
      title: "Forms",
      url: "/form-filler",
      icon: NotepadText,
      isActive: false,
      items: [
        {
          title: "select",
          url: "/form-filler/select-form",
        },
      ],
    },
  ],
};

const dataSettings = {
  user: {
    id: "1",
    name: "Unknown",
    email: "m@unknown.com",
    avatar: "/avatars/shadcn.jpg",
  },
  apps: [
    {
      name: "Builder",
      logo: Blocks,
      path: "/form-builder",
    },
    {
      name: "Filler",
      logo: Mic,
      path: "/form-filler",
    },
    {
      name: "Settings",
      logo: Settings2,
      path: "/settings",
    },
  ],
  navMain: [
    {
      title: "User Profile",
      icon: UserIcon,
      isActive: false,
      items: [
        {
          icon: UserIcon,
          title: "Personal",
          url: "/settings/user-profile/personal",
        },
        {
          icon: Shield,
          title: "Security",
          url: "/settings/user-profile/security",
        },
        {
          icon: Bell,
          title: "Notifications",
          url: "/settings/user-profile/notifications",
        },
        {
          icon: Key,
          title: "AI API",
          url: "/settings/user-profile/ai-api",
        },
        {
          icon: GroupIcon,
          title: "Teams",
          url: "/settings/user-profile/teams",
        },
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
  profile: IUserProfileResponse | null;
  teams: ITeamResponse[] | null;
  profilePicture: string | undefined;
}

export function AppSidebar({
  user,
  profile,
  teams,
  profilePicture,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname() ?? "";

  let data = null;

  if (pathname.startsWith("/form-filler")) {
    data = dataFiller;
  } else if (pathname.startsWith("/form-builder")) {
    data = dataBuilder;
  } else if (pathname.startsWith("/settings")) {
    data = dataSettings;
  }

  if (!data) {
    return null;
  }
  if (user) {
    data.user.id = user.id ?? "";
    data.user.email = user.email ?? "";
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSwitcher apps={data.apps} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />{" "}
        {/* <NavSections sections={sections}></NavSections> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={data.user}
          profile={profile}
          teams={teams}
          profilePicture={profilePicture}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
