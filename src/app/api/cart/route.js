import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      productId,
      quantity,
      finalPrice,
      fullPrice,
      selectedCustomizations,
    } = body;
    const product = productId;
    const totalPrice = finalPrice;
    const items = selectedCustomizations ? [{ selectedCustomizations }] : [];

    // validation
    if (!product || !quantity || totalPrice == null || fullPrice == null) {
      return NextResponse.json(
        { message: "Product, quantity, totalPrice and fullPrice are required" },
        { status: 400 }
      );
    }

    // ensure product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // create new cart entry (no merging logic)
    const cart = new Cart({
      user: userId,
      product,
      quantity,
      totalPrice,
      fullPrice,
      items,
    });

    await cart.save();

    return NextResponse.json(
      { message: "Cart updated", cart },
      { status: 200 }
    );
  } catch (err) {
    console.error("Cart API error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}



export async function GET(req) {
  try {
    await connectDB();
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find all cart items for this user
    const cartItems = await Cart.find({ user: userId }).populate("product");

    // Map items to include product info at the same level
    const items = cartItems.map((c) => ({
      _id: c._id,
      product: c.product,
      quantity: c.quantity,
      totalPrice: c.totalPrice,
      fullPrice: c.fullPrice,
      selectedCustomizations: c.items,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Cart API error:", err);
    return new Response(err.message, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🗑 Delete all cart documents for this user
    await Cart.deleteMany({ user: userId });

    return NextResponse.json(
      { message: "Cart cleared successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE cart error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
