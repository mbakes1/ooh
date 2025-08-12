"use client";

import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficLevel } from "@prisma/client";

export interface SearchFilters {
  city?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  trafficLevel?: TrafficLevel;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

export function SearchFiltersPanel({
  filters,
  onChange,
  onApply,
  onClear,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (
    key: keyof SearchFilters,
    value: string | number | TrafficLevel | undefined
  ) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {
                  Object.values(filters).filter(
                    (v) => v !== undefined && v !== ""
                  ).length
                }
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Location Filters */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Location</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select
                  value={filters.province || ""}
                  onValueChange={(value) => updateFilter("province", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUTH_AFRICAN_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city name"
                  value={filters.city || ""}
                  onChange={(e) => updateFilter("city", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Price Range (ZAR)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Min Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    updateFilter(
                      "minPrice",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="No limit"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxPrice",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Billboard Dimensions */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Billboard Size</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width (m)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.minWidth || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minWidth",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.maxWidth || ""}
                    onChange={(e) =>
                      updateFilter(
                        "maxWidth",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Height (m)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.minHeight || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minHeight",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.maxHeight || ""}
                    onChange={(e) =>
                      updateFilter(
                        "maxHeight",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Level */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Traffic Level</h4>
            <Select
              value={filters.trafficLevel || ""}
              onValueChange={(value) =>
                updateFilter("trafficLevel", value as TrafficLevel)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select traffic level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High Traffic</SelectItem>
                <SelectItem value="MEDIUM">Medium Traffic</SelectItem>
                <SelectItem value="LOW">Low Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply Button */}
          <Button onClick={onApply} className="w-full">
            Apply Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
