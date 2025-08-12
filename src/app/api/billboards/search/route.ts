import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BillboardStatus, TrafficLevel } from "@prisma/client";

export interface SearchFilters {
  query?: string;
  city?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  trafficLevel?: TrafficLevel;
  sortBy?: "price" | "location" | "date" | "relevance";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const filters: SearchFilters = {
      query: searchParams.get("query") || undefined,
      city: searchParams.get("city") || undefined,
      province: searchParams.get("province") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      minWidth: searchParams.get("minWidth")
        ? parseInt(searchParams.get("minWidth")!)
        : undefined,
      maxWidth: searchParams.get("maxWidth")
        ? parseInt(searchParams.get("maxWidth")!)
        : undefined,
      minHeight: searchParams.get("minHeight")
        ? parseInt(searchParams.get("minHeight")!)
        : undefined,
      maxHeight: searchParams.get("maxHeight")
        ? parseInt(searchParams.get("maxHeight")!)
        : undefined,
      trafficLevel:
        (searchParams.get("trafficLevel") as TrafficLevel) || undefined,
      sortBy:
        (searchParams.get("sortBy") as
          | "price"
          | "location"
          | "date"
          | "relevance") || "date",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
    };

    const skip = ((filters.page || 1) - 1) * (filters.limit || 12);

    // Build where clause for filtering
    const where: Record<string, unknown> = {
      status: BillboardStatus.ACTIVE, // Only show active listings
    };

    // Full-text search across title, description, address, and city
    if (filters.query) {
      where.OR = [
        {
          title: {
            contains: filters.query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: filters.query,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: filters.query,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: filters.query,
            mode: "insensitive",
          },
        },
        {
          province: {
            contains: filters.query,
            mode: "insensitive",
          },
        },
      ];
    }

    // Location filters
    if (filters.city) {
      where.city = {
        contains: filters.city,
        mode: "insensitive",
      };
    }

    if (filters.province) {
      where.province = filters.province;
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      where.basePrice = {} as { gte?: number; lte?: number };
      if (filters.minPrice) {
        (where.basePrice as { gte?: number; lte?: number }).gte =
          filters.minPrice;
      }
      if (filters.maxPrice) {
        (where.basePrice as { gte?: number; lte?: number }).lte =
          filters.maxPrice;
      }
    }

    // Dimension filters
    if (filters.minWidth || filters.maxWidth) {
      where.width = {} as { gte?: number; lte?: number };
      if (filters.minWidth) {
        (where.width as { gte?: number; lte?: number }).gte = filters.minWidth;
      }
      if (filters.maxWidth) {
        (where.width as { gte?: number; lte?: number }).lte = filters.maxWidth;
      }
    }

    if (filters.minHeight || filters.maxHeight) {
      where.height = {} as { gte?: number; lte?: number };
      if (filters.minHeight) {
        (where.height as { gte?: number; lte?: number }).gte =
          filters.minHeight;
      }
      if (filters.maxHeight) {
        (where.height as { gte?: number; lte?: number }).lte =
          filters.maxHeight;
      }
    }

    // Traffic level filter
    if (filters.trafficLevel) {
      where.trafficLevel = filters.trafficLevel;
    }

    // Build order by clause
    let orderBy: Record<string, unknown> | Record<string, unknown>[] = {};
    switch (filters.sortBy) {
      case "price":
        orderBy = { basePrice: filters.sortOrder };
        break;
      case "location":
        orderBy = [
          { city: filters.sortOrder },
          { province: filters.sortOrder },
        ];
        break;
      case "date":
        orderBy = { createdAt: filters.sortOrder };
        break;
      case "relevance":
      default:
        // For relevance, we'll use creation date as fallback
        orderBy = { createdAt: "desc" };
        break;
    }

    // Execute search query
    const [billboards, total] = await Promise.all([
      prisma.billboard.findMany({
        where,
        include: {
          images: {
            orderBy: { isPrimary: "desc" },
            take: 1, // Only get primary image for search results
          },
          owner: {
            select: {
              id: true,
              name: true,
              businessName: true,
              verified: true,
            },
          },
        },
        orderBy,
        skip,
        take: filters.limit,
      }),
      prisma.billboard.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / (filters.limit || 12));
    const hasMore = (filters.page || 1) < totalPages;

    return NextResponse.json({
      billboards,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 12,
        total,
        totalPages,
        hasMore,
      },
      filters: {
        ...filters,
        resultsCount: billboards.length,
      },
    });
  } catch (error) {
    console.error("Error searching billboards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
