import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignmentModel";
import Order from "@/models/orderModel";
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
    const userRole = dbUser?.role || session.user.role;
    if (userRole !== "deliveryBoy") {
      return NextResponse.json({ message: `Forbidden: not a deliveryBoy. Current role: ${userRole}` }, { status: 403 });
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
      return NextResponse.json({ message: "You cannot update this assignment" }, { status: 403 });
    }

    const order = await Order.findById(assignment.order._id).populate("user");
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    order.isPickedUp = true;
    order.pickedUpAt = new Date();
    await order.save();

    await emitEventHandler("order-status-update", { orderId: order._id, status: "Out of Delivery", isPickedUp: true });

    try {
      const user = order.user as any;
      if (user?.socketId) {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER;
        if (!socketUrl) throw new Error("SOCKET_SERVER_URL is not configured");
        await axios.post(`${socketUrl.replace(/\/+$/, "")}/emit`, {
          socketId: user.socketId,
          eventName: "orderStatusUpdated",
          payload: { orderId: order._id, status: "Out of Delivery", isPickedUp: true }
        });
      }
    } catch (socketErr) {
      console.error("Socket emit failed:", socketErr);
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `pickup order error ${error}` },
      { status: 500 }
    );
  }
}
