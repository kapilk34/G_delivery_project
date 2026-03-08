import connectDb from "@/lib/db";
import Order from "@/models/orderModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            mode:"payment",
            success_url:`${process.env.NEXT_BASE_URL}/user/orderSuccess`,
            cancel_url:`${process.env.NEXT_BASE_URL}/user/orderCancel`,
            line_items:[{
                price_data:{
                    currency:"inr",
                    product_data:{
                        name:"order payment",
                    },
                    unit_amount:totalAmmount*100
                },
                quantity:1
            }],
            metadata : {orderId:newOrder._id.toString()}
        })
        return NextResponse.json({url:session.url},{status:200})
    } catch (error) {
        return NextResponse.json(
            {message:`order payment error ${error}`},
            {status:500}
        )
    }
}