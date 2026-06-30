import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";
import Grocery from "@/models/groceryModel";
import User from "@/models/userModel";

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        if(!session?.user?.id){
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const orders = await Order.find({
            user: session.user.id
        }).populate("user").populate("items.grocery").populate({ path: "assignedDeliveryBoy", select: "location name socketId" }).sort({createdAt:-1})

        return NextResponse.json(
            { orders: orders || [] },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: `get all orders error: ${error}` },
            { status: 500 }
        )

    }

}