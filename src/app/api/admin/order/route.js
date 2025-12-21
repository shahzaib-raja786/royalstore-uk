import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import DeliveryRoute from "@/models/DeliveryRoute";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/adminAuth";

// ✅ GET: All orders (Admin only)
export async function GET() {
  try {
    await connectDB();

    // Verify Admin
    const auth = await verifyAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    // Populate user aur product details
    const orders = await Order.find()
      .populate("user", "name email") // User details (sirf name aur email)
      .populate("items.product", "title price images"); // Product details

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    const auth = await verifyAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const { orderId, routeId, deliveryDate, action } = await req.json();

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    let updateData = {};

    if (action === "add") {
      if (!routeId || !deliveryDate) {
        return NextResponse.json(
          { success: false, message: "routeId and deliveryDate are required for adding" },
          { status: 400 }
        );
      }

      const parsedDate = new Date(deliveryDate);
      if (isNaN(parsedDate)) {
        return NextResponse.json(
          { success: false, message: "Invalid deliveryDate format" },
          { status: 400 }
        );
      }

      const route = await DeliveryRoute.findById(routeId);
      if (!route) {
        return NextResponse.json(
          { success: false, message: "Delivery route not found" },
          { status: 404 }
        );
      }

      updateData = {
        deliveryRoute: routeId,
        deliveryDate: parsedDate,
        status: route.status, // Sync status with route
      };
    } else if (action === "remove") {
      updateData = {
        deliveryRoute: null,
        deliveryDate: null,
      };
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate("deliveryRoute", "city deliveryDate");

    return NextResponse.json({
      success: true,
      message: `Order successfully ${action === "add" ? "updated" : "cleared"}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("PATCH /api/admin/order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
