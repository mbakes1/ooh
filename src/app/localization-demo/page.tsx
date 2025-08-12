"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button"; // Kept for potential future use
import { Badge } from "@/components/ui/badge";
import { useSouthAfricanLocalization } from "@/lib/hooks/use-south-african-localization";

export default function LocalizationDemoPage() {
  const localization = useSouthAfricanLocalization();
  const [testAmount, setTestAmount] = useState(1500.75);
  const [testPhone, setTestPhone] = useState("0821234567");
  const [testPostalCode, setTestPostalCode] = useState("8001");
  const [selectedProvince, setSelectedProvince] = useState("Western Cape");

  const testDate = new Date();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          South African Localization Demo
        </h1>
        <p className="text-muted-foreground">
          Showcasing localized formatting for the South African market
        </p>
      </div>

      {/* Currency Formatting */}
      <Card>
        <CardHeader>
          <CardTitle>
            Currency Formatting ({localization.terminology.currencyCode})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Formatted Results</Label>
              <div className="space-y-1">
                <p>
                  <strong>Display:</strong>{" "}
                  {localization.formatCurrency(testAmount)}
                </p>
                <p>
                  <strong>Input:</strong>{" "}
                  {localization.formatCurrencyInput(testAmount)}
                </p>
                <p>
                  <strong>Symbol:</strong>{" "}
                  {localization.terminology.currencySymbol}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date and Time Formatting */}
      <Card>
        <CardHeader>
          <CardTitle>
            Date & Time Formatting ({localization.terminology.timezoneAbbr})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Time</Label>
              <p className="text-sm text-muted-foreground">
                Timezone: {localization.timezone}
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <strong>Date & Time:</strong>{" "}
                {localization.formatDateTime(testDate)}
              </p>
              <p>
                <strong>Date Only:</strong> {localization.formatDate(testDate)}
              </p>
              <p>
                <strong>Time Only:</strong> {localization.formatTime(testDate)}
              </p>
              <p>
                <strong>Relative:</strong>{" "}
                {localization.formatRelativeTime(testDate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Validation */}
      <Card>
        <CardHeader>
          <CardTitle>
            {localization.terminology.mobilePhone} Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="e.g., 082 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Validation Results</Label>
              <div className="space-y-1">
                <p>
                  <strong>Valid:</strong>{" "}
                  <Badge
                    variant={
                      localization.validatePhoneNumber(testPhone)
                        ? "default"
                        : "destructive"
                    }
                  >
                    {localization.validatePhoneNumber(testPhone) ? "Yes" : "No"}
                  </Badge>
                </p>
                <p>
                  <strong>Formatted:</strong>{" "}
                  {localization.formatPhoneNumber(testPhone)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Postal Code Validation */}
      <Card>
        <CardHeader>
          <CardTitle>{localization.terminology.postcode} Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal">Postal Code</Label>
              <Input
                id="postal"
                value={testPostalCode}
                onChange={(e) => setTestPostalCode(e.target.value)}
                placeholder="e.g., 8001"
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Validation Results</Label>
              <div className="space-y-1">
                <p>
                  <strong>Valid:</strong>{" "}
                  <Badge
                    variant={
                      localization.validatePostalCode(testPostalCode)
                        ? "default"
                        : "destructive"
                    }
                  >
                    {localization.validatePostalCode(testPostalCode)
                      ? "Yes"
                      : "No"}
                  </Badge>
                </p>
                <p>
                  <strong>Formatted:</strong>{" "}
                  {localization.formatPostalCode(testPostalCode)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Data */}
      <Card>
        <CardHeader>
          <CardTitle>South African Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Province</Label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {localization.provinces.map((province) => (
                  <option key={province.name} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Cities in {selectedProvince}</Label>
              <div className="max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {localization
                    .getProvinceCities(selectedProvince)
                    .map((city) => (
                      <Badge key={city} variant="outline" className="text-xs">
                        {city}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Total Provinces:</strong> {localization.provinces.length}{" "}
              | <strong>Total Cities:</strong>{" "}
              {localization.getAllCities().length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terminology */}
      <Card>
        <CardHeader>
          <CardTitle>South African Terminology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Currency:</strong> {localization.terminology.currency}
            </div>
            <div>
              <strong>Mobile Phone:</strong>{" "}
              {localization.terminology.mobilePhone}
            </div>
            <div>
              <strong>Postal Code:</strong> {localization.terminology.postcode}
            </div>
            <div>
              <strong>Province:</strong> {localization.terminology.province}
            </div>
            <div>
              <strong>Suburb:</strong> {localization.terminology.suburb}
            </div>
            <div>
              <strong>Township:</strong> {localization.terminology.township}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address Formatting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Sample South African Address</Label>
            <p className="p-3 bg-muted rounded-md">
              {localization.formatAddress({
                streetAddress: "123 Nelson Mandela Boulevard",
                suburb: "Sandton",
                city: "Johannesburg",
                province: "Gauteng",
                postalCode: "2196",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Price Range Example */}
      <Card>
        <CardHeader>
          <CardTitle>Price Range Formatting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Budget Range</Label>
              <p className="text-lg font-semibold">
                {localization.formatPriceRange(500, 2000)}
              </p>
              <p className="text-sm text-muted-foreground">
                Low to Medium Traffic
              </p>
            </div>
            <div>
              <Label>Premium Range</Label>
              <p className="text-lg font-semibold">
                {localization.formatPriceRange(2000, 10000)}
              </p>
              <p className="text-sm text-muted-foreground">
                High Traffic Areas
              </p>
            </div>
            <div>
              <Label>Fixed Price</Label>
              <p className="text-lg font-semibold">
                {localization.formatPriceRange(1500, 1500)}
              </p>
              <p className="text-sm text-muted-foreground">Standard Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
