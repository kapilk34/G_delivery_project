import { auth } from "@/auth";
import connectDb from "@/lib/db";
import deliveryAssignment from "@/models/deliveryAssignmentModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const assignments = await deliveryAssignment.find({
            $or: [
                { brodcastedTo: session.user.id, status: "broadcasted" },
                { assignedTo: session.user.id, status: { $in: ["assigned", "completed"] } }
            ]
        }).populate("order");
        return NextResponse.json(assignments, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {message : `get assignment error ${error}`},
            {status:500}
        )
    }
}