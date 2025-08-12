import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const startOfThisMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(lastMonth);
    const endOfLastMonth = endOfMonth(lastMonth);

    // Get total counts
    const [totalUsers, totalBillboards, totalMessages] = await Promise.all([
      prisma.user.count(),
      prisma.billboard.count(),
      prisma.message.count(),
    ]);

    // Get this month's counts
    const [newUsersThisMonth, newBillboardsThisMonth, messagesThisMonth] =
      await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: startOfThisMonth,
            },
          },
        }),
        prisma.billboard.count({
          where: {
            createdAt: {
              gte: startOfThisMonth,
            },
          },
        }),
        prisma.message.count({
          where: {
            createdAt: {
              gte: startOfThisMonth,
            },
          },
        }),
      ]);

    // Get last month's counts for growth calculation
    const [usersLastMonth, billboardsLastMonth, messagesLastMonth] =
      await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        }),
        prisma.billboard.count({
          where: {
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        }),
        prisma.message.count({
          where: {
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        }),
      ]);

    // Calculate growth rates
    const userGrowthRate =
      usersLastMonth > 0
        ? ((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100
        : 0;
    const billboardGrowthRate =
      billboardsLastMonth > 0
        ? ((newBillboardsThisMonth - billboardsLastMonth) /
            billboardsLastMonth) *
          100
        : 0;
    const messageGrowthRate =
      messagesLastMonth > 0
        ? ((messagesThisMonth - messagesLastMonth) / messagesLastMonth) * 100
        : 0;

    // Get geographic distribution
    const provinceStats = await prisma.billboard.groupBy({
      by: ["province"],
      _count: {
        province: true,
      },
      orderBy: {
        _count: {
          province: "desc",
        },
      },
      take: 5,
    });

    const cityStats = await prisma.billboard.groupBy({
      by: ["city"],
      _count: {
        city: true,
      },
      orderBy: {
        _count: {
          city: "desc",
        },
      },
      take: 5,
    });

    const topProvinces = provinceStats.map((stat) => ({
      name: stat.province,
      count: stat._count.province,
      percentage: (stat._count.province / totalBillboards) * 100,
    }));

    const topCities = cityStats.map((stat) => ({
      name: stat.city,
      count: stat._count.city,
      percentage: (stat._count.city / totalBillboards) * 100,
    }));

    // Get monthly trends (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const [monthUsers, monthBillboards, monthMessages] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prisma.billboard.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prisma.message.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      ]);

      monthlyStats.push({
        month: format(monthStart, "MMM yyyy"),
        users: monthUsers,
        billboards: monthBillboards,
        messages: monthMessages,
        revenue: monthBillboards * 100, // Placeholder revenue calculation
      });
    }

    const analyticsData = {
      totalUsers,
      totalBillboards,
      totalMessages,
      totalRevenue: totalBillboards * 100, // Placeholder revenue calculation
      newUsersThisMonth,
      newBillboardsThisMonth,
      messagesThisMonth,
      revenueThisMonth: newBillboardsThisMonth * 100, // Placeholder revenue calculation
      userGrowthRate,
      billboardGrowthRate,
      messageGrowthRate,
      revenueGrowthRate: billboardGrowthRate, // Placeholder revenue growth
      topProvinces,
      topCities,
      monthlyStats,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
