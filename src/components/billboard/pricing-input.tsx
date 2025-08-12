"use client";

import { useState } from "react";
import { DollarSign, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  cn,
  formatZAR,
  formatZARInput,
  parseZAR,
  southAfricanTerminology,
} from "@/lib/utils";

interface PricingInputProps {
  basePrice: number;
  onBasePriceChange: (price: number) => void;
  className?: string;
}

export function PricingInput({
  basePrice,
  onBasePriceChange,
  className,
}: PricingInputProps) {
  const [displayValue, setDisplayValue] = useState(
    basePrice > 0 ? formatZAR(basePrice) : ""
  );

  const handlePriceChange = (value: string) => {
    setDisplayValue(value);

    // Parse the numeric value
    const numericValue = parseZAR(value);
    onBasePriceChange(numericValue);
  };

  const handleBlur = () => {
    // Format the display value on blur
    if (basePrice > 0) {
      setDisplayValue(formatZAR(basePrice));
    }
  };

  const handleFocus = () => {
    // Show raw number on focus for easier editing
    if (basePrice > 0) {
      setDisplayValue(formatZARInput(basePrice));
    }
  };

  // Calculate estimated pricing tiers
  const weeklyPrice = basePrice * 7 * 0.9; // 10% discount for weekly
  const monthlyPrice = basePrice * 30 * 0.8; // 20% discount for monthly

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Pricing Information</h3>
      </div>

      {/* Base Price Input */}
      <div className="space-y-2">
        <Label htmlFor="basePrice">
          Daily Base Price ({southAfricanTerminology.currencyCode}) *
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            {southAfricanTerminology.currencySymbol}
          </div>
          <Input
            id="basePrice"
            type="text"
            placeholder="0.00"
            value={displayValue}
            onChange={(e) => handlePriceChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-gray-500">
          Enter your daily rate in South African{" "}
          {southAfricanTerminology.currency}
        </p>
      </div>

      {/* Pricing Information Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Pricing Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Consider location traffic and visibility</li>
              <li>• Factor in billboard size and resolution</li>
              <li>• Research competitor pricing in your area</li>
              <li>• Higher traffic areas can command premium rates</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Estimated Pricing Tiers */}
      {basePrice > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Estimated Pricing Tiers</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Rate:</span>
              <span className="font-medium">{formatZAR(basePrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Weekly Rate (10% discount):
              </span>
              <span className="font-medium text-green-600">
                {formatZAR(weeklyPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Monthly Rate (20% discount):
              </span>
              <span className="font-medium text-green-600">
                {formatZAR(monthlyPrice)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">
              * Suggested pricing tiers. You can negotiate custom rates with
              advertisers.
            </p>
          </div>
        </Card>
      )}

      {/* Market Rate Comparison */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-medium mb-2">South African Market Rates</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>High Traffic (Highways, CBD):</strong> R2,000 - R10,000+ per
            day
          </p>
          <p>
            <strong>Medium Traffic (Suburbs):</strong> R500 - R2,000 per day
          </p>
          <p>
            <strong>Low Traffic (Residential):</strong> R100 - R500 per day
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Rates vary by location, size, and billboard specifications
        </p>
      </Card>
    </div>
  );
}
