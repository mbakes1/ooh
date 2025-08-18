"use client";

import React, { useState } from "react";
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
import { TrafficLevel } from "@/types";

interface SearchFilters {
  city?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  trafficLevel?: TrafficLevel;
}

interface FiltersPanelProps {
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
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

export function FiltersPanel({ filters, onApply }: FiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onApply(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className="space-y-6 pt-6">
      {/* Location */}
      <div className="space-y-4">
        <h3 className="font-medium">Location</h3>

        <div className="space-y-3">
          <div>
            <Label htmlFor="province" className="text-sm">
              Province
            </Label>
            <Select
              value={localFilters.province || "all"}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  province: value === "all" ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Any province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any province</SelectItem>
                {SOUTH_AFRICAN_PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="city" className="text-sm">
              City
            </Label>
            <Input
              id="city"
              value={localFilters.city || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  city: e.target.value || undefined,
                }))
              }
              placeholder="Enter city name"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-medium">Price Range (per day)</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minPrice" className="text-sm">
              Min Price
            </Label>
            <Input
              id="minPrice"
              type="number"
              value={localFilters.minPrice || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  minPrice: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                }))
              }
              placeholder="R 0"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="maxPrice" className="text-sm">
              Max Price
            </Label>
            <Input
              id="maxPrice"
              type="number"
              value={localFilters.maxPrice || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  maxPrice: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                }))
              }
              placeholder="R 10,000"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Traffic Level */}
      <div className="space-y-4">
        <h3 className="font-medium">Traffic Level</h3>

        <Select
          value={localFilters.trafficLevel || "all"}
          onValueChange={(value) =>
            setLocalFilters((prev) => ({
              ...prev,
              trafficLevel:
                value === "all" ? undefined : (value as TrafficLevel),
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any traffic level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any traffic level</SelectItem>
            <SelectItem value="HIGH">High Traffic</SelectItem>
            <SelectItem value="MEDIUM">Medium Traffic</SelectItem>
            <SelectItem value="LOW">Low Traffic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t">
        <Button onClick={handleApply} className="w-full">
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button onClick={handleClear} variant="outline" className="w-full">
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
