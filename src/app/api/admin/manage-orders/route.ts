import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/orderModel";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const orders = await Order.find({}).populate("user").sort({createdAt:-1})
        return NextResponse.json(
            orders,{status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`manage orders error: ${error}`},
            {status:500}
        )
    }
}