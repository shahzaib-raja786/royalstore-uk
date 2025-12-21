import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db.js";
import DeliveryRoute from "@/models/DeliveryRoute";
import Order from "@/models/Order";

export async function PATCH(req) {
  await connectDB();
  try {
    const { routeId, orderId, action } = await req.json(); // action = "add" or "remove"

    if (!routeId || !orderId) {
      return NextResponse.json(
        { success: false, message: "routeId and orderId are required" },
        { status: 400 }
      );
    }

    const route = await DeliveryRoute.findById(routeId);
    const order = await Order.findById(orderId);

    if (!route || !order) {
      return NextResponse.json(
        { success: false, message: "Route or Order not found" },
        { status: 404 }
      );
    }

    if (action === "add") {
      order.deliveryRoute = route._id;
      await order.save();
    } else if (action === "remove") {
      order.deliveryRoute = null;
      await order.save();
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        action === "add"
          ? "Order linked to delivery route successfully"
          : "Order removed from delivery route successfully",
    });
  } catch (error) {
    console.error("Error in PATCH /api/delivery/order-link:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
