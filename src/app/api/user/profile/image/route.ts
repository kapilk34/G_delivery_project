import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/userModel";
import UploadOnCloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { message: "User is not authenticated" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const imageUrl = await UploadOnCloudinary(buffer);

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Image upload failed" },
        { status: 400 }
      );
    }

    // Update user image in database
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { image: imageUrl } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error("Profile Image Upload Error:", error);
    return NextResponse.json(
      { message: `Profile image upload failed: ${error.message || error}` },
      { status: 500 }
    );
  }
}
