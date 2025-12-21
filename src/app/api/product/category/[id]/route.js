import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const products = await Product.find({ category: id }).populate("category");
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
