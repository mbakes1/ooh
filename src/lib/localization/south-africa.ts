/**
 * South African Market Localization Utilities
 * Provides currency formatting, location data, postal code validation,
 * timezone handling, and localized content for the South African market.
 */

// South African Rand (ZAR) currency formatting
export const formatZAR = (amount: number): string => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format currency without symbol for input fields
export const formatZARInput = (amount: number): string => {
  return new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Parse ZAR string back to number
export const parseZAR = (zarString: string): number => {
  // Remove currency symbol, spaces, and commas
  const cleanString = zarString.replace(/[R\s,]/g, "");
  return parseFloat(cleanString) || 0;
};

// South African provinces with their major cities
export const southAfricanProvinces = [
  {
    name: "Eastern Cape",
    code: "EC",
    cities: [
      "Port Elizabeth (Gqeberha)",
      "East London",
      "Uitenhage",
      "Grahamstown (Makhanda)",
      "King William's Town",
      "Queenstown",
      "Mdantsane",
      "Bhisho",
    ],
  },
  {
    name: "Free State",
    code: "FS",
    cities: [
      "Bloemfontein",
      "Welkom",
      "Kroonstad",
      "Bethlehem",
      "Sasolburg",
      "Virginia",
      "Odendaalsrus",
      "Phuthaditjhaba",
    ],
  },
  {
    name: "Gauteng",
    code: "GP",
    cities: [
      "Johannesburg",
      "Pretoria (Tshwane)",
      "Soweto",
      "Ekurhuleni",
      "Vanderbijlpark",
      "Kempton Park",
      "Benoni",
      "Boksburg",
      "Germiston",
      "Roodepoort",
      "Sandton",
      "Midrand",
      "Centurion",
      "Randburg",
    ],
  },
  {
    name: "KwaZulu-Natal",
    code: "KZN",
    cities: [
      "Durban",
      "Pietermaritzburg",
      "Pinetown",
      "Chatsworth",
      "Umlazi",
      "Newcastle",
      "Ladysmith",
      "Empangeni",
      "Richards Bay",
      "Margate",
    ],
  },
  {
    name: "Limpopo",
    code: "LP",
    cities: [
      "Polokwane",
      "Tzaneen",
      "Thohoyandou",
      "Phalaborwa",
      "Musina",
      "Louis Trichardt (Makhado)",
      "Giyani",
      "Lebowakgomo",
    ],
  },
  {
    name: "Mpumalanga",
    code: "MP",
    cities: [
      "Nelspruit (Mbombela)",
      "Witbank (eMalahleni)",
      "Secunda",
      "Middelburg",
      "Standerton",
      "Ermelo",
      "Barberton",
      "White River",
    ],
  },
  {
    name: "Northern Cape",
    code: "NC",
    cities: [
      "Kimberley",
      "Upington",
      "Kuruman",
      "De Aar",
      "Springbok",
      "Alexander Bay",
      "Postmasburg",
      "Calvinia",
    ],
  },
  {
    name: "North West",
    code: "NW",
    cities: [
      "Mahikeng",
      "Rustenburg",
      "Klerksdorp",
      "Potchefstroom",
      "Brits",
      "Vryburg",
      "Lichtenburg",
      "Zeerust",
    ],
  },
  {
    name: "Western Cape",
    code: "WC",
    cities: [
      "Cape Town",
      "Stellenbosch",
      "Paarl",
      "George",
      "Mossel Bay",
      "Worcester",
      "Oudtshoorn",
      "Hermanus",
      "Swellendam",
      "Knysna",
      "Plettenberg Bay",
      "Bellville",
      "Somerset West",
    ],
  },
] as const;

// Get all cities as a flat array
export const getAllSouthAfricanCities = (): string[] => {
  return southAfricanProvinces.flatMap((province) => province.cities);
};

// Get cities for a specific province
export const getCitiesForProvince = (provinceName: string): string[] => {
  const province = southAfricanProvinces.find((p) => p.name === provinceName);
  return province ? [...province.cities] : [];
};

// South African postal code validation
export const validateSouthAfricanPostalCode = (postalCode: string): boolean => {
  // South African postal codes are 4 digits
  const postalCodeRegex = /^\d{4}$/;
  return postalCodeRegex.test(postalCode);
};

// Format South African postal code
export const formatSouthAfricanPostalCode = (postalCode: string): string => {
  // Remove any non-digit characters and ensure 4 digits
  const cleaned = postalCode.replace(/\D/g, "");
  return cleaned.slice(0, 4);
};

// South African Standard Time (SAST) utilities
export const SOUTH_AFRICAN_TIMEZONE = "Africa/Johannesburg";

// Format date/time for South African context
export const formatSASTDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: SOUTH_AFRICAN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

// Format date only for South African context
export const formatSASTDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: SOUTH_AFRICAN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

// Format time only for South African context
export const formatSASTTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: SOUTH_AFRICAN_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

// Get current SAST time
export const getCurrentSASTTime = (): Date => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: SOUTH_AFRICAN_TIMEZONE })
  );
};

// Convert UTC to SAST
export const convertToSAST = (utcDate: Date): Date => {
  return new Date(
    utcDate.toLocaleString("en-US", { timeZone: SOUTH_AFRICAN_TIMEZONE })
  );
};

// South African localized content and terminology
export const southAfricanTerminology = {
  // Currency
  currency: "Rand",
  currencySymbol: "R",
  currencyCode: "ZAR",

  // Common terms
  mobilePhone: "Cell phone",
  postcode: "Postal code",
  suburb: "Suburb",
  township: "Township",

  // Business terms
  company: "Company",
  business: "Business",
  vatNumber: "VAT Number",

  // Location terms
  province: "Province",
  city: "City",
  town: "Town",
  area: "Area",

  // Time terms
  timezone: "South African Standard Time (SAST)",
  timezoneAbbr: "SAST",
} as const;

// South African phone number validation and formatting
export const validateSouthAfricanPhoneNumber = (
  phoneNumber: string
): boolean => {
  // South African phone numbers: +27 followed by 9 digits
  // Mobile: +27 6x, 7x, 8x, or 9x followed by 8 digits
  // Landline: +27 1x, 2x, 3x, 4x, 5x followed by 8 digits
  const phoneRegex = /^(\+27|0)[1-9]\d{8}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ""));
};

// Format South African phone number
export const formatSouthAfricanPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.startsWith("27")) {
    // International format
    const number = cleaned.slice(2);
    return `+27 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
  } else if (cleaned.startsWith("0")) {
    // Local format
    const number = cleaned.slice(1);
    return `0${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
  }

  return phoneNumber; // Return as-is if format not recognized
};

// Common South African address formats
export const formatSouthAfricanAddress = (address: {
  streetAddress: string;
  suburb?: string;
  city: string;
  province: string;
  postalCode: string;
}): string => {
  const parts = [
    address.streetAddress,
    address.suburb,
    address.city,
    address.province,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
};

// Export province names only for backward compatibility
export const southAfricanProvinceNames = southAfricanProvinces.map(
  (p) => p.name
);
