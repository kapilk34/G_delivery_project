import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { orderId, rating, suggestion } = await req.json();

        if (!orderId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ message: "Invalid review data" }, { status: 400 });
        }

        const order = await Order.findOne({ _id: orderId, user: session.user.id });
        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }
        if (order.orderStatus !== "delivered") {
            return NextResponse.json({ message: "Can only review delivered orders" }, { status: 400 });
        }
        if (order.isReviewed) {
            return NextResponse.json({ message: "Already reviewed" }, { status: 400 });
        }

        order.review = { rating, suggestion: suggestion?.trim() || "" };
        order.isReviewed = true;
        await order.save();

        return NextResponse.json({ message: "Review submitted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `Review error: ${error}` }, { status: 500 });
    }
}
