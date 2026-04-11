import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "You are not authorized" },
        { status: 403 }
      );
    }

    // Get total products
    const totalProducts = await Grocery.countDocuments();

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get total revenue from delivered orders
    const revenueData = await Order.aggregate([
      {
        $match: { orderStatus: "delivered", isPaid: true }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmmount" }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    return NextResponse.json(
      {
        totalProducts,
        totalOrders,
        totalRevenue
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard stats" },
      { status: 500 }
    );
  }
}
