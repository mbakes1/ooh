/**
 * React hook for South African localization utilities
 * Provides easy access to currency formatting, date/time formatting,
 * and other South African market-specific utilities
 */

import { useCallback } from "react";
import {
  formatZAR,
  formatZARInput,
  parseZAR,
  formatSASTDateTime,
  formatSASTDate,
  formatSASTTime,
  getCurrentSASTTime,
  convertToSAST,
  formatSouthAfricanPhoneNumber,
  formatSouthAfricanAddress,
  validateSouthAfricanPhoneNumber,
  validateSouthAfricanPostalCode,
  formatSouthAfricanPostalCode,
  southAfricanTerminology,
  southAfricanProvinces,
  getCitiesForProvince,
  getAllSouthAfricanCities,
} from "@/lib/localization/south-africa";

export function useSouthAfricanLocalization() {
  // Currency formatting
  const formatCurrency = useCallback((amount: number): string => {
    return formatZAR(amount);
  }, []);

  const formatCurrencyInput = useCallback((amount: number): string => {
    return formatZARInput(amount);
  }, []);

  const parseCurrency = useCallback((zarString: string): number => {
    return parseZAR(zarString);
  }, []);

  // Date and time formatting
  const formatDateTime = useCallback((date: Date): string => {
    return formatSASTDateTime(date);
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return formatSASTDate(date);
  }, []);

  const formatTime = useCallback((date: Date): string => {
    return formatSASTTime(date);
  }, []);

  const getCurrentTime = useCallback((): Date => {
    return getCurrentSASTTime();
  }, []);

  const convertUTCToLocal = useCallback((utcDate: Date): Date => {
    return convertToSAST(utcDate);
  }, []);

  // Phone number utilities
  const formatPhoneNumber = useCallback((phoneNumber: string): string => {
    return formatSouthAfricanPhoneNumber(phoneNumber);
  }, []);

  const validatePhoneNumber = useCallback((phoneNumber: string): boolean => {
    return validateSouthAfricanPhoneNumber(phoneNumber);
  }, []);

  // Address utilities
  const formatAddress = useCallback(
    (address: {
      streetAddress: string;
      suburb?: string;
      city: string;
      province: string;
      postalCode: string;
    }): string => {
      return formatSouthAfricanAddress(address);
    },
    []
  );

  // Postal code utilities
  const validatePostalCode = useCallback((postalCode: string): boolean => {
    return validateSouthAfricanPostalCode(postalCode);
  }, []);

  const formatPostalCode = useCallback((postalCode: string): string => {
    return formatSouthAfricanPostalCode(postalCode);
  }, []);

  // Location utilities
  const getProvinceCities = useCallback((provinceName: string): string[] => {
    return getCitiesForProvince(provinceName);
  }, []);

  const getAllCities = useCallback((): string[] => {
    return getAllSouthAfricanCities();
  }, []);

  // Relative time formatting in South African context
  const formatRelativeTime = useCallback(
    (date: Date): string => {
      const now = getCurrentSASTTime();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) {
        return "Just now";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
      } else if (diffInMinutes < 1440) {
        // 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      } else if (diffInMinutes < 10080) {
        // 7 days
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} day${days !== 1 ? "s" : ""} ago`;
      } else {
        return formatDate(date);
      }
    },
    [formatDate]
  );

  // Business hours formatting (common South African business hours)
  const formatBusinessHours = useCallback(
    (startTime: string, endTime: string): string => {
      return `${startTime} - ${endTime} (${southAfricanTerminology.timezoneAbbr})`;
    },
    []
  );

  // Price range formatting for South African market
  const formatPriceRange = useCallback(
    (minPrice: number, maxPrice: number): string => {
      if (minPrice === maxPrice) {
        return formatZAR(minPrice);
      }
      return `${formatZAR(minPrice)} - ${formatZAR(maxPrice)}`;
    },
    []
  );

  return {
    // Currency
    formatCurrency,
    formatCurrencyInput,
    parseCurrency,

    // Date and time
    formatDateTime,
    formatDate,
    formatTime,
    getCurrentTime,
    convertUTCToLocal,
    formatRelativeTime,
    formatBusinessHours,

    // Phone and address
    formatPhoneNumber,
    validatePhoneNumber,
    formatAddress,

    // Postal code
    validatePostalCode,
    formatPostalCode,

    // Location
    getProvinceCities,
    getAllCities,

    // Pricing
    formatPriceRange,

    // Constants
    terminology: southAfricanTerminology,
    provinces: southAfricanProvinces,
    timezone: "Africa/Johannesburg",
  };
}

export type SouthAfricanLocalization = ReturnType<
  typeof useSouthAfricanLocalization
>;
