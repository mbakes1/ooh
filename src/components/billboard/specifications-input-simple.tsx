"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrafficLevel } from "@prisma/client";
import { cn } from "@/lib/utils";

interface SpecificationsInputSimpleProps {
  width: number;
  height: number;
  resolution: string;
  brightness: number | undefined;
  viewingDistance: number | undefined;
  trafficLevel: TrafficLevel | "";
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onResolutionChange: (resolution: string) => void;
  onBrightnessChange: (brightness: number | undefined) => void;
  onViewingDistanceChange: (distance: number | undefined) => void;
  onTrafficLevelChange: (level: TrafficLevel | undefined) => void;
  className?: string;
}

export function SpecificationsInputSimple({
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
}: SpecificationsInputSimpleProps) {
  console.log("SpecificationsInputSimple props:", {
    width,
    height,
    resolution,
    brightness,
    viewingDistance,
    trafficLevel,
  });
  const handleNumberInput = (
    value: string,
    onChange: (num: number | undefined) => void
  ) => {
    console.log("Number input changed to:", value);
    if (value === "") {
      console.log("Setting number to undefined");
      onChange(undefined);
      return;
    }
    
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      console.log("Setting number to:", num);
      onChange(num);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (meters) *</Label>
          <Input
            id="width"
            type="number"
            placeholder="6.0"
            value={width || ""}
            onChange={(e) => handleNumberInput(e.target.value, (num) => {
              if (num !== undefined) onWidthChange(num);
            })}
            min="0.1"
            step="0.1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (meters) *</Label>
          <Input
            id="height"
            type="number"
            placeholder="3.0"
            value={height || ""}
            onChange={(e) => handleNumberInput(e.target.value, (num) => {
              if (num !== undefined) onHeightChange(num);
            })}
            min="0.1"
            step="0.1"
          />
        </div>
      </div>

      {/* Resolution */}
      <div className="space-y-2">
        <Label htmlFor="resolution">Display Resolution *</Label>
        <Select value={resolution || ""} onValueChange={(value) => {
          console.log("Resolution changed to:", value);
          onResolutionChange(value);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
            <SelectItem value="2560x1440">2560x1440 (2K)</SelectItem>
            <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
            <SelectItem value="1366x768">1366x768 (HD)</SelectItem>
            <SelectItem value="1280x720">1280x720 (HD Ready)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brightness */}
      <div className="space-y-2">
        <Label htmlFor="brightness">Brightness (nits)</Label>
        <Input
            id="brightness"
            type="number"
            placeholder="5000"
            value={brightness || ""}
            onChange={(e) =>
              handleNumberInput(e.target.value, onBrightnessChange)
            }
            min="1000"
            step="100"
          />
        <p className="text-sm text-muted-foreground">
          Typical range: 1000-10000 nits
        </p>
      </div>

      {/* Viewing Distance */}
      <div className="space-y-2">
        <Label htmlFor="viewingDistance">Viewing Distance (meters)</Label>
        <Input
            id="viewingDistance"
            type="number"
            placeholder="50"
            value={viewingDistance || ""}
            onChange={(e) =>
              handleNumberInput(e.target.value, onViewingDistanceChange)
            }
            min="1"
          />
        <p className="text-sm text-muted-foreground">
          Average distance viewers will be from the billboard
        </p>
      </div>

      {/* Traffic Level */}
      <div className="space-y-2">
        <Label htmlFor="trafficLevel">Traffic Level</Label>
        <Select
          value={trafficLevel || ""}
          onValueChange={(value) => {
            console.log("Traffic level changed to:", value);
            onTrafficLevelChange(
              value === "" ? undefined : (value as TrafficLevel)
            );
          }}
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

      {/* Display Area Calculation */}
      {width > 0 && height > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Display Area</h4>
          <p className="text-sm text-muted-foreground">
            Total area:{" "}
            <span className="font-medium">
              {(width * height).toFixed(2)} m²
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
