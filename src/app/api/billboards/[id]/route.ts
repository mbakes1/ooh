import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { billboardListingSchema } from "@/lib/validations/billboard";
import { UserRole } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const billboard = await prisma.billboard.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
        },
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

    if (!billboard) {
      return NextResponse.json(
        { error: "Billboard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ billboard });
  } catch (error) {
    console.error("Error fetching billboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: "Only billboard owners can update listings" },
        { status: 403 }
      );
    }

    // Check if billboard exists and belongs to the user
    const existingBillboard = await prisma.billboard.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingBillboard) {
      return NextResponse.json(
        { error: "Billboard not found" },
        { status: 404 }
      );
    }

    if (existingBillboard.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own billboards" },
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

    // Update the billboard listing
    const billboard = await prisma.billboard.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
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
        // Update images if provided
        ...(data.images && {
          images: {
            deleteMany: {},
            create: data.images.map((imageUrl, index) => ({
              imageUrl,
              isPrimary: index === 0,
              altText: `${data.title} - Image ${index + 1}`,
            })),
          },
        }),
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

    return NextResponse.json({
      message: "Billboard listing updated successfully",
      billboard,
    });
  } catch (error) {
    console.error("Error updating billboard listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: "Only billboard owners can delete listings" },
        { status: 403 }
      );
    }

    // Check if billboard exists and belongs to the user
    const existingBillboard = await prisma.billboard.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingBillboard) {
      return NextResponse.json(
        { error: "Billboard not found" },
        { status: 404 }
      );
    }

    if (existingBillboard.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own billboards" },
        { status: 403 }
      );
    }

    // Delete the billboard (cascade will handle related records)
    await prisma.billboard.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Billboard listing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting billboard listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
