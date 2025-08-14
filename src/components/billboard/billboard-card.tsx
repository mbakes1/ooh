"use client";

import React from "react";
import { MapPin, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillboardWithDetails } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface BillboardCardProps {
  billboard?: BillboardWithDetails;
  viewMode?: "grid" | "list";
  showActions?: boolean;
  className?: string;
  loading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BillboardCard({
  billboard,
  viewMode = "grid",
  showActions = false,
  className,
  loading = false,
  onEdit,
  onDelete,
}: BillboardCardProps) {
  // Loading skeleton
  if (loading || !billboard) {
    if (viewMode === "list") {
      return (
        <Card className={cn("", className)}>
          <CardContent className="p-0">
            <div className="flex gap-6 p-6">
              <Skeleton className="w-48 h-32 flex-shrink-0" />
              <div className="flex-1 flex flex-col">
                <div className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={cn("", className)}>
        <CardContent className="p-0">
          <Skeleton className="aspect-video w-full" />
          <div className="p-4">
            <div className="pb-3">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="pb-3">
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const primaryImage =
    billboard.images.find((img) => img.isPrimary) || billboard.images[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTrafficLevelColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (viewMode === "list") {
    return (
      <Card
        className={cn(
          "hover:shadow-lg transition-all duration-200 hover:scale-[1.01]",
          className
        )}
      >
        <CardContent className="p-0">
          <div className="flex gap-6 p-6">
            <div className="relative w-48 h-32 flex-shrink-0">
              {primaryImage ? (
                <Image
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText || billboard.title}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <CardHeader className="p-0 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/billboards/${billboard.id}`}>
                      <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
                        {billboard.title}
                      </CardTitle>
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {billboard.city}, {billboard.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {billboard.status && (
                      <Badge
                        variant="outline"
                        className={getStatusColor(billboard.status)}
                      >
                        {billboard.status}
                      </Badge>
                    )}
                    {billboard.trafficLevel && (
                      <Badge
                        variant="outline"
                        className={getTrafficLevelColor(billboard.trafficLevel)}
                      >
                        {billboard.trafficLevel} Traffic
                      </Badge>
                    )}
                    {billboard.owner.verified && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                {showActions && (
                  <CardAction>
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <Button size="sm" variant="outline" onClick={onEdit}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={onDelete}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardAction>
                )}
              </CardHeader>

              <CardContent className="p-0 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {billboard.description}
                </p>
                <div className="text-sm text-muted-foreground">
                  Dimensions: {billboard.width}m × {billboard.height}m
                </div>
              </CardContent>

              <CardFooter className="p-0 pt-3 flex items-center justify-between">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(Number(billboard.basePrice))}
                  <span className="text-sm font-normal text-muted-foreground">
                    /day
                  </span>
                </div>
                <Link href={`/billboards/${billboard.id}`}>
                  <Button
                    size="sm"
                    className="hover:shadow-md transition-shadow"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || billboard.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            {billboard.status && (
              <Badge
                variant="secondary"
                className={cn(
                  "backdrop-blur-sm",
                  getStatusColor(billboard.status)
                )}
              >
                {billboard.status}
              </Badge>
            )}
            {billboard.owner.verified && (
              <Badge
                variant="secondary"
                className="bg-white/90 text-blue-800 backdrop-blur-sm"
              >
                <Star className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/billboards/${billboard.id}`}>
                  <CardTitle className="font-semibold hover:text-primary transition-colors line-clamp-1 cursor-pointer">
                    {billboard.title}
                  </CardTitle>
                </Link>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {billboard.city}, {billboard.province}
                </p>
              </div>
              {showActions && (
                <CardAction>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <Button size="sm" variant="ghost" onClick={onEdit}>
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="ghost" onClick={onDelete}>
                        Delete
                      </Button>
                    )}
                  </div>
                </CardAction>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 pb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {billboard.width}m × {billboard.height}m
              </span>
              {billboard.trafficLevel && (
                <Badge
                  variant="outline"
                  className={getTrafficLevelColor(billboard.trafficLevel)}
                >
                  {billboard.trafficLevel}
                </Badge>
              )}
            </div>
          </CardContent>

          <CardFooter className="p-0 flex items-center justify-between">
            <div className="text-lg font-bold text-primary">
              {formatPrice(Number(billboard.basePrice))}
              <span className="text-sm font-normal text-muted-foreground">
                /day
              </span>
            </div>
            <Link href={`/billboards/${billboard.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
          </CardFooter>
        </div>
      </CardContent>
    </Card>
  );
}
