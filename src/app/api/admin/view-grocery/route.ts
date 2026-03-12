import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "You are not authorized" },
        { status: 403 }
      );
    }

    const groceries = await Grocery.find().sort({ createdAt: -1 });

    return NextResponse.json(groceries, { status: 200 });
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return NextResponse.json(
      { message: "Error fetching groceries" },
      { status: 500 }
    );
  }
}


