import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignmentModel";
import Order from "@/models/orderModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import emitEventHandler from "@/lib/emitEventHandler";

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        await connectDb()
        const { orderId } =  await params
        const { status } = await req.json()
        const order = await Order.findById(orderId).populate("user")

        if (!order) {
            return NextResponse.json(
                { message: "Order not found" },
                { status: 404 }
            )
        }

        order.orderStatus = status
        let deliveryBoysPayload: any[] = []

        if (status === "Out of Delivery" && !order.assignment) {
            const { latitude, longitude } = order.address

            // Find nearby delivery boys within 10km
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $nearSphere: {
                        $geometry: {
                            type: "Point",
                            coordinates: [Number(longitude), Number(latitude)],
                        },
                        $maxDistance: 10000
                    }
                }
            })

            console.log(`Found ${nearByDeliveryBoys.length} delivery boys nearby for order`, orderId)

            // If no delivery boys found by location, try all delivery boys as fallback
            let candidates: any[] = []
            
            if (nearByDeliveryBoys.length === 0) {
                console.log("No delivery boys found by location, checking all delivery boys...")
                const allDeliveryBoys = await User.find({ role: "deliveryBoy" })
                console.log(`Total delivery boys in system: ${allDeliveryBoys.length}`)

                const nearByIds = allDeliveryBoys.map((b) => b._id)

                const busyIds = await DeliveryAssignment.find({
                    assignedTo: { $in: nearByIds },
                    status: "assigned"
                }).distinct("assignedTo")

                const busyIdSet = new Set(busyIds.map((b) => String(b)))

                const availableDeliveryBoys = allDeliveryBoys.filter(
                    (b) => !busyIdSet.has(String(b._id))
                )

                console.log(`Available delivery boys: ${availableDeliveryBoys.length}`)
                candidates = availableDeliveryBoys.map((b: any) => b._id)
            } else {
                const nearByIds = nearByDeliveryBoys.map((b) => b._id)

                const busyIds = await DeliveryAssignment.find({
                    assignedTo: { $in: nearByIds },
                    status: "assigned"
                }).distinct("assignedTo")

                const busyIdSet = new Set(busyIds.map((b) => String(b)))

                const availableDeliveryBoys = nearByDeliveryBoys.filter(
                    (b) => !busyIdSet.has(String(b._id))
                )

                console.log(`Available nearby delivery boys: ${availableDeliveryBoys.length}`)
                candidates = availableDeliveryBoys.map((b: any) => b._id)
            }

            if (candidates.length === 0) {
                await order.save()
                await emitEventHandler("order-status-update",{orderId:order._id,status:order.orderStatus})
                return NextResponse.json(
                    { message: "There are no available Delivery Boys. Please try again later." },
                    { status: 200 }
                )
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                brodcastedTo: candidates,
                status: "broadcasted"
            })

            order.assignment = deliveryAssignment._id

            // Get available boys data for response
            let availableDeliveryBoys = nearByDeliveryBoys.length > 0 
                ? nearByDeliveryBoys.filter((b) => candidates.map((c: any) => String(c)).includes(String(b._id)))
                : (await User.find({ _id: { $in: candidates } }))

            const deliveryBoysPayload = availableDeliveryBoys.map((b: any) => ({
                _id: b._id,
                name: b.name,
                phone: b.phone,
                latitude: b.location?.coordinates?.[1] || 0,
                longitude: b.location?.coordinates?.[0] || 0,
            }))

            await deliveryAssignment.populate("order")
        }

        await order.save()
        await order.populate("user")
        await emitEventHandler("order-status-update",{orderId:order._id,status:order.status})
        
        // Emit socket event to the user
        try {
            const user = order.user as any;
            if (user && user.socketId) {
                const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000").replace(/\/+$/, "");
                await axios.post(`${socketUrl}/emit`, {
                    socketId: user.socketId,
                    eventName: "orderStatusUpdated",
                    payload: { orderId: order._id, status: order.orderStatus }
                });
            }
        } catch (socketErr) {
            console.error("Socket emit failed:", socketErr);
        }

        return NextResponse.json(
            {
                order,
                assignment: order.assignment,
                availableBoys: deliveryBoysPayload
            },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { message: `update status error ${error}` },
            { status: 500 }
        )
    }
}