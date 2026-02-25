import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import UploadOnCloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        await connectDb()
        const session = await auth()
        if(session?.user?.role !== "admin"){
            return NextResponse.json(
                {message:"You are not admin"},
                {status:400}
            )
        }

        const formData = await req.formData()
        const name = formData.get("name") as string
        const category = formData.get("category") as string
        const unit = formData.get("unit") as string
        const price = formData.get("price") as string
        const file = formData.get("image") as Blob | null
        let imageUrl = ""
        if(file){
            imageUrl = await UploadOnCloudinary(file)
        }
        const grocery = await Grocery.create({
            name,price,category,unit,image:imageUrl
        })
        return NextResponse.json(
            grocery,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`Error in Grocery Adding ${error}`},
            {status:500}
        )
    }
}