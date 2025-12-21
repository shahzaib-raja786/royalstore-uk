import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User"; // Import User model to register schema
import { connectDB } from "@/lib/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();


    // ✅ user id from middleware header
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - no user id" },
        { status: 401 }
      );
    }

    // ✅ sanitize items (important)
    const sanitizedItems = body.items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      selectedCustomizations: (item.selectedCustomizations || []).map(c => ({
        type: c.type || "N/A",
        option: c.option || "N/A",
        extraPrice: c.extraPrice || 0,
      })),
    }));

    // ✅ create order with sanitized items
    const newOrder = await Order.create({
      user: userId,
      items: sanitizedItems,
      totalPrice: body.totalPrice,
      subtotal: body.subtotal,
      discount: body.discount || 0,
      discountPercentage: body.discountPercentage || 0,
      paymentMethod: body.paymentMethod,
      couponCode: body.couponCode || null,
      shippingAddress: body.shippingAddress,
      status: "pending", // default status
    });

    // ✅ Populate the order to return complete data
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("user", "name email")
      .populate("items.product");

    return NextResponse.json(
      {
        orderId: populatedOrder._id,
        order: populatedOrder,
        message: "Order created successfully"
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ POST /api/order error:", err);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: err.message,
        name: err.name,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // ✅ Extract userId
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    // ✅ Step 1: Get all orders of the user
    const orders = await Order.find({ user: userId }).populate("items.product");

    if (!orders.length) {
      return NextResponse.json({ success: true, ordersWithReview: [], ordersWithoutReview: [] });
    }

    // ✅ Step 2: Get all reviews created by this user
    const userReviews = await Review.find({ user: userId }).select("product order");

    // ✅ Step 3: Create a map of reviewed products by order
    const reviewedProductsByOrder = {};
    userReviews.forEach(review => {
      const orderId = String(review.order);
      const productId = String(review.product);

      if (!reviewedProductsByOrder[orderId]) {
        reviewedProductsByOrder[orderId] = new Set();
      }
      reviewedProductsByOrder[orderId].add(productId);
    });

    // ✅ Step 4: Split orders based on product review completion
    const ordersWithReview = [];
    const ordersWithoutReview = [];

    for (const order of orders) {
      const orderId = String(order._id);
      const reviewedProducts = reviewedProductsByOrder[orderId] || new Set();

      // Count total products and reviewed products in this order
      const totalProducts = order.items.length;
      const reviewedCount = order.items.filter(item =>
        reviewedProducts.has(String(item.product._id))
      ).length;

      // Add review status to each order item
      const orderWithReviewStatus = {
        ...order.toObject(),
        items: order.items.map(item => ({
          ...item.toObject(),
          isReviewed: reviewedProducts.has(String(item.product._id)),
          reviewProgress: {
            reviewed: reviewedCount,
            total: totalProducts,
            percentage: Math.round((reviewedCount / totalProducts) * 100)
          }
        }))
      };

      // If ALL products are reviewed, move to ordersWithReview
      if (reviewedCount === totalProducts && totalProducts > 0) {
        ordersWithReview.push(orderWithReviewStatus);
      } else {
        // If ANY product is not reviewed, keep in ordersWithoutReview
        ordersWithoutReview.push(orderWithReviewStatus);
      }
    }

    // ✅ Step 5: Return result
    return NextResponse.json(
      {
        success: true,
        ordersWithReview,
        ordersWithoutReview,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ GET /api/order error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}