"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  MessageSquare,
  Settings,
  Users,
  Home,
  Search,
  Bell,
  Shield,
  FileText,
  TrendingUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Navigation items for different user roles
  const getNavigationItems = () => {
    const commonItems = [
      {
        title: "Overview",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Messages",
        url: "/messages",
        icon: MessageSquare,
      },
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
      },
      {
        title: "Profile Settings",
        url: "/profile",
        icon: Settings,
      },
    ];

    const ownerItems = [
      {
        title: "My Billboards",
        url: "/dashboard/listings",
        icon: Building2,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
      },
    ];

    const adminItems = [
      {
        title: "Admin Dashboard",
        url: "/admin",
        icon: Shield,
      },
      {
        title: "User Management",
        url: "/admin/users",
        icon: Users,
      },
      {
        title: "Billboard Moderation",
        url: "/admin/billboards",
        icon: Building2,
      },
      {
        title: "Platform Analytics",
        url: "/admin/analytics",
        icon: TrendingUp,
      },
      {
        title: "Reports",
        url: "/admin/reports",
        icon: FileText,
      },
    ];

    const publicItems = [
      {
        title: "Find Billboards",
        url: "/search",
        icon: Search,
      },
    ];

    let items = [...commonItems];

    if (session?.user?.role === "OWNER") {
      items = [...ownerItems, ...items];
    }

    if (session?.user?.role === "ADMIN") {
      items = [...adminItems, ...items];
    }

    items = [...items, ...publicItems];

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar className={className}>
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 px-2 py-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-semibold text-sm">Billboard Marketplace</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        {session?.user && (
          <div className="flex items-center space-x-2 px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || "User"}
              />
              <AvatarFallback className="text-xs">
                {getInitials(session.user.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {session.user.role?.toLowerCase()}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
