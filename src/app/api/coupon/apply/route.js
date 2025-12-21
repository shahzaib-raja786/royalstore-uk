import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  await connectDB();
  try {
    const { code, productId, categoryId, basePrice } = await req.json();

    if (!code || !basePrice) {
      return NextResponse.json({ message: "Coupon code and basePrice required" }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) {
      return NextResponse.json({ message: "Invalid or inactive coupon" }, { status: 400 });
    }
    const discountPercentage = coupon.discountValue;
    // Expiry check
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ message: "Coupon expired" }, { status: 400 });
    }

    // Check appliesTo logic
    if (coupon.appliesTo === "product" && coupon.productId?.toString() !== productId) {
      return NextResponse.json({ message: "Coupon not valid for this product" }, { status: 400 });
    }

    if (coupon.appliesTo === "category" && coupon.categoryId?.toString() !== categoryId) {
      return NextResponse.json({ message: "Coupon not valid for this category" }, { status: 400 });
    }

    // Apply discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (basePrice * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    }
    
    const finalPrice = Math.max(basePrice - discountAmount, 0);

    return NextResponse.json({
      message: "Coupon applied successfully",
      discountAmount,
      finalPrice,
      discountPercentage,
    });
  } catch (error) {
    console.error("Coupon apply error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
