"use client";

import { Monitor, Zap, Eye, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commonResolutions } from "@/lib/validations/billboard";
import { TrafficLevel } from "@prisma/client";
import { cn } from "@/lib/utils";

interface SpecificationsInputProps {
  width: number;
  height: number;
  resolution: string;
  brightness: number;
  viewingDistance: number;
  trafficLevel: TrafficLevel | "";
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onResolutionChange: (resolution: string) => void;
  onBrightnessChange: (brightness: number | undefined) => void;
  onViewingDistanceChange: (distance: number | undefined) => void;
  onTrafficLevelChange: (level: TrafficLevel | undefined) => void;
  className?: string;
}

export function SpecificationsInput({
  width,
  height,
  resolution,
  brightness,
  viewingDistance,
  trafficLevel,
  onWidthChange,
  onHeightChange,
  onResolutionChange,
  onBrightnessChange,
  onViewingDistanceChange,
  onTrafficLevelChange,
  className,
}: SpecificationsInputProps) {
  const handleNumberInput = (
    value: string,
    onChange: (num: number) => void,
    min = 0,
    max = Infinity
  ) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    } else if (value === "") {
      onChange(0);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Technical Specifications</h3>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (meters) *</Label>
          <Input
            id="width"
            type="number"
            placeholder="e.g., 6"
            value={width || ""}
            onChange={(e) =>
              handleNumberInput(e.target.value, onWidthChange, 1, 50)
            }
            min="1"
            max="50"
            step="0.1"
          />
          <p className="text-sm text-gray-500">
            Billboard width in meters (1-50m)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (meters) *</Label>
          <Input
            id="height"
            type="number"
            placeholder="e.g., 3"
            value={height || ""}
            onChange={(e) =>
              handleNumberInput(e.target.value, onHeightChange, 1, 20)
            }
            min="1"
            max="20"
            step="0.1"
          />
          <p className="text-sm text-gray-500">
            Billboard height in meters (1-20m)
          </p>
        </div>
      </div>

      {/* Resolution */}
      <div className="space-y-2">
        <Label htmlFor="resolution">Display Resolution *</Label>
        <Select value={resolution} onValueChange={onResolutionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            {commonResolutions.map((res) => (
              <SelectItem key={res} value={res}>
                {res} {res === "1920x1080" && "(Full HD)"}
                {res === "2560x1440" && "(2K)"}
                {res === "3840x2160" && "(4K)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Select the display resolution of your billboard
        </p>
      </div>

      {/* Brightness */}
      <div className="space-y-2">
        <Label htmlFor="brightness" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Brightness (nits)
        </Label>
        <Input
          id="brightness"
          type="number"
          placeholder="e.g., 5000"
          value={brightness || ""}
          onChange={(e) =>
            handleNumberInput(e.target.value, onBrightnessChange, 1000, 10000)
          }
          min="1000"
          max="10000"
        />
        <p className="text-sm text-gray-500">
          Display brightness in nits (1000-10000). Higher values are better for
          daylight visibility.
        </p>
      </div>

      {/* Viewing Distance */}
      <div className="space-y-2">
        <Label htmlFor="viewingDistance" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Viewing Distance (meters)
        </Label>
        <Input
          id="viewingDistance"
          type="number"
          placeholder="e.g., 50"
          value={viewingDistance || ""}
          onChange={(e) =>
            handleNumberInput(e.target.value, onViewingDistanceChange, 1, 1000)
          }
          min="1"
          max="1000"
        />
        <p className="text-sm text-gray-500">
          Typical viewing distance in meters (1-1000m)
        </p>
      </div>

      {/* Traffic Level */}
      <div className="space-y-2">
        <Label htmlFor="trafficLevel" className="flex items-center gap-2">
          <Car className="h-4 w-4" />
          Traffic Level
        </Label>
        <Select
          value={trafficLevel}
          onValueChange={(value) =>
            onTrafficLevelChange(
              value === "" ? undefined : (value as TrafficLevel)
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select traffic level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HIGH">
              High Traffic - Busy highways, city centers
            </SelectItem>
            <SelectItem value="MEDIUM">
              Medium Traffic - Suburban roads, shopping areas
            </SelectItem>
            <SelectItem value="LOW">
              Low Traffic - Residential areas, quiet streets
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Estimate the typical traffic level at this location
        </p>
      </div>

      {/* Display Area Calculation */}
      {width > 0 && height > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Display Area</h4>
          <p className="text-sm text-gray-600">
            Total area:{" "}
            <span className="font-medium">
              {(width * height).toFixed(2)} m²
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Aspect ratio:{" "}
            <span className="font-medium">{(width / height).toFixed(2)}:1</span>
          </p>
        </div>
      )}
    </div>
  );
}
