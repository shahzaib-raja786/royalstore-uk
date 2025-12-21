import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db.js";
import DeliveryRoute from "@/models/DeliveryRoute";
import Order from "@/models/Order";

export async function GET() {
  await connectDB();
  try {
    const routes = await DeliveryRoute.find().sort({ deliveryDate: -1 });
    return NextResponse.json({ success: true, routes });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const { city, deliveryDate } = await req.json();
    const newRoute = await DeliveryRoute.create({ city, deliveryDate });
    return NextResponse.json({ success: true, route: newRoute });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Update route status (and update all linked orders too)
export async function PATCH(req) {
  await connectDB();
  try {
    const { routeId, status } = await req.json();

    const route = await DeliveryRoute.findById(routeId);
    if (!route) return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });

    route.status = status;
    await route.save();

    // Update all orders linked to this route
    await Order.updateMany(
      { deliveryRoute: route._id },
      { $set: { status } }
    );

    return NextResponse.json({ success: true, message: "Status updated for route & linked orders" });
  } catch (error) {
    console.error("PATCH /api/delivery error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}




