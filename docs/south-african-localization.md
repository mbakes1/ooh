# South African Market Localization

This document outlines the comprehensive South African market localization features implemented in the Digital Billboard Marketplace platform.

## Overview

The platform has been fully localized for the South African market, including currency formatting, location data, postal code validation, timezone handling, and localized terminology.

## Features Implemented

### 1. Currency Formatting (ZAR)

- **Display Format**: R 1,234.56 (with proper South African Rand formatting)
- **Input Format**: 1,234.56 (for form inputs)
- **Parsing**: Converts formatted strings back to numbers
- **Usage**: All pricing displays, form inputs, and calculations

```typescript
import { formatZAR, parseZAR } from "@/lib/utils";

// Display currency
const displayPrice = formatZAR(1500.75); // "R 1,500.75"

// Parse user input
const numericValue = parseZAR("R 1,500.75"); // 1500.75
```

### 2. Location Database

Complete database of South African provinces and cities:

- **9 Provinces**: All official South African provinces
- **70+ Cities**: Major cities and towns in each province
- **Validation**: Form validation ensures valid province/city combinations

**Provinces Included:**

- Eastern Cape
- Free State
- Gauteng
- KwaZulu-Natal
- Limpopo
- Mpumalanga
- Northern Cape
- North West
- Western Cape

### 3. Postal Code Validation

- **Format**: 4-digit South African postal codes (e.g., 8001)
- **Validation**: Ensures proper format and numeric values
- **Auto-formatting**: Removes non-numeric characters

```typescript
import { validateSouthAfricanPostalCode } from "@/lib/utils";

const isValid = validateSouthAfricanPostalCode("8001"); // true
const isInvalid = validateSouthAfricanPostalCode("800"); // false
```

### 4. Phone Number Validation

- **Formats Supported**:
  - International: +27 82 123 4567
  - Local: 082 123 4567
- **Validation**: Checks for proper South African mobile/landline formats
- **Auto-formatting**: Formats numbers with proper spacing

```typescript
import {
  validateSouthAfricanPhoneNumber,
  formatSouthAfricanPhoneNumber,
} from "@/lib/utils";

const isValid = validateSouthAfricanPhoneNumber("0821234567"); // true
const formatted = formatSouthAfricanPhoneNumber("0821234567"); // "082 123 4567"
```

### 5. Timezone Handling (SAST)

- **Timezone**: Africa/Johannesburg (South African Standard Time)
- **Date Formatting**: DD/MM/YYYY format
- **Time Formatting**: 24-hour format (HH:MM)
- **Current Time**: Always displays in SAST

```typescript
import { formatSASTDate, getCurrentSASTTime } from "@/lib/utils";

const currentTime = getCurrentSASTTime(); // Current time in SAST
const formattedDate = formatSASTDate(new Date()); // "15/01/2024"
```

### 6. Localized Terminology

South African-specific terminology throughout the platform:

- **Currency**: Rand (R, ZAR)
- **Mobile Phone**: Cell phone
- **Postal Code**: Postal code
- **Geographic Terms**: Province, suburb, township
- **Timezone**: SAST (South African Standard Time)

### 7. Address Formatting

Proper South African address format:

```
123 Main Street, Sandton, Johannesburg, Gauteng, 2196
```

## Implementation Details

### Core Localization File

All localization utilities are centralized in:

```
src/lib/localization/south-africa.ts
```

### React Hook

For easy use in components:

```typescript
import { useSouthAfricanLocalization } from '@/lib/hooks/use-south-african-localization';

function MyComponent() {
  const localization = useSouthAfricanLocalization();

  return (
    <div>
      <p>Price: {localization.formatCurrency(1500)}</p>
      <p>Time: {localization.formatDateTime(new Date())}</p>
    </div>
  );
}
```

### Validation Schemas

Updated Zod validation schemas include South African-specific validation:

```typescript
// Phone number validation
contactNumber: z.string().refine(
  (phone) => validateSouthAfricanPhoneNumber(phone),
  "Please enter a valid South African phone number"
);

// Postal code validation
postalCode: z.string()
  .optional()
  .refine(
    (code) => !code || validateSouthAfricanPostalCode(code),
    "Please enter a valid South African postal code (4 digits)"
  );
```

## Components Updated

The following components have been updated to use South African localization:

1. **Billboard Listing Form** - Currency, location, postal code
2. **Pricing Input** - ZAR formatting and South African market rates
3. **Location Input** - Province/city selection with validation
4. **Billboard Detail View** - Currency display, date formatting
5. **Search Results** - Price formatting
6. **Messaging System** - Date/time formatting
7. **User Profile** - Phone number validation

## Testing

Comprehensive tests are available in:

```
src/lib/localization/__tests__/south-africa.test.ts
```

Tests cover:

- Currency formatting and parsing
- Date/time formatting
- Phone number validation
- Postal code validation
- Address formatting
- Location data integrity

## Demo Page

A comprehensive demo showcasing all localization features is available at:

```
/localization-demo
```

This page demonstrates:

- Live currency formatting
- Date/time display in SAST
- Phone number validation
- Postal code validation
- Province/city selection
- Address formatting examples

## Market-Specific Features

### Pricing Guidelines

The platform includes South African market-specific pricing guidance:

- **High Traffic (Highways, CBD)**: R2,000 - R10,000+ per day
- **Medium Traffic (Suburbs)**: R500 - R2,000 per day
- **Low Traffic (Residential)**: R100 - R500 per day

### Business Hours

Default business hours consideration for South African Standard Time (SAST).

### Content Localization

All user-facing content uses South African English spelling and terminology.

## Future Enhancements

Potential future localization improvements:

1. **Multi-language Support**: Afrikaans, Zulu, Xhosa
2. **Regional Pricing**: Different pricing tiers by province
3. **Local Payment Methods**: EFT, SnapScan integration
4. **Holiday Calendar**: South African public holidays
5. **Weather Integration**: Local weather data for outdoor advertising

## Compliance

The localization implementation ensures compliance with:

- South African address formats
- POPIA (Protection of Personal Information Act) considerations
- Local business practices and terminology
- South African Reserve Bank currency regulations

## Support

For questions about the localization features, refer to:

1. The localization utilities documentation
2. Component-specific implementation examples
3. Test files for usage patterns
4. The demo page for live examples
