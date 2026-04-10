import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignmentModel";
import axios from "axios";
import emitEventHandler from "@/lib/emitEventHandler";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findById(session.user.id);
    const userRole = String(dbUser?.role || session.user.role || "").toLowerCase();
    if (userRole !== "deliveryboy") {
      return NextResponse.json({ message: `Forbidden: not a deliveryboy. Current role: ${userRole}` }, { status: 403 });
    }

    const { assignmentId } = await req.json();
    if (!assignmentId) {
      return NextResponse.json({ message: "assignmentId is required" }, { status: 400 });
    }

    const assignment = await DeliveryAssignment.findById(assignmentId).populate("order");
    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    if (assignment.status !== "assigned" || assignment.assignedTo?.toString() !== session.user.id) {
      return NextResponse.json({ message: "You cannot complete this assignment" }, { status: 403 });
    }

    assignment.status = "completed";
    await assignment.save();

    const order = assignment.order as {
      _id: string;
      user?: { socketId?: string | null };
      orderStatus: "pending" | "Out of Delivery" | "delivered";
      save: () => Promise<void>;
      populate: (path: string) => Promise<{ user?: { socketId?: string | null } }>;
    };
    if (order) {
      order.orderStatus = "delivered";
      await order.save();
      await order.populate("user");

      await emitEventHandler("order-status-update", { orderId: order._id, status: order.orderStatus });

      try {
        const user = order.user;
        if (user?.socketId) {
          const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:5000").replace(/\/+$/, "");
          await axios.post(`${socketUrl}/emit`, {
            socketId: user.socketId,
            eventName: "orderStatusUpdated",
            payload: { orderId: order._id, status: order.orderStatus }
          });
        }
      } catch (socketErr) {
        console.error("Socket emit failed:", socketErr);
      }
    }

    return NextResponse.json({ assignment }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `deliver order error ${error}` },
      { status: 500 }
    );
  }
}
