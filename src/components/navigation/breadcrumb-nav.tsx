"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbNavProps {
  className?: string;
  maxItems?: number;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactElement;
  isLast?: boolean;
}

export function BreadcrumbNav({ className, maxItems = 3 }: BreadcrumbNavProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);

    // Define custom labels for common paths
    const pathLabels: Record<string, string> = {
      dashboard: "Dashboard",
      admin: "Admin",
      search: "Find Billboards",
      messages: "Messages",
      notifications: "Notifications",
      profile: "Profile",
      auth: "Authentication",
      login: "Sign In",
      register: "Sign Up",
      "forgot-password": "Forgot Password",
      "reset-password": "Reset Password",
      billboards: "Billboards",
      create: "Create",
      edit: "Edit",
      listings: "My Listings",
      analytics: "Analytics",
      users: "Users",
      reports: "Reports",
    };

    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Home",
        href: "/",
        icon: <Home className="h-4 w-4" />,
      },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip dynamic route segments (those that look like IDs)
      if (
        segment.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        return;
      }

      const label =
        pathLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = index === pathSegments.length - 1;

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  // Handle ellipsis for long breadcrumb chains
  const shouldShowEllipsis = breadcrumbs.length > maxItems;
  const visibleBreadcrumbs = shouldShowEllipsis
    ? [
        breadcrumbs[0], // Always show home
        ...breadcrumbs.slice(-2), // Show last 2 items
      ]
    : breadcrumbs;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {visibleBreadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.href} className="flex items-center">
            {/* Show ellipsis after home if needed */}
            {shouldShowEllipsis && index === 1 && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}

            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={breadcrumb.href}
                    className="flex items-center gap-1"
                  >
                    {breadcrumb.icon}
                    <span>{breadcrumb.label}</span>
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {!breadcrumb.isLast && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
