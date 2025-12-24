import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { verifyAdminAuth } from "@/lib/adminAuth";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ PATCH: Update order status (Admin only)
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const auth = await verifyAdminAuth();

    if (!auth.authenticated) {
      return Response.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const paramsData = await params;
    const { status } = await req.json();

    // Fetch the order first to check current payment status
    const order = await Order.findById(paramsData.id);
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      paramsData.id,
      { status },
      { new: true }
    )
      .populate("user", "name email")
      .populate("items.product", "name price image");

    return Response.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
