"use client";

import { useState } from "react";
import { Calendar, Clock, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, getCurrentSASTTime, formatSASTDate } from "@/lib/utils";

interface AvailabilityCalendarProps {
  className?: string;
}

export function AvailabilityCalendar({ className }: AvailabilityCalendarProps) {
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
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
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Availability & Schedule</h3>
      </div>

      {/* Availability Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="availableFrom">Available From</Label>
          <Input
            id="availableFrom"
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            min={today}
          />
          <p className="text-sm text-gray-500">
            When will this billboard be available for booking?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availableTo">Available Until (Optional)</Label>
          <Input
            id="availableTo"
            type="date"
            value={availableTo}
            onChange={(e) => setAvailableTo(e.target.value)}
            min={availableFrom || today}
          />
          <p className="text-sm text-gray-500">
            Leave empty if available indefinitely
          </p>
        </div>
      </div>

      {/* Operating Hours */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          <h4 className="font-medium">Operating Hours</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={is24Hours ? "default" : "outline"}
              size="sm"
              onClick={toggle24Hours}
            >
              24/7 Operation
            </Button>
            <span className="text-sm text-gray-500">
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
        </div>
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
        <Card className="p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Availability Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {availableFrom && (
              <p>
                <strong>Available from:</strong>{" "}
                {formatSASTDate(new Date(availableFrom))}
                {availableTo &&
                  ` until ${formatSASTDate(new Date(availableTo))}`}
              </p>
            )}
            <p>
              <strong>Operating hours:</strong>{" "}
              {is24Hours
                ? "24 hours a day, 7 days a week"
                : `${operatingHours.start} - ${operatingHours.end} daily`}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
