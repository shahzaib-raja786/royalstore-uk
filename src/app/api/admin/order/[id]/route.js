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
// get specific order
export async function GET(req, { params }) {
  try {
    await connectDB();

    const auth = await verifyAdminAuth();

    if (!auth.authenticated) {
      return Response.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const paramsData = await params;
    const order = await Order.findById(paramsData.id).populate("items.product", "name thumbnail");

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Transform to simplified format for frontend
    const simplifiedOrder = {
      ...order._doc,
      shippingInfo: {
        customerName: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim(),
        email: order.shippingAddress?.email,
        phone: order.shippingAddress?.phone,
        address: {
          street: order.shippingAddress?.streetAddress,
          city: order.shippingAddress?.city,
          postalCode: order.shippingAddress?.postalCode,
          notes: order.shippingAddress?.notes
        }
      },
      products: order.items.map(item => ({
        productName: item.product?.name || "Product Name Not Available",
        image: item.product?.thumbnail,
        quantity: item.quantity,
        price: item.priceAtPurchase,
        total: item.quantity * item.priceAtPurchase,
        customizations: item.selectedCustomizations?.map(custom => ({
          type: custom.type,
          option: custom.option,
          extraPrice: custom.extraPrice
        })) || []
      }))
    };

    return Response.json({ success: true, order: simplifiedOrder }, { status: 200 });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
