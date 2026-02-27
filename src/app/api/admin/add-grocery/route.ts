import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import UploadOnCloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "You are not admin" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = Number(formData.get("price"));
    const file = formData.get("image") as File | null;

    let imageUrl = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      imageUrl = await UploadOnCloudinary(buffer);
    }

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Image upload failed" },
        { status: 400 }
      );
    }

    const grocery = await Grocery.create({
      name,
      price,
      category,
      unit,
      image: imageUrl,
    });

    return NextResponse.json(grocery, { status: 200 });

  } catch (error) {
    console.log("SERVER ERROR:", error);
    return NextResponse.json(
      { message: "Error in Grocery Adding" },
      { status: 500 }
    );
  }
}