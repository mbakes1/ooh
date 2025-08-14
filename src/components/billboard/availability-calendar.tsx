"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getCurrentSASTTime, formatSASTDate } from "@/lib/utils";

interface AvailabilityCalendarProps {
  className?: string;
}

export function AvailabilityCalendar({ className }: AvailabilityCalendarProps) {
  const [availableFrom, setAvailableFrom] = useState<Date>();
  const [availableTo, setAvailableTo] = useState<Date>();
  const [operatingHours, setOperatingHours] = useState({
    start: "06:00",
    end: "22:00",
  });
  const [is24Hours, setIs24Hours] = useState(false);

  // Get today's date in YYYY-MM-DD format using SAST
  const today = getCurrentSASTTime().toISOString().split("T")[0];

  const handleOperatingHoursChange = (
    field: "start" | "end",
    value: string
  ) => {
    setOperatingHours((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggle24Hours = () => {
    setIs24Hours(!is24Hours);
    if (!is24Hours) {
      setOperatingHours({ start: "00:00", end: "23:59" });
    } else {
      setOperatingHours({ start: "06:00", end: "22:00" });
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Availability Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Availability Period
          </CardTitle>
          <CardDescription>
            Set when your billboard will be available for booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Available From *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !availableFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {availableFrom
                      ? formatSASTDate(availableFrom)
                      : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={availableFrom}
                    onSelect={setAvailableFrom}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                When will this billboard be available for booking?
              </p>
            </div>

            <div className="space-y-3">
              <Label>Available Until (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !availableTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {availableTo
                      ? formatSASTDate(availableTo)
                      : "Select end date (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={availableTo}
                    onSelect={setAvailableTo}
                    disabled={(date) => {
                      return (
                        date < new Date() ||
                        (availableFrom ? date < availableFrom : false)
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                Leave empty if available indefinitely
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
          <CardDescription>
            Define when your billboard displays content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={is24Hours ? "default" : "outline"}
              size="sm"
              onClick={toggle24Hours}
            >
              24/7 Operation
            </Button>
            <span className="text-sm text-muted-foreground">
              {is24Hours ? "Billboard operates 24 hours" : "Custom hours"}
            </span>
          </div>

          {!is24Hours && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={operatingHours.start}
                  onChange={(e) =>
                    handleOperatingHoursChange("start", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={operatingHours.end}
                  onChange={(e) =>
                    handleOperatingHoursChange("end", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Information */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Booking Information</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                • Advertisers can request specific time slots within your
                operating hours
              </p>
              <p>• You can accept or decline booking requests</p>
              <p>• Multiple advertisers can share time slots if you allow it</p>
              <p>• Set minimum booking duration in your listing preferences</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      {(availableFrom || operatingHours.start) && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Availability Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              {availableFrom && (
                <p>
                  <strong>Available from:</strong>{" "}
                  {formatSASTDate(availableFrom)}
                  {availableTo && ` until ${formatSASTDate(availableTo)}`}
                </p>
              )}
              <p>
                <strong>Operating hours:</strong>{" "}
                {is24Hours
                  ? "24 hours a day, 7 days a week"
                  : `${operatingHours.start} - ${operatingHours.end} daily`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
