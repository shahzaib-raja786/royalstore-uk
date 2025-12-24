import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyAdminAuth } from "@/lib/adminAuth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req, { params }) {
    try {
        await connectDB();

        // ✅ Verify admin authentication
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json(
                { success: false, message: auth.error || "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // ✅ Fetch the order
        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // ✅ Check eligibility for refund
        if (order.paymentMethod !== "stripe") {
            return NextResponse.json(
                { success: false, message: "Only Stripe orders can be refunded through this system." },
                { status: 400 }
            );
        }

        if (order.paymentStatus !== "paid") {
            return NextResponse.json(
                { success: false, message: `Payment status is '${order.paymentStatus}', not 'paid'.` },
                { status: 400 }
            );
        }

        if (!order.paymentIntentId) {
            return NextResponse.json(
                { success: false, message: "Payment Intent ID missing. Cannot issue automated refund." },
                { status: 400 }
            );
        }

        if (!["cancelled", "returned"].includes(order.status)) {
            return NextResponse.json(
                { success: false, message: `Order must be 'cancelled' or 'returned' to issue a refund. Current status: '${order.status}'` },
                { status: 400 }
            );
        }

        // ✅ Execute Stripe Refund
        console.log(`Manual admin refund: Initiating Stripe refund for order ${order._id}`);
        const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
        });

        if (refund.status === "succeeded" || refund.status === "pending") {
            order.paymentStatus = "refunded";
            await order.save();

            return NextResponse.json({
                success: true,
                message: "Stripe refund issued successfully.",
                paymentStatus: order.paymentStatus
            });
        } else {
            return NextResponse.json({
                success: false,
                message: `Stripe refund status: ${refund.status}. Please check Stripe dashboard.`,
            }, { status: 400 });
        }

    } catch (error) {
        console.error("Error issuing manual refund:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to issue refund. Please try again." },
            { status: 500 }
        );
    }
}
