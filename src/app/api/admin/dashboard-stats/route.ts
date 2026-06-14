import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "You are not authorized" }, { status: 403 });
    }

    const totalProducts = await Grocery.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { orderStatus: "delivered", isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmmount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Last 7 days weekly data
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1=Sun,2=Mon,...7=Sat
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmmount" },
        },
      },
    ]);

    // Build a map: dayOfWeek (1-7) -> { orders, revenue }
    const dayMap: Record<number, { orders: number; revenue: number }> = {};
    for (const d of weeklyRaw) {
      dayMap[d._id] = { orders: d.orders, revenue: d.revenue };
    }

    // Generate last 7 days in order
    const weeklyOrders: number[] = [];
    const weeklyRevenue: number[] = [];
    const weeklyLabels: string[] = [];
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dow = d.getDay() + 1; // JS 0=Sun -> MongoDB 1=Sun
      weeklyLabels.push(DAY_NAMES[d.getDay()]);
      weeklyOrders.push(dayMap[dow]?.orders ?? 0);
      weeklyRevenue.push(dayMap[dow]?.revenue ?? 0);
    }

    return NextResponse.json(
      { totalProducts, totalOrders, totalRevenue, weeklyLabels, weeklyOrders, weeklyRevenue },
      { status: 200 }
    );
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return NextResponse.json({ message: "Error fetching dashboard stats" }, { status: 500 });
  }
}
