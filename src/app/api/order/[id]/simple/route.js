import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const paramsData = await params;
    const orderId = paramsData.id;
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get the order with populated products
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate("items.product", "name thumbnail");

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Extract only essential information
    const simplifiedOrder = {
      _id: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      deliveryDate: order.deliveryDate,

      // Shipping Information
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

      // Products with only essential info
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

    return NextResponse.json({
      success: true,
      order: simplifiedOrder
    });

  } catch (error) {
    console.error("Error fetching simplified order:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
