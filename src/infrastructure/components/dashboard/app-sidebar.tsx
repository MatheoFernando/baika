"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/src/infrastructure/components/dashboard/nav-main"
import { NavProjects } from "@/src/infrastructure/components/dashboard/nav-projects"
import { NavUser } from "@/src/infrastructure/components/dashboard/header/nav-user"
import { TeamSwitcher } from "@/src/infrastructure/components/dashboard/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/src/infrastructure/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  Menu: [
    {
      name: "Início",
      url: "#",
      icon: Frame,
    },
    {
      name: "Supervisores",
      url: "#",
      icon: PieChart,
        items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
    {
      name: "Supervisão",
      url: "#",
      icon: Map,
    },
       {
      name: "Ocorrências ",
      url: "#",
      icon: Map,
    },
  ],
  navMain: [
    {
      title: "Estatísticas ",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
     
    },
    {
      title: "Maps",
      url: "#",
      icon: Bot,
  
    },
    {
      title: "Chat",
      url: "#",
      icon: BookOpen,

    },
    {
      title: "Relatório da Supervisão ",
      url: "#",
      icon: Settings2,
    
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.Menu} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
