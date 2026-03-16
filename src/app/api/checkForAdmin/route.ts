import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await User.find({role:"admin"})
        if(user.length > 0){
            return NextResponse.json(
                {adminExist : true},
                {status:200}
            )
        } else{
            return NextResponse.json(
                {adminExist : false},
                {status:200}
            )
        }
    } catch (error) {
        return NextResponse.json(
            {message:`Check for the admin error ${error}`},
            {status:500}
        )
    }
}