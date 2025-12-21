import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

// GET handler - Fetch order details with user verification
export async function GET(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    console.log("Fetching order with ID:", id);

    // ✅ Extract user id from middleware header
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - no user id" },
        { status: 401 }
      );
    }

    // ✅ Find the order and populate product details
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("items.product");

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // ✅ Check if the order belongs to the current user
    if (order.user._id.toString() !== userId) {
      return NextResponse.json(
        { error: "Access denied - this order doesn't belong to you" },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("GET order error:", err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT handler - Update order status and delivery date
export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const { status, deliveryDate } = await req.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, deliveryDate },
      { new: true }
    );

    if (!updatedOrder) {
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedOrder), { status: 200 });
  } catch (err) {
    console.error("PUT order error:", err);
    return new Response(JSON.stringify({ error: "Failed to update order" }), { status: 500 });
  }
}
