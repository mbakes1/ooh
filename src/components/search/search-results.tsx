"use client";

import React from "react";
import { ArrowUpDown, Grid, List, MapPin, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillboardWithDetails } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface SearchResultsProps {
  billboards: BillboardWithDetails[];
  total: number;
  loading?: boolean;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function SearchResults({
  billboards,
  total,
  loading = false,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SearchResultsProps) {
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    onSortChange(newSortBy, newSortOrder);
  };

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
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-48 h-32 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total} billboard{total !== 1 ? "s" : ""} found
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Options */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="location-asc">Location A-Z</SelectItem>
              <SelectItem value="location-desc">Location Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      {billboards.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No billboards found</h3>
              <p>
                Try adjusting your search criteria or filters to find more
                results.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {billboards.map((billboard) => (
            <BillboardCard
              key={billboard.id}
              billboard={billboard}
              viewMode={viewMode}
              formatPrice={formatPrice}
              getTrafficLevelColor={getTrafficLevelColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BillboardCardProps {
  billboard: BillboardWithDetails;
  viewMode: "grid" | "list";
  formatPrice: (price: number) => string;
  getTrafficLevelColor: (level: string) => string;
}

function BillboardCard({
  billboard,
  viewMode,
  formatPrice,
  getTrafficLevelColor,
}: BillboardCardProps) {
  const primaryImage =
    billboard.images.find((img) => img.isPrimary) || billboard.images[0];

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="relative w-48 h-32 flex-shrink-0">
              {primaryImage ? (
                <Image
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText || billboard.title}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <Link href={`/billboards/${billboard.id}`}>
                  <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                    {billboard.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {billboard.city}, {billboard.province}
                </p>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {billboard.description}
              </p>

              <div className="flex items-center gap-4 text-sm">
                <span>
                  {billboard.width}m × {billboard.height}m
                </span>
                {billboard.trafficLevel && (
                  <Badge
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

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(Number(billboard.basePrice))}
                  <span className="text-sm font-normal text-muted-foreground">
                    /day
                  </span>
                </div>
                <Link href={`/billboards/${billboard.id}`}>
                  <Button size="sm">
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-video">
          {primaryImage ? (
            <Image
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || billboard.title}
              fill
              className="object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <Link href={`/billboards/${billboard.id}`}>
              <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                {billboard.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {billboard.city}, {billboard.province}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>
              {billboard.width}m × {billboard.height}m
            </span>
            {billboard.trafficLevel && (
              <Badge className={getTrafficLevelColor(billboard.trafficLevel)}>
                {billboard.trafficLevel}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-primary">
              {formatPrice(Number(billboard.basePrice))}
              <span className="text-sm font-normal text-muted-foreground">
                /day
              </span>
            </div>
            {billboard.owner.verified && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Star className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
