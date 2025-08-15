"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  MessageSquare,
  Settings,
  Search,
  Shield,
  Plus,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  // Company/Platform info
  const platformData = {
    name: "Billboard Marketplace",
    logo: Building2,
    plan:
      session?.user?.role === "ADMIN"
        ? "Admin"
        : session?.user?.role === "OWNER"
          ? "Owner"
          : "User",
  };

  // User data
  const userData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.image || "",
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      {
        title: "Messages",
        url: "/messages",
        icon: MessageSquare,
        items: [
          {
            title: "Inbox",
            url: "/messages",
          },
          {
            title: "Sent",
            url: "/messages/sent",
          },
        ],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Settings,
        items: [],
      },
    ];

    const ownerItems = [
      {
        title: "My Billboards",
        url: "/dashboard/billboards",
        icon: Building2,
        isActive: true,
        items: [
          {
            title: "All Listings",
            url: "/dashboard/billboards",
          },
          {
            title: "Create New",
            url: "/billboards/create",
          },
        ],
      },
    ];

    const advertiserItems = [
      {
        title: "Find Billboards",
        url: "/search",
        icon: Search,
        isActive: true,
        items: [],
      },
    ];

    const adminItems = [
      {
        title: "Administration",
        url: "/admin",
        icon: Shield,
        items: [
          {
            title: "Dashboard",
            url: "/admin",
          },
          {
            title: "Users",
            url: "/admin/users",
          },
          {
            title: "Billboards",
            url: "/admin/billboards",
          },
        ],
      },
    ];

    let items = [...commonItems];

    if (session?.user?.role === "OWNER") {
      items = [...ownerItems, ...items];
    } else if (session?.user?.role === "ADVERTISER") {
      items = [...advertiserItems, ...items];
    }

    if (session?.user?.role === "ADMIN") {
      items = [...adminItems, ...items];
    }

    return items;
  };

  // Quick actions/projects
  const getQuickActions = () => {
    const publicActions = [
      {
        name: "Find Billboards",
        url: "/search",
        icon: Search,
      },
    ];

    const ownerActions = [
      {
        name: "Create Billboard",
        url: "/billboards/create",
        icon: Plus,
      },
    ];

    let actions = [...publicActions];

    if (session?.user?.role === "OWNER") {
      actions = [...ownerActions, ...actions];
    }

    return actions;
  };

  const navigationItems = getNavigationItems();
  const quickActions = getQuickActions();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[platformData]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
        <NavProjects projects={quickActions} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
