import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { code, discount, expiry } = body;

    if (!code || !discount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const existing = await Coupon.findOne({ code });
    if (existing) {
      return NextResponse.json(
        { message: "Coupon already exists" },
        { status: 400 }
      );
    }
    const coupon = new Coupon({
      code,
      discountType: "percentage", // default
      discountValue: discount,
      expiryDate: expiry,
    });

    await coupon.save();

    return NextResponse.json(
      { message: "Coupon created successfully", coupon },
      { status: 201 }
    );
  } catch (error) {
    console.error("Coupon create error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
