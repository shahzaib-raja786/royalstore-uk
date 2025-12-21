import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    // 🟢 query param nikalna
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID required" },
        { status: 400 }
      );
    }

    // 🟢 sirf ek product ke reviews fetch karo
    const reviews = await Review.find({ product: productId })
      .populate("user", "name") // user ka naam dikhane ke liye
      .sort({ createdAt: -1 }); // latest first

    return NextResponse.json({ success: true, reviews }, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/product/review error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    );
  }
}
