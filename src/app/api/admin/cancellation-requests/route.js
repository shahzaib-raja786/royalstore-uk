import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import DeliveryRoute from "@/models/DeliveryRoute";
import User from "@/models/User";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { verifyAdminAuth } from "@/lib/adminAuth";

export async function POST(req) {
    try {
        await connectDB();

        // ✅ Verify admin authentication
        // ✅ Verify admin authentication
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json(
                { success: false, message: auth.error || "Unauthorized" },
                { status: 401 }
            );
        }

        // ✅ Get request body
        const { orderId, action, adminNote } = await req.json();

        if (!orderId || !action) {
            return NextResponse.json(
                { success: false, message: "Order ID and action are required" },
                { status: 400 }
            );
        }

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { success: false, message: "Action must be 'approve' or 'reject'" },
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

        // ✅ Verify order has a cancellation request
        if (order.status !== "cancellation_requested") {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot process - order status is '${order.status}', not 'cancellation_requested'`
                },
                { status: 400 }
            );
        }

        if (action === "approve") {
            // ✅ Approve cancellation - cancel the order
            order.status = "cancelled";
            order.cancelledBy = "admin";

            // Remove from delivery route if assigned
            if (order.deliveryRoute) {
                order.deliveryRoute = null;
                order.deliveryDate = null;
            }

            // Add admin note if provided
            if (adminNote) {
                order.cancellationReason = `${order.cancellationReason || "User requested cancellation"}\n\nAdmin note: ${adminNote}`;
            }

            await order.save();

            return NextResponse.json({
                success: true,
                message: "Cancellation request approved. Order has been cancelled and removed from delivery route.",
                order: {
                    _id: order._id,
                    status: order.status,
                    deliveryRoute: order.deliveryRoute,
                    cancelledBy: order.cancelledBy
                }
            });

        } else if (action === "reject") {
            // ✅ Reject cancellation - restore to previous status
            // Determine what status to restore to based on delivery route
            let restoredStatus = "pending";

            if (order.deliveryRoute) {
                // If still assigned to route, set to processing or shipped
                restoredStatus = order.deliveryDate && new Date(order.deliveryDate) < new Date()
                    ? "shipped"
                    : "processing";
            }

            order.status = restoredStatus;
            order.cancelledBy = null;

            // Add admin note to cancellation reason
            if (adminNote) {
                order.cancellationReason = `${order.cancellationReason || "User requested cancellation"}\n\nAdmin rejected: ${adminNote}`;
            } else {
                order.cancellationReason = `${order.cancellationReason || "User requested cancellation"}\n\nAdmin rejected the cancellation request.`;
            }

            await order.save();

            return NextResponse.json({
                success: true,
                message: `Cancellation request rejected. Order status restored to '${restoredStatus}'.`,
                order: {
                    _id: order._id,
                    status: order.status,
                    deliveryRoute: order.deliveryRoute
                }
            });
        }

    } catch (error) {
        console.error("Error processing cancellation request:", error);
        return NextResponse.json(
            { success: false, message: "Failed to process cancellation request. Please try again." },
            { status: 500 }
        );
    }
}

// ✅ GET endpoint to fetch all cancellation requests
export async function GET(req) {
    try {
        await connectDB();

        // ✅ Verify admin authentication
        // ✅ Verify admin authentication
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json(
                { success: false, message: auth.error || "Unauthorized" },
                { status: 401 }
            );
        }

        // ✅ Fetch all orders with cancellation_requested status
        const cancellationRequests = await Order.find({
            status: "cancellation_requested"
        })
            .populate("user", "name email")
            .populate("deliveryRoute", "city deliveryDate status")
            .populate("items.product", "name thumbnail")
            .sort({ cancellationRequestedAt: -1 }); // Most recent first

        return NextResponse.json({
            success: true,
            count: cancellationRequests.length,
            requests: cancellationRequests
        });

    } catch (error) {
        console.error("Error fetching cancellation requests:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch cancellation requests" },
            { status: 500 }
        );
    }
}
