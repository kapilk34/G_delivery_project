import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "@/models/userModel";

export async function POST(req:NextRequest) {
    try {
        await connectDb();
        const {name, email, password} = await req.json();
        
        // Validation
        if(!name || !email || !password){
            return NextResponse.json(
                {message:"All fields are required"},
                {status:400}
            )
        }

        if(password.length < 6){
            return NextResponse.json(
                {message:"password must be at least 6 characters"},
                {status:400}
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return NextResponse.json(
                {message:"Invalid email format"},
                {status:400}
            )
        }

        const existUser = await User.findOne({email});
        if(existUser){
            return NextResponse.json(
                {message:"Email already registered!"},
                {status:400}
            )
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await User.create({
            name, email, password:hashedPassword
        })
        return NextResponse.json(
            {message:"User created successfully!", user},
            {status:200}
        )
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            {message:`Registration error: ${error instanceof Error ? error.message : "Unknown error"}`},
            {status:500}
        )
    }
}