"use client";

import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
// Select components removed - using Combobox instead
import { southAfricanProvinces } from "@/lib/validations/billboard";
import { cn, southAfricanTerminology } from "@/lib/utils";
import {
  getCitiesForProvince,
  formatSouthAfricanPostalCode,
  validateSouthAfricanPostalCode,
} from "@/lib/localization/south-africa";

interface LocationInputProps {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onProvinceChange: (province: string) => void;
  onPostalCodeChange: (postalCode: string) => void;
  className?: string;
}

// Get South African cities data from localization
// const getSouthAfricanCities = (): Record<string, string[]> => {
//   const cities: Record<string, string[]> = {};
//   provincesData.forEach((province) => {
//     cities[province.name] = [...province.cities];
//   });
//   return cities;
// };

// const southAfricanCities = getSouthAfricanCities(); // Kept for potential future use

export function LocationInput({
  address,
  city,
  province,
  postalCode,
  onAddressChange,
  onCityChange,
  onProvinceChange,
  onPostalCodeChange,
  className,
}: LocationInputProps) {
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  // const [, setShowCitySuggestions] = useState(false);

  // Update city suggestions when province changes
  useEffect(() => {
    if (province) {
      const cities = getCitiesForProvince(province);
      setCitySuggestions(cities);
    } else {
      setCitySuggestions([]);
    }
    // Clear city when province changes
    if (city && province) {
      const cities = getCitiesForProvince(province);
      if (!cities.includes(city)) {
        onCityChange("");
      }
    }
  }, [province, city, onCityChange]);

  // Convert provinces to combobox options
  const provinceOptions: ComboboxOption[] = southAfricanProvinces.map(
    (prov) => ({
      value: prov,
      label: prov,
    })
  );

  // Convert cities to combobox options
  const cityOptions: ComboboxOption[] = citySuggestions.map((cityName) => ({
    value: cityName,
    label: cityName,
  }));

  // Mock address suggestions (in a real app, this would use Google Places API or similar)
  const getAddressSuggestions = (query: string) => {
    if (query.length < 3) return [];

    // Mock suggestions based on common South African street names
    const mockSuggestions = [
      `${query} Street, ${city || "City"}, ${province || "Province"}`,
      `${query} Avenue, ${city || "City"}, ${province || "Province"}`,
      `${query} Road, ${city || "City"}, ${province || "Province"}`,
      `${query} Drive, ${city || "City"}, ${province || "Province"}`,
    ].filter(() => city && province);

    return mockSuggestions.slice(0, 5);
  };

  const handleAddressChange = (value: string) => {
    onAddressChange(value);
    const suggestions = getAddressSuggestions(value);
    setAddressSuggestions(suggestions);
    setShowAddressSuggestions(suggestions.length > 0);
  };

  // const handleCitySearch = (value: string) => {
  //   onCityChange(value);
  //   if (value.length > 0 && citySuggestions.length > 0) {
  //     const filtered = citySuggestions.filter((cityName) =>
  //       cityName.toLowerCase().includes(value.toLowerCase())
  //     );
  //     setShowCitySuggestions(filtered.length > 0);
  //   } else {
  //     setShowCitySuggestions(false);
  //   }
  // };

  const selectAddressSuggestion = (suggestion: string) => {
    onAddressChange(suggestion);
    setShowAddressSuggestions(false);
  };

  // const selectCitySuggestion = (cityName: string) => {
  //   onCityChange(cityName);
  //   setShowCitySuggestions(false);
  // };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Location Details</h3>
      </div>

      {/* Province Selection */}
      <div className="space-y-2">
        <Label htmlFor="province">Province *</Label>
        <Combobox
          options={provinceOptions}
          value={province}
          onValueChange={onProvinceChange}
          placeholder="Select a province"
          searchPlaceholder="Search provinces..."
          emptyText="No province found."
        />
      </div>

      {/* City Selection */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <Combobox
          options={cityOptions}
          value={city}
          onValueChange={onCityChange}
          placeholder={province ? "Select a city" : "Select a province first"}
          searchPlaceholder="Search cities..."
          emptyText={
            province ? "No city found." : "Please select a province first."
          }
          disabled={!province || cityOptions.length === 0}
        />
      </div>

      {/* Address Input with Suggestions */}
      <div className="space-y-2 relative">
        <Label htmlFor="address">Street Address *</Label>
        <div className="relative">
          <Input
            id="address"
            type="text"
            placeholder="Enter street address"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onBlur={() =>
              setTimeout(() => setShowAddressSuggestions(false), 200)
            }
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {showAddressSuggestions && (
          <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto">
            {addressSuggestions.map((suggestionText, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 rounded-none"
                onClick={() => selectAddressSuggestion(suggestionText)}
              >
                {suggestionText}
              </Button>
            ))}
          </Card>
        )}
      </div>

      {/* Postal Code */}
      <div className="space-y-2">
        <Label htmlFor="postalCode">{southAfricanTerminology.postcode}</Label>
        <Input
          id="postalCode"
          type="text"
          placeholder="e.g., 8001"
          value={postalCode}
          onChange={(e) => {
            const formatted = formatSouthAfricanPostalCode(e.target.value);
            onPostalCodeChange(formatted);
          }}
          maxLength={4}
          pattern="\d{4}"
          className={
            postalCode && !validateSouthAfricanPostalCode(postalCode)
              ? "border-red-500"
              : ""
          }
        />
        <p className="text-sm text-gray-500">
          Enter a 4-digit South African{" "}
          {southAfricanTerminology.postcode.toLowerCase()}
        </p>
        {postalCode && !validateSouthAfricanPostalCode(postalCode) && (
          <p className="text-sm text-red-500">
            Please enter a valid 4-digit{" "}
            {southAfricanTerminology.postcode.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}
