"use client";

import React from "react";
import { MapPin, Eye, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillboardWithDetails } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BillboardExploreCardProps {
  billboard: BillboardWithDetails;
  viewMode?: "grid" | "list";
  className?: string;
}

export function BillboardExploreCard({
  billboard,
  viewMode = "grid",
  className,
}: BillboardExploreCardProps) {
  const primaryImage =
    billboard.images.find((img) => img.isPrimary) || billboard.images[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-red-50 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (viewMode === "list") {
    return (
      <Card
        className={cn(
          "group hover:shadow-md transition-all duration-300",
          className
        )}
      >
        <CardContent className="p-0">
          <div className="flex gap-6 p-6">
            {/* Image */}
            <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
              {primaryImage ? (
                <Image
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText || billboard.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {billboard.owner.verified && (
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-blue-700 text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link href={`/billboards/${billboard.id}`}>
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer line-clamp-1">
                        {billboard.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {billboard.city}, {billboard.province}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {formatPrice(Number(billboard.basePrice))}
                    </div>
                    <div className="text-xs text-muted-foreground">per day</div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {billboard.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span>
                    {billboard.width}m × {billboard.height}m
                  </span>
                  {billboard.trafficLevel && (
                    <>
                      <span>•</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          getTrafficColor(billboard.trafficLevel)
                        )}
                      >
                        {billboard.trafficLevel} Traffic
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  by {billboard.owner.name}
                </div>
                <Link href={`/billboards/${billboard.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
        className
      )}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || billboard.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {billboard.owner.verified && (
              <Badge
                variant="secondary"
                className="bg-white/90 text-blue-700 text-xs"
              >
                <Star className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {billboard.trafficLevel && (
              <Badge
                variant="outline"
                className={cn(
                  "bg-white/90 text-xs",
                  getTrafficColor(billboard.trafficLevel)
                )}
              >
                <Zap className="h-3 w-3 mr-1" />
                {billboard.trafficLevel}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Link href={`/billboards/${billboard.id}`}>
                  <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer line-clamp-1">
                    {billboard.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {billboard.city}, {billboard.province}
                  </span>
                </p>
              </div>
              <div className="text-right ml-3">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(Number(billboard.basePrice))}
                </div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {billboard.width}m × {billboard.height}m
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                by {billboard.owner.name}
              </div>
              <Link href={`/billboards/${billboard.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
