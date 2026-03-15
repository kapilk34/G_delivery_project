import connectDb from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDb()
        const {userId, location} = await req.json()
        if(!userId || !location){
            return NextResponse.json(
                {message:"missing userId or location"},
                {status:400}
            )
        }
        const user = await User.findByIdAndUpdate(userId, { location }, { new: true })
        if(!user){
            return NextResponse.json(
                {message:"user not found"},
                {status:404}
            )
        }
        return NextResponse.json(
            {message:"Location updated successfully!"},
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`update location error ${error}`},
            {status:500}
        )
    }
}