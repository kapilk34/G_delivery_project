import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { message: "User is not authenticated" },
        { status: 401 }
      );
    }

    const { name, mobile, membershipStatus, image } = await req.json();

    // Find and update the user basic profile
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name,
          mobile,
          membershipStatus,
          image,
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error updating profile: ${error.message || error}` },
      { status: 500 }
    );
  }
}
