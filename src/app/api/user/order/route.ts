import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/orderModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDb()
        const {userId, items, paymentMethod, totalAmmount, address} = await req.json()
        if(!userId || !items || !paymentMethod || !totalAmmount || !address){
            return NextResponse.json(
                {message:"please send all credentials"},
                {status:400}
            )
        }
        const user = await User.findById(userId)
        if(!user){
            return NextResponse.json(
                {message:"user not found"},
                {status:404}
            )
        }

        const newOrder = await Order.create({
            user:userId,
            items,
            paymentMethod,
            totalAmmount,
            address
        })

        await emitEventHandler("new-order", newOrder)

        return NextResponse.json(
            newOrder,
            {status:201}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`place order error ${error}`},
            {status:500}
        )
    }
}