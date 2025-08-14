"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FormSkeletonProps {
  className?: string;
  fields?: number;
  showHeader?: boolean;
  showActions?: boolean;
}

export function FormSkeleton({
  className,
  fields = 5,
  showHeader = true,
  showActions = true,
}: FormSkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {[...Array(fields)].map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}

        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TableSkeletonProps {
  className?: string;
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <table className="w-full">
            {showHeader && (
              <thead>
                <tr className="border-b">
                  {[...Array(columns)].map((_, index) => (
                    <th key={index} className="p-4 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {[...Array(columns)].map((_, colIndex) => (
                    <td key={colIndex} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
  showActions?: boolean;
}

export function CardSkeleton({
  className,
  showImage = true,
  showActions = true,
}: CardSkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-0">
        {showImage && <Skeleton className="aspect-video w-full" />}
        <div className="p-4 space-y-3">
          <div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          {showActions && (
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} columns={6} showHeader={true} />
        </CardContent>
      </Card>
    </div>
  );
}
