import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

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
        }).populate("user").populate("items.grocery").sort({createdAt:-1})

        if(!orders || orders.length === 0){
            return NextResponse.json(
                { message: "Orders not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { orders },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: `get all orders error: ${error}` },
            { status: 500 }
        )

    }

}