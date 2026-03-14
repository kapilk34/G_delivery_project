import connectDb from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function name(req:NextRequest) {
    try {
        await connectDb()
        const {userId, location} = await req.json()
        if(!userId){
            return NextResponse.json(
                {message:"missing userId or loctaion"},
                {status:400}
            )
        }
        const user = await User.findByIdAndUpdate(userId,(location))
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