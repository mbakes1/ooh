import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bulkActionSchema = z.object({
  action: z.enum(["verify", "suspend", "delete", "approve", "reject"]),
  entityType: z.enum(["users", "billboards"]),
  entityIds: z.array(z.string()),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, entityType, entityIds, reason } =
      bulkActionSchema.parse(body);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    if (entityType === "users") {
      for (const userId of entityIds) {
        try {
          switch (action) {
            case "verify":
              await prisma.user.update({
                where: { id: userId },
                data: { verified: true },
              });
              results.success++;
              break;

            case "suspend":
              await prisma.user.update({
                where: { id: userId },
                data: {
                  suspended: true,
                  suspendedAt: new Date(),
                },
              });
              results.success++;
              break;

            case "delete":
              await prisma.user.delete({
                where: { id: userId },
              });
              results.success++;
              break;

            default:
              results.failed++;
              results.errors.push(`Invalid action for user ${userId}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to ${action} user ${userId}: ${error}`);
        }
      }
    } else if (entityType === "billboards") {
      for (const billboardId of entityIds) {
        try {
          switch (action) {
            case "approve":
              await prisma.billboard.update({
                where: { id: billboardId },
                data: {
                  status: "ACTIVE",
                  approvedAt: new Date(),
                  approvedBy: session.user.id,
                },
              });
              results.success++;
              break;

            case "reject":
              await prisma.billboard.update({
                where: { id: billboardId },
                data: {
                  status: "REJECTED",
                  rejectedAt: new Date(),
                  rejectedBy: session.user.id,
                  rejectionReason: reason || "Bulk rejection",
                },
              });
              results.success++;
              break;

            case "suspend":
              await prisma.billboard.update({
                where: { id: billboardId },
                data: {
                  status: "SUSPENDED",
                  suspendedAt: new Date(),
                  suspendedBy: session.user.id,
                },
              });
              results.success++;
              break;

            default:
              results.failed++;
              results.errors.push(
                `Invalid action for billboard ${billboardId}`
              );
          }
        } catch (error) {
          results.failed++;
          results.errors.push(
            `Failed to ${action} billboard ${billboardId}: ${error}`
          );
        }
      }
    }

    return NextResponse.json({
      message: `Bulk ${action} completed`,
      results,
    });
  } catch (error) {
    console.error("Error in bulk action:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
