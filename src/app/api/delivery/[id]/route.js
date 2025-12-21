import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.js";
import DeliveryRoute from "@/models/DeliveryRoute";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const route = await DeliveryRoute.findById(id);
    if (!route)
      return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });

    const orders = await Order.find({ deliveryRoute: id }).populate("user");
    return NextResponse.json({ success: true, route, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;

    // Delete the route
    await DeliveryRoute.findByIdAndDelete(id);

    // Remove this route from all linked orders
    await Order.updateMany({ deliveryRoute: id }, { $set: { deliveryRoute: null } });

    return NextResponse.json({ success: true, message: "Route deleted and orders unlinked" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
