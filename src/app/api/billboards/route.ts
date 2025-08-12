import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { billboardListingSchema } from "@/lib/validations/billboard";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a billboard owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: "Only billboard owners can create listings" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = billboardListingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create the billboard listing
    const billboard = await prisma.billboard.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: session.user.id,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        width: data.width,
        height: data.height,
        resolution: data.resolution,
        brightness: data.brightness,
        viewingDistance: data.viewingDistance,
        trafficLevel: data.trafficLevel,
        basePrice: data.basePrice,
        currency: "ZAR",
        status: "PENDING", // Default to pending for review
        images: {
          create: data.images.map((imageUrl, index) => ({
            imageUrl,
            isPrimary: index === 0, // First image is primary
            altText: `${data.title} - Image ${index + 1}`,
          })),
        },
      },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            businessName: true,
            contactNumber: true,
            verified: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Billboard listing created successfully",
        billboard,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating billboard listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const city = searchParams.get("city");
    const province = searchParams.get("province");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Record<string, unknown> = {};

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (province) {
      where.province = province;
    }

    if (minPrice || maxPrice) {
      where.basePrice = {} as { gte?: number; lte?: number };
      if (minPrice)
        (where.basePrice as { gte?: number; lte?: number }).gte =
          parseFloat(minPrice);
      if (maxPrice)
        (where.basePrice as { gte?: number; lte?: number }).lte =
          parseFloat(maxPrice);
    }

    if (status) {
      where.status = status;
    } else {
      // Default to only show active listings for public API
      where.status = "ACTIVE";
    }

    const [billboards, total] = await Promise.all([
      prisma.billboard.findMany({
        where,
        include: {
          images: {
            orderBy: { isPrimary: "desc" },
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.billboard.count({ where }),
    ]);

    return NextResponse.json({
      billboards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching billboards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
