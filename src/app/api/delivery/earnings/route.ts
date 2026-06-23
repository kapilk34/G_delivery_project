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
            assignedTo: session.user.id,
            status: "completed"
        });

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayEarnings = assignments
            .filter((a) => a.updatedAt && new Date(a.updatedAt) >= today)
            .reduce((sum, a) => sum + (a.earningAmount || 40), 0);

        const weekEarnings = assignments
            .filter((a) => a.updatedAt && new Date(a.updatedAt) >= weekStart)
            .reduce((sum, a) => sum + (a.earningAmount || 40), 0);

        const monthEarnings = assignments
            .filter((a) => a.updatedAt && new Date(a.updatedAt) >= monthStart)
            .reduce((sum, a) => sum + (a.earningAmount || 40), 0);

        // Generate last 7 days breakdown
        const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i));
            const dayName = date.toLocaleDateString("en-IN", { weekday: "short" });
            
            const dayAssignments = assignments.filter((a) => {
                if (!a.updatedAt) return false;
                const d = new Date(a.updatedAt);
                return d.getDate() === date.getDate() &&
                    d.getMonth() === date.getMonth() &&
                    d.getFullYear() === date.getFullYear();
            });

            const dayEarnings = dayAssignments.reduce((sum, a) => sum + (a.earningAmount || 40), 0);
            const dayDeliveries = dayAssignments.length;

            return { day: dayName, amount: dayEarnings, deliveries: dayDeliveries };
        });

        return NextResponse.json({
            today: todayEarnings,
            thisWeek: weekEarnings,
            thisMonth: monthEarnings,
            dailyBreakdown,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { message: `earnings error ${error}` },
            { status: 500 }
        );
    }
}
