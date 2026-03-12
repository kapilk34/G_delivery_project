import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "You are not authorized" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Grocery ID is required" },
        { status: 400 }
      );
    }

    const grocery = await Grocery.findByIdAndDelete(id);

    if (!grocery) {
      return NextResponse.json(
        { message: "Grocery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Grocery deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return NextResponse.json(
      { message: "Error deleting grocery" },
      { status: 500 }
    );
  }
}
