"use client";

import { ReactNode } from "react";
import { BreadcrumbNav } from "./breadcrumb-nav";

interface PageLayoutProps {
  children: ReactNode;
  showBreadcrumbs?: boolean;
  className?: string;
}

export function PageLayout({
  children,
  showBreadcrumbs = true,
  className = "container mx-auto py-6",
}: PageLayoutProps) {
  return (
    <div className={className}>
      {showBreadcrumbs && (
        <div className="mb-6">
          <BreadcrumbNav />
        </div>
      )}
      {children}
    </div>
  );
}
