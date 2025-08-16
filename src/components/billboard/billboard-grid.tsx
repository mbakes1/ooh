"use client";

import React from "react";
import { BillboardWithDetails } from "@/types";
import { BillboardExploreCard } from "./billboard-explore-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface BillboardGridProps {
  billboards?: BillboardWithDetails[];
  viewMode?: "grid" | "list";
  loading?: boolean;
}

function BillboardSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex gap-6 p-6">
            <Skeleton className="w-48 h-32 flex-shrink-0" />
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-20 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-16 mb-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <Skeleton className="h-3 w-1/3" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BillboardGrid({
  billboards = [],
  viewMode = "grid",
  loading = false,
}: BillboardGridProps) {
  if (loading) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <BillboardSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }
    >
      {billboards.map((billboard) => (
        <BillboardExploreCard
          key={billboard.id}
          billboard={billboard}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
