import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "You are not authorized" },
        { status: 403 }
      );
    }

    // Get user income data grouped by delivery area
    const userIncomeData = await Order.aggregate([
      {
        $match: { orderStatus: "delivered", isPaid: true }
      },
      {
        $group: {
          _id: "$address.city",
          totalIncome: { $sum: "$totalAmmount" },
          totalOrders: { $sum: 1 },
          averageOrder: {
            $avg: "$totalAmmount"
          }
        }
      },
      {
        $sort: { totalIncome: -1 }
      }
    ]);

    // Get top users by revenue
    const topUsersByRevenue = await Order.aggregate([
      {
        $match: { orderStatus: "delivered", isPaid: true }
      },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalAmmount" },
          orderCount: { $sum: 1 },
          averageOrderValue: {
            $avg: "$totalAmmount"
          },
          city: { $first: "$address.city" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          _id: 1,
          totalSpent: 1,
          orderCount: 1,
          averageOrderValue: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          city: { $ifNull: ["$city", "Unknown"] }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return NextResponse.json(
      {
        userIncomeByArea: userIncomeData,
        topUsersByRevenue: topUsersByRevenue
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
