import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
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
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // ✅ Verify order has a return request
        if (order.status !== "return_requested") {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot process - order status is '${order.status}', not 'return_requested'`
                },
                { status: 400 }
            );
        }

        if (action === "approve") {
            // ✅ Approve return - mark as returned
            order.status = "returned";
            order.returnApprovedAt = new Date();

            // Add admin note if provided
            if (adminNote) {
                order.returnReason = `${order.returnReason || "Customer requested return"}\n\nAdmin approved: ${adminNote}`;
            }

            await order.save();

            return NextResponse.json({
                success: true,
                message: "Return request approved. Order has been marked as returned.",
                order: {
                    _id: order._id,
                    status: order.status,
                    returnApprovedAt: order.returnApprovedAt
                }
            });

        } else if (action === "reject") {
            // ✅ Reject return - restore to delivered status
            order.status = "delivered";

            // Add admin note to return reason
            if (adminNote) {
                order.returnReason = `${order.returnReason || "Customer requested return"}\n\nAdmin rejected: ${adminNote}`;
            } else {
                order.returnReason = `${order.returnReason || "Customer requested return"}\n\nAdmin rejected the return request.`;
            }

            await order.save();

            return NextResponse.json({
                success: true,
                message: "Return request rejected. Order status restored to 'delivered'.",
                order: {
                    _id: order._id,
                    status: order.status
                }
            });
        }

    } catch (error) {
        console.error("Error processing return request:", error);
        return NextResponse.json(
            { success: false, message: "Failed to process return request. Please try again." },
            { status: 500 }
        );
    }
}

// ✅ GET endpoint to fetch all return requests
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

        // ✅ Fetch all orders with return_requested status
        const returnRequests = await Order.find({
            status: "return_requested"
        })
            .populate("user", "name email")
            .populate("items.product", "name thumbnail")
            .sort({ returnRequestedAt: -1 }); // Most recent first

        return NextResponse.json({
            success: true,
            count: returnRequests.length,
            requests: returnRequests
        });

    } catch (error) {
        console.error("Error fetching return requests:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch return requests" },
            { status: 500 }
        );
    }
}
