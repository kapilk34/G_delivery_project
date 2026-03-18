import { auth } from "@/auth";
import connectDb from "@/lib/db";
import deliveryAssignment from "@/models/deliveryAssignmentModel";
import Order from "@/models/orderModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();
        const session = await auth()
        const assignments = await deliveryAssignment.find({
            brodcastedTo : session?.user?.id,
            status : "broadcasted"
        }).populate("order")
        return NextResponse.json(
            assignments,{status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message : `get assignment error ${error}`},
            {status:500}
        )
    }
}