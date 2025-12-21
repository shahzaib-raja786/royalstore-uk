import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import DeliveryRoute from "@/models/DeliveryRoute";
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
        const order = await Order.findById(orderId).populate("deliveryRoute");

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

        // ✅ Check if order is already cancelled
        if (order.status === "cancelled") {
            return NextResponse.json(
                { success: false, message: "Order is already cancelled" },
                { status: 400 }
            );
        }

        // ✅ Check if order is delivered or returned
        if (order.status === "delivered" || order.status === "returned") {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot cancel ${order.status} orders. Please contact support for assistance.`
                },
                { status: 400 }
            );
        }

        // ✅ SMART CANCELLATION LOGIC
        // If order is assigned to a delivery route, create a cancellation request instead
        if (order.deliveryRoute) {
            // Check if already requested
            if (order.status === "cancellation_requested") {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Cancellation request already submitted. Our team will review it shortly."
                    },
                    { status: 400 }
                );
            }

            // Create cancellation request
            order.status = "cancellation_requested";
            order.cancellationReason = reason || "User requested cancellation";
            order.cancellationRequestedAt = new Date();
            order.cancelledBy = "user";
            await order.save();

            return NextResponse.json({
                success: true,
                requestType: "cancellation_request",
                message: "Cancellation request submitted successfully. This order has been assigned to a delivery route, so our team will review your request and contact you shortly.",
                order: {
                    _id: order._id,
                    status: order.status,
                    cancellationRequestedAt: order.cancellationRequestedAt
                }
            });
        }

        // ✅ If not assigned to route, allow direct cancellation
        // Only allow cancellation for pending or processing orders
        if (order.status !== "pending" && order.status !== "processing") {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot cancel orders with status: ${order.status}`
                },
                { status: 400 }
            );
        }

        // ✅ Cancel the order
        order.status = "cancelled";
        order.cancellationReason = reason || "Cancelled by user";
        order.cancellationRequestedAt = new Date();
        order.cancelledBy = "user";
        await order.save();

        return NextResponse.json({
            success: true,
            requestType: "direct_cancellation",
            message: "Order cancelled successfully",
            order: {
                _id: order._id,
                status: order.status,
                cancellationRequestedAt: order.cancellationRequestedAt
            }
        });

    } catch (error) {
        console.error("Error cancelling order:", error);
        return NextResponse.json(
            { success: false, message: "Failed to cancel order. Please try again." },
            { status: 500 }
        );
    }
}
