import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

// ✅ Get All Reviews (for current user)
export async function GET(req) {
  try {
    await connectDB();
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const reviews = await Review.find({ user: userId })
      .populate("product", "name image price");

    return NextResponse.json({ success: true, reviews }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ✅ Add New Review
export async function POST(req) {
  try {
    await connectDB();
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { product,order, rating, comment, images } = await req.json();
    console.log("Received review data:", { product,order, rating, comment, images });

    const review = new Review({
      product,
      order,
      user: userId, // 🟢 yahan userId use karna hai
      rating,
      comment,
      images, // 🟢 Array of Cloudinary URLs
    });

    await review.save();

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
