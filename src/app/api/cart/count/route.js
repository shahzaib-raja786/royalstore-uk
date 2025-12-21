// src/app/api/cart/count/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";

export async function GET(req) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Count cart items for this user
    const totalItems = await Cart.countDocuments({ user: userId });

    return NextResponse.json({ totalItems }, { status: 200 });
  } catch (err) {
    console.error("Cart count API error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
