import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        await connectDB();

        // ✅ Verify user authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return NextResponse.json(
                { success: false, message: "Invalid token" },
                { status: 401 }
            );
        }

        const userId = decoded.id;

        // ✅ Get request body
        const { orderId, reason } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            );
        }

        // ✅ Fetch the order
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // ✅ Verify order belongs to the user
        if (order.user.toString() !== userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - This order does not belong to you" },
                { status: 403 }
            );
        }

        // ✅ Check if order is delivered
        if (order.status !== "delivered") {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot request return for orders with status: ${order.status}. Only delivered orders can be returned.`
                },
                { status: 400 }
            );
        }

        // ✅ Check if already returned or return requested
        if (order.status === "returned" || order.status === "return_requested") {
            return NextResponse.json(
                {
                    success: false,
                    message: order.status === "returned"
                        ? "This order has already been returned"
                        : "Return request already submitted for this order"
                },
                { status: 400 }
            );
        }

        // ✅ Check return window (e.g., 30 days from delivery)
        const deliveryDate = order.deliveryDate || order.updatedAt;
        const daysSinceDelivery = Math.floor((new Date() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24));
        const returnWindowDays = 30;

        if (daysSinceDelivery > returnWindowDays) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Return window has expired. Returns are only accepted within ${returnWindowDays} days of delivery.`
                },
                { status: 400 }
            );
        }

        // ✅ Create return request
        order.status = "return_requested";
        order.returnReason = reason || "Customer requested return";
        order.returnRequestedAt = new Date();
        await order.save();

        return NextResponse.json({
            success: true,
            message: `Return request submitted successfully. Our team will review it and contact you within 24-48 hours. (${returnWindowDays - daysSinceDelivery} days remaining in return window)`,
            order: {
                _id: order._id,
                status: order.status,
                returnRequestedAt: order.returnRequestedAt,
                daysRemaining: returnWindowDays - daysSinceDelivery
            }
        });

    } catch (error) {
        console.error("Error requesting return:", error);
        return NextResponse.json(
            { success: false, message: "Failed to request return. Please try again." },
            { status: 500 }
        );
    }
}
