"use client";

import { Monitor, Zap, Eye, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
// Select components removed - using Combobox instead
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

  // Convert resolutions to combobox options
  const resolutionOptions: ComboboxOption[] = commonResolutions.map((res) => ({
    value: res,
    label:
      `${res} ${res === "1920x1080" ? "(Full HD)" : res === "2560x1440" ? "(2K)" : res === "3840x2160" ? "(4K)" : ""}`.trim(),
  }));

  // Traffic level options
  const trafficLevelOptions: ComboboxOption[] = [
    { value: "HIGH", label: "High Traffic - Busy highways, city centers" },
    {
      value: "MEDIUM",
      label: "Medium Traffic - Suburban roads, shopping areas",
    },
    { value: "LOW", label: "Low Traffic - Residential areas, quiet streets" },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Technical Specifications</h3>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label htmlFor="width">Width (meters) *</Label>
          <div className="space-y-3">
            <Slider
              value={[width || 1]}
              onValueChange={(values) => onWidthChange(values[0])}
              min={1}
              max={50}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between items-center">
              <Input
                id="width"
                type="number"
                placeholder="6.0"
                value={width || ""}
                onChange={(e) =>
                  handleNumberInput(e.target.value, onWidthChange, 1, 50)
                }
                min="1"
                max="50"
                step="0.1"
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">
                {width || 0}m (1-50m range)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="height">Height (meters) *</Label>
          <div className="space-y-3">
            <Slider
              value={[height || 1]}
              onValueChange={(values) => onHeightChange(values[0])}
              min={1}
              max={20}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between items-center">
              <Input
                id="height"
                type="number"
                placeholder="3.0"
                value={height || ""}
                onChange={(e) =>
                  handleNumberInput(e.target.value, onHeightChange, 1, 20)
                }
                min="1"
                max="20"
                step="0.1"
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">
                {height || 0}m (1-20m range)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution */}
      <div className="space-y-2">
        <Label htmlFor="resolution">Display Resolution *</Label>
        <Combobox
          options={resolutionOptions}
          value={resolution}
          onValueChange={onResolutionChange}
          placeholder="Select resolution"
          searchPlaceholder="Search resolutions..."
          emptyText="No resolution found."
        />
        <p className="text-sm text-muted-foreground">
          Select the display resolution of your billboard
        </p>
      </div>

      {/* Brightness */}
      <div className="space-y-4">
        <Label htmlFor="brightness" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Brightness (nits)
        </Label>
        <div className="space-y-3">
          <Slider
            value={[brightness || 5000]}
            onValueChange={(values) => onBrightnessChange(values[0])}
            min={1000}
            max={10000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between items-center">
            <Input
              id="brightness"
              type="number"
              placeholder="5000"
              value={brightness || ""}
              onChange={(e) =>
                handleNumberInput(
                  e.target.value,
                  onBrightnessChange,
                  1000,
                  10000
                )
              }
              min="1000"
              max="10000"
              step="100"
              className="w-24 text-center"
            />
            <span className="text-sm text-muted-foreground">
              {brightness || 0} nits (1000-10000 range)
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Display brightness in nits. Higher values are better for daylight
          visibility.
        </p>
      </div>

      {/* Viewing Distance */}
      <div className="space-y-4">
        <Label htmlFor="viewingDistance" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Viewing Distance (meters)
        </Label>
        <div className="space-y-3">
          <Slider
            value={[viewingDistance || 50]}
            onValueChange={(values) => onViewingDistanceChange(values[0])}
            min={1}
            max={1000}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between items-center">
            <Input
              id="viewingDistance"
              type="number"
              placeholder="50"
              value={viewingDistance || ""}
              onChange={(e) =>
                handleNumberInput(
                  e.target.value,
                  onViewingDistanceChange,
                  1,
                  1000
                )
              }
              min="1"
              max="1000"
              className="w-24 text-center"
            />
            <span className="text-sm text-muted-foreground">
              {viewingDistance || 0}m (1-1000m range)
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Typical viewing distance in meters
        </p>
      </div>

      {/* Traffic Level */}
      <div className="space-y-2">
        <Label htmlFor="trafficLevel" className="flex items-center gap-2">
          <Car className="h-4 w-4" />
          Traffic Level
        </Label>
        <Combobox
          options={trafficLevelOptions}
          value={trafficLevel}
          onValueChange={(value) =>
            onTrafficLevelChange(
              value === "" ? undefined : (value as TrafficLevel)
            )
          }
          placeholder="Select traffic level"
          searchPlaceholder="Search traffic levels..."
          emptyText="No traffic level found."
        />
        <p className="text-sm text-muted-foreground">
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
