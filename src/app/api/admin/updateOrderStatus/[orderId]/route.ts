import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignmentModel";
import Order from "@/models/orderModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

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

        order.status = status
        let deliveryBoysPayload: any[] = []

        if (status === "Out of Delivery" && !order.assignment) {
            const { latitude, longitude } = order.address

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

            const nearByIds = nearByDeliveryBoys.map((b) => b._id)

            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $in: ["brodcasted", "completed"] }
            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map((b) => String(b)))

            const availableDeliveryBoys = nearByDeliveryBoys.filter(
                (b) => !busyIdSet.has(String(b._id))
            )

            const candidates = availableDeliveryBoys.map((b: any) => b._id)

            if (candidates.length === 0) {
                await order.save()
                return NextResponse.json(
                    { message: "There is no available Delivery Boys" },
                    { status: 200 }
                )
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                brodcastedTo: candidates,
                status: "brodcasted"
            })

            order.assignment = deliveryAssignment._id

            deliveryBoysPayload = availableDeliveryBoys.map((b: any) => ({
                _id: b._id,
                name: b.name,
                phone: b.phone,
                latitude: b.location.coordinates[1],
                longitude: b.location.coordinates[0],
            }))

            await deliveryAssignment.populate("order")
        }

        await order.save()
        await order.populate("user")

        return NextResponse.json(
            {
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