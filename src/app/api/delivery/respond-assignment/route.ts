import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignmentModel";
import axios from "axios";
import emitEventHandler from "@/lib/emitEventHandler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userRole = String(session.user.role || "").toLowerCase();
    if (userRole !== "deliveryboy") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { assignmentId, action } = await req.json();

    if (!assignmentId || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "assignmentId and valid action are required" },
        { status: 400 }
      );
    }

    const assignment = await DeliveryAssignment.findById(assignmentId).populate("order");
    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isInBroadcast = assignment.brodcastedTo.map((id) => id.toString()).includes(userId);

    if (action === "accept") {
      if (assignment.status !== "broadcasted") {
        if (assignment.status === "assigned" && assignment.assignedTo?.toString() === userId) {
          return NextResponse.json({ assignment }, { status: 200 });
        }

        return NextResponse.json(
          { message: "Assignment is no longer available for acceptance" },
          { status: 409 }
        );
      }

      if (!isInBroadcast) {
        return NextResponse.json(
          { message: "You are not eligible to accept this assignment" },
          { status: 403 }
        );
      }

      assignment.status = "assigned";
      assignment.assignedTo = userId;
      assignment.brodcastedTo = [];
      assignment.acceptedAt = new Date();
      await assignment.save();

      const order = assignment.order as {
        _id: string;
        user?: { socketId?: string | null };
        assignedDeliveryBoy?: string;
        orderStatus: "pending" | "Out of Delivery" | "delivered";
        save: () => Promise<void>;
        populate: (path: string) => Promise<{ user?: { socketId?: string | null } }>;
      };
      if (order) {
        order.assignedDeliveryBoy = userId;
        order.orderStatus = "Out of Delivery";
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
    }

    if (action === "reject") {
      if (!isInBroadcast) {
        return NextResponse.json(
          { message: "You are not part of this broadcast" },
          { status: 403 }
        );
      }

      assignment.brodcastedTo = assignment.brodcastedTo.filter((id) => id.toString() !== userId);
      await assignment.save();

      return NextResponse.json({ assignment }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: `respond assignment error ${error}` },
      { status: 500 }
    );
  }
}
