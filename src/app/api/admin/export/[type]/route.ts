import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type: exportType } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Build date filter
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate + "T23:59:59.999Z"),
            },
          }
        : {};

    let data = "";
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${exportType}-export-${timestamp}.${format}`;

    switch (exportType) {
      case "users":
        // Apply filters
        const userFilters = {
          ...dateFilter,
          ...(searchParams.get("role") && {
            role: searchParams.get("role") as any,
          }),
          ...(searchParams.get("verified") && {
            verified: searchParams.get("verified") === "true",
          }),
          ...(searchParams.get("suspended") && {
            suspended: searchParams.get("suspended") === "true",
          }),
          ...(searchParams.get("location") && {
            location: {
              contains: searchParams.get("location") || undefined,
              mode: "insensitive" as any,
            },
          }),
        };

        const users = await prisma.user.findMany({
          where: userFilters,
          include: {
            _count: {
              select: {
                billboards: true,
                sentMessages: true,
                receivedMessages: true,
              },
            },
          },
        });

        const userHeaders = [
          "ID",
          "Name",
          "Email",
          "Role",
          "Business Name",
          "Contact Number",
          "Location",
          "Verified",
          "Suspended",
          "Billboards Count",
          "Messages Sent",
          "Messages Received",
          "Created At",
        ].join(",");

        const userRows = users.map((user) =>
          [
            user.id,
            `"${user.name}"`,
            user.email,
            user.role,
            `"${user.businessName || ""}"`,
            user.contactNumber || "",
            `"${user.location || ""}"`,
            user.verified || false,
            user.suspended || false,
            user._count.billboards,
            user._count.sentMessages,
            user._count.receivedMessages,
            user.createdAt.toISOString(),
          ].join(",")
        );

        data = [userHeaders, ...userRows].join("\n");
        break;

      case "billboards":
        // Apply filters
        const billboardFilters = {
          ...dateFilter,
          ...(searchParams.get("status") && {
            status: searchParams.get("status") as any,
          }),
          ...(searchParams.get("province") && {
            province: searchParams.get("province") || undefined,
          }),
          ...(searchParams.get("city") && {
            city: {
              contains: searchParams.get("city") || undefined,
              mode: "insensitive" as any,
            },
          }),
          ...(searchParams.get("min_price") && {
            basePrice: { gte: parseFloat(searchParams.get("min_price")!) },
          }),
          ...(searchParams.get("max_price") && {
            basePrice: { lte: parseFloat(searchParams.get("max_price")!) },
          }),
          ...(searchParams.get("traffic_level") && {
            trafficLevel: searchParams.get("traffic_level") as any,
          }),
        };

        const billboards = await prisma.billboard.findMany({
          where: billboardFilters,
          include: {
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        const billboardHeaders = [
          "ID",
          "Title",
          "Description",
          "Owner Name",
          "Owner Email",
          "Address",
          "City",
          "Province",
          "Postal Code",
          "Width",
          "Height",
          "Resolution",
          "Base Price",
          "Currency",
          "Status",
          "Created At",
        ].join(",");

        const billboardRows = billboards.map((billboard) =>
          [
            billboard.id,
            `"${billboard.title}"`,
            `"${billboard.description || ""}"`,
            `"${billboard.owner?.name || ""}"`,
            billboard.owner?.email || "",
            `"${billboard.address}"`,
            billboard.city,
            billboard.province,
            billboard.postalCode || "",
            billboard.width,
            billboard.height,
            billboard.resolution || "",
            billboard.basePrice,
            billboard.currency,
            billboard.status,
            billboard.createdAt.toISOString(),
          ].join(",")
        );

        data = [billboardHeaders, ...billboardRows].join("\n");
        break;

      case "messages":
        const messages = await prisma.message.findMany({
          where: dateFilter,
          include: {
            sender: {
              select: {
                name: true,
                email: true,
              },
            },
            recipient: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        const messageHeaders = [
          "ID",
          "Sender Name",
          "Sender Email",
          "Recipient Name",
          "Recipient Email",
          "Content",
          "Read At",
          "Created At",
        ].join(",");

        const messageRows = messages.map((message) =>
          [
            message.id,
            `"${message.sender?.name || ""}"`,
            message.sender?.email || "",
            `"${message.recipient?.name || ""}"`,
            message.recipient?.email || "",
            `"${message.content.substring(0, 100)}..."`, // Truncate content
            message.readAt?.toISOString() || "",
            message.createdAt.toISOString(),
          ].join(",")
        );

        data = [messageHeaders, ...messageRows].join("\n");
        break;

      case "analytics":
        // Export comprehensive analytics data
        const analyticsResponse = await fetch(
          `${request.nextUrl.origin}/api/admin/analytics`,
          {
            headers: {
              Cookie: request.headers.get("cookie") || "",
            },
          }
        );

        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const analytics = await analyticsResponse.json();

        const analyticsHeaders = ["Metric", "Value", "Growth Rate"].join(",");

        const analyticsRows = [
          [
            "Total Users",
            analytics.totalUsers,
            `${analytics.userGrowthRate.toFixed(1)}%`,
          ],
          [
            "Total Billboards",
            analytics.totalBillboards,
            `${analytics.billboardGrowthRate.toFixed(1)}%`,
          ],
          [
            "Total Messages",
            analytics.totalMessages,
            `${analytics.messageGrowthRate.toFixed(1)}%`,
          ],
          [
            "Total Revenue",
            analytics.totalRevenue,
            `${analytics.revenueGrowthRate.toFixed(1)}%`,
          ],
          ["New Users This Month", analytics.newUsersThisMonth, ""],
          ["New Billboards This Month", analytics.newBillboardsThisMonth, ""],
          ["Messages This Month", analytics.messagesThisMonth, ""],
          ["Revenue This Month", analytics.revenueThisMonth, ""],
        ].map((row) => row.join(","));

        data = [analyticsHeaders, ...analyticsRows].join("\n");
        break;

      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 }
        );
    }

    // Determine content type based on format
    let contentType = "text/csv";
    if (format === "xlsx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (format === "pdf") {
      contentType = "application/pdf";
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
